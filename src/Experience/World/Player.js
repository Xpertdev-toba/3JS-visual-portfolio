import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Experience } from '../Experience.js'

/**
 * Player - Robot character with proper physics grounding
 */
export class Player {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.physics = this.experience.physics

    // Config
    this.jumpForce = 8
    this.canJump = false
    this.isMoving = false

    // Input
    this.keys = { forward: false, backward: false, left: false, right: false, jump: false }

    this.setMesh()
    this.setPhysics()
    this.setControls()

    // Pre-allocated vectors (avoid per-frame GC)
    this._forward = new THREE.Vector3()
    this._right = new THREE.Vector3()
    this._moveDir = new THREE.Vector3()
    this._up = new THREE.Vector3(0, 1, 0)
  }

  setMesh() {
    this.mesh = new THREE.Group()
    this.mesh.name = 'Player'

    // Shared materials (reuse for perf)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4FC3F7, metalness: 0.5, roughness: 0.3, flatShading: true })
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x37474F, metalness: 0.4, roughness: 0.5, flatShading: true })
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF })

    // Body
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.5, 3, 6), bodyMat)
    body.position.y = 0.55
    body.castShadow = true
    this.mesh.add(body)

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), bodyMat)
    head.position.y = 1.1
    head.castShadow = true
    this.mesh.add(head)

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 4, 4)
    const leftEye = new THREE.Mesh(eyeGeo, glowMat)
    leftEye.position.set(-0.08, 1.15, 0.2)
    this.mesh.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeo, glowMat)
    rightEye.position.set(0.08, 1.15, 0.2)
    this.mesh.add(rightEye)

    // Antenna
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 3), darkMat)
    antenna.position.set(0, 1.45, 0)
    this.mesh.add(antenna)

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), glowMat)
    tip.position.set(0, 1.58, 0)
    this.mesh.add(tip)

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.06, 0.25, 2, 4)
    this.leftArm = new THREE.Mesh(armGeo, bodyMat)
    this.leftArm.position.set(-0.4, 0.55, 0)
    this.leftArm.rotation.z = 0.2
    this.mesh.add(this.leftArm)

    this.rightArm = new THREE.Mesh(armGeo, bodyMat)
    this.rightArm.position.set(0.4, 0.55, 0)
    this.rightArm.rotation.z = -0.2
    this.mesh.add(this.rightArm)

    // Legs
    const legGeo = new THREE.CapsuleGeometry(0.08, 0.15, 2, 4)
    this.leftLeg = new THREE.Mesh(legGeo, darkMat)
    this.leftLeg.position.set(-0.12, 0.12, 0)
    this.mesh.add(this.leftLeg)

    this.rightLeg = new THREE.Mesh(legGeo, darkMat)
    this.rightLeg.position.set(0.12, 0.12, 0)
    this.mesh.add(this.rightLeg)

    // Start position (near spawn marker in larger world)
    this.mesh.position.set(0, 6, 50)
    this.scene.add(this.mesh)
  }

  setPhysics() {
    // Sphere collider
    const shape = new CANNON.Sphere(0.4)
    this.body = new CANNON.Body({
      mass: 5,
      shape,
      position: new CANNON.Vec3(0, 6, 50),
      linearDamping: 0.3,
      angularDamping: 0.99,
      fixedRotation: true,
      material: this.physics.defaultMaterial
    })

    // CRITICAL: Player body must never sleep, otherwise velocity changes are ignored
    this.body.allowSleep = false
    this.body.sleepState = 0 // AWAKE

    this.body.addEventListener('collide', (e) => {
      const contact = e.contact
      // Determine which body is self and get correct normal direction
      const normal = new CANNON.Vec3()
      if (contact.bi.id === this.body.id) {
        contact.ni.negate(normal)
      } else {
        normal.copy(contact.ni)
      }
      // If normal points upward, we're on ground
      if (normal.y > 0.3) {
        this.canJump = true
      }
    })

    this.physics.world.addBody(this.body)
    console.log('🤖 Player physics body added, id:', this.body.id, 'sleepState:', this.body.sleepState)
  }

  setControls() {
    this._onKeyDown = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = true
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = true
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true
      if (e.code === 'Space') { this.keys.jump = true; e.preventDefault() }
    }

    this._onKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false
      if (e.code === 'Space') this.keys.jump = false
    }

    // Use window-level capture to guarantee we get events even if focus is elsewhere
    window.addEventListener('keydown', this._onKeyDown, true)
    window.addEventListener('keyup', this._onKeyUp, true)
    console.log('🎮 Player controls registered')
  }

  teleport(pos) {
    this.body.position.set(pos.x, pos.y, pos.z)
    this.body.velocity.set(0, 0, 0)
    this.mesh.position.set(pos.x, pos.y, pos.z)
  }

  update() {
    // Get camera direction vectors
    // Must call updateMatrixWorld first since this runs BEFORE render
    const camera = this.experience.camera?.instance
    if (camera) {
      camera.updateMatrixWorld()
    }

    // Compute forward/right from camera world matrix
    const forward = this._forward
    const right = this._right

    if (camera) {
      // Camera's -Z axis in world space (where it's looking)
      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()

      // Camera's X axis in world space
      right.crossVectors(forward, this._up).normalize()
    } else {
      forward.set(0, 0, -1)
      right.set(1, 0, 0)
    }

    // Input direction (keyboard + touch)
    let mx = 0, mz = 0
    if (this.keys.forward) mz += 1
    if (this.keys.backward) mz -= 1
    if (this.keys.left) mx -= 1
    if (this.keys.right) mx += 1

    // Merge touch joystick input
    const touch = this.experience.touchControls
    if (touch?.isEnabled && touch.moveJoystick.active) {
      mx += touch.getInput().moveX
      mz += touch.getInput().moveY
    }
    if (touch?.isEnabled && touch.jumpRequested) {
      this.keys.jump = true
    }

    this.isMoving = Math.abs(mx) > 0 || Math.abs(mz) > 0

    // Always wake the body so velocity changes take effect
    this.body.wakeUp()

    // Direct velocity control (speed = 15, was 6)
    const speed = 15
    if (this.isMoving) {
      const moveDir = this._moveDir
      moveDir.set(0, 0, 0)
      moveDir.addScaledVector(forward, mz)
      moveDir.addScaledVector(right, mx)
      moveDir.normalize()

      // Use .set() to ensure velocity is properly applied
      const vy = this.body.velocity.y // preserve vertical velocity (gravity/jump)
      this.body.velocity.set(moveDir.x * speed, vy, moveDir.z * speed)

      // Face movement direction
      const angle = Math.atan2(moveDir.x, moveDir.z)
      const diff = ((angle - this.mesh.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI
      this.mesh.rotation.y += diff * 0.15
    } else {
      // Decelerate when not pressing keys (preserve Y for gravity)
      this.body.velocity.set(
        this.body.velocity.x * 0.85,
        this.body.velocity.y,
        this.body.velocity.z * 0.85
      )
    }

    // Jump (half force while moving)
    if (this.keys.jump && this.canJump) {
      this.body.velocity.y = this.isMoving ? this.jumpForce * 0.5 : this.jumpForce
      this.canJump = false
    }

    // Sync mesh to physics body
    this.mesh.position.copy(this.body.position)
    // Offset mesh down so feet touch ground (sphere center is at radius 0.4)
    this.mesh.position.y -= 0.4

    // Simple walk animation
    if (this.isMoving && this.canJump) {
      const t = performance.now() * 0.008
      const swing = Math.sin(t * 10) * 0.25
      this.leftLeg.rotation.x = swing
      this.rightLeg.rotation.x = -swing
      this.leftArm.rotation.x = -swing * 0.5
      this.rightArm.rotation.x = swing * 0.5
    } else {
      this.leftLeg.rotation.x *= 0.85
      this.rightLeg.rotation.x *= 0.85
      this.leftArm.rotation.x *= 0.85
      this.rightArm.rotation.x *= 0.85
    }

    // Respawn if fallen off world
    if (this.body.position.y < -50) {
      this.teleport(new THREE.Vector3(0, 10, 50))
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown, true)
    window.removeEventListener('keyup', this._onKeyUp, true)
    this.scene.remove(this.mesh)
    this.mesh.traverse(c => {
      if (c.isMesh) { c.geometry?.dispose(); c.material?.dispose() }
    })
    if (this.body) this.physics.world.removeBody(this.body)
  }
}
