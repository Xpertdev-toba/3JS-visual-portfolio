import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * ThirdPersonCamera with:
 * - Mouse drag rotation, scroll zoom
 * - F key toggles bird's-eye overview (zooms way out, looks down)
 * - Extended zoom range (3 → 200) for forest overview
 */
export class ThirdPersonCamera {
  constructor(camera, canvas, options = {}) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.sizes = this.experience.sizes
    this.canvas = canvas
    this.camera = camera

    // Camera settings
    this.settings = {
      distance: options.distance ?? 8,
      height: options.height ?? 4,
      smoothness: options.smoothing ?? 0.08,
      rotationSmoothness: options.rotationSmoothness ?? 0.1,
      minDistance: options.minDistance ?? 3,
      maxDistance: options.maxDistance ?? 200,
      minPitch: options.minPolarAngle ?? -0.3,
      maxPitch: options.maxPolarAngle ?? 1.4
    }

    // State
    this.currentPosition = new THREE.Vector3()
    this.targetPosition = new THREE.Vector3()
    this.lookAtPosition = new THREE.Vector3()
    this.currentLookAt = new THREE.Vector3()

    // Orbit angles
    this.theta = 0
    this.phi = 0.5
    this.targetDistance = this.settings.distance

    // Overview / bird's-eye mode (F key)
    this.overviewMode = false
    this.savedDistance = this.settings.distance
    this.savedPhi = 0.5
    this.overviewDistance = 600
    this.overviewPhi = 1.3  // near top-down

    // Mouse/touch input
    this.isPointerDown = false
    this.previousPointer = { x: 0, y: 0 }
    this.initialized = false

    this.camera.position.set(0, 10, 15)
    this.setControls()
  }

  setControls() {
    // Store bound handlers for cleanup
    this._onPointerDown = (e) => this.onPointerDown(e)
    this._onPointerMove = (e) => this.onPointerMove(e)
    this._onPointerUp = () => this.onPointerUp()
    this._onWheel = (e) => this.onWheel(e)
    this._onTouchStart = (e) => this.onTouchStart(e)
    this._onTouchMove = (e) => this.onTouchMove(e)
    this._onTouchEnd = () => this.onTouchEnd()
    this._onKeyDown = (e) => { if (e.code === 'KeyF') this.toggleOverview() }

    this.canvas.addEventListener('pointerdown', this._onPointerDown)
    window.addEventListener('pointermove', this._onPointerMove)
    window.addEventListener('pointerup', this._onPointerUp)
    this.canvas.addEventListener('wheel', this._onWheel, { passive: true })

    // Touch pinch
    this.touches = []
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true })
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: true })
    this.canvas.addEventListener('touchend', this._onTouchEnd)

    // F key for overview toggle
    document.addEventListener('keydown', this._onKeyDown)
  }

  toggleOverview() {
    this.overviewMode = !this.overviewMode

    if (this.overviewMode) {
      // Save current view
      this.savedDistance = this.targetDistance
      this.savedPhi = this.phi
      // Zoom way out and look down
      this.targetDistance = this.overviewDistance
      this.phi = this.overviewPhi
      console.log('🔭 Overview mode ON')
    } else {
      // Restore player-follow view
      this.targetDistance = this.savedDistance
      this.phi = this.savedPhi
      console.log('🔭 Overview mode OFF')
    }
  }

  onPointerDown(event) {
    this.isPointerDown = true
    this.previousPointer.x = event.clientX
    this.previousPointer.y = event.clientY
  }

  onPointerMove(event) {
    if (!this.isPointerDown) return

    const deltaX = event.clientX - this.previousPointer.x
    const deltaY = event.clientY - this.previousPointer.y

    this.theta -= deltaX * 0.005
    this.phi += deltaY * 0.005
    this.phi = Math.max(this.settings.minPitch, Math.min(this.settings.maxPitch, this.phi))

    this.previousPointer.x = event.clientX
    this.previousPointer.y = event.clientY
  }

  onPointerUp() {
    this.isPointerDown = false
  }

  onWheel(event) {
    // Scale zoom speed by distance so it feels proportional
    const zoomSpeed = Math.max(0.01, this.targetDistance * 0.05)
    this.targetDistance += event.deltaY > 0 ? zoomSpeed : -zoomSpeed
    this.targetDistance = Math.max(
      this.settings.minDistance,
      Math.min(this.settings.maxDistance, this.targetDistance)
    )

    // If manually zooming, exit overview mode
    if (this.overviewMode && this.targetDistance < this.overviewDistance * 0.5) {
      this.overviewMode = false
    }
  }

  onTouchStart(event) {
    this.touches = [...event.touches]
  }

  onTouchMove(event) {
    if (event.touches.length === 2 && this.touches.length === 2) {
      const prevDist = Math.hypot(
        this.touches[0].clientX - this.touches[1].clientX,
        this.touches[0].clientY - this.touches[1].clientY
      )
      const currDist = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      )
      this.targetDistance -= (currDist - prevDist) * 0.05
      this.targetDistance = Math.max(
        this.settings.minDistance,
        Math.min(this.settings.maxDistance, this.targetDistance)
      )
    }
    this.touches = [...event.touches]
  }

  onTouchEnd() {
    this.touches = []
  }

  follow(target, deltaTime) {
    if (!target) return

    const targetPos = target.position.clone()

    // Apply touch camera joystick input
    const touch = this.experience.touchControls
    if (touch?.isEnabled && touch.cameraJoystick.active) {
      const input = touch.getInput()
      this.theta -= input.cameraX
      this.phi += input.cameraY
      this.phi = Math.max(this.settings.minPitch, Math.min(this.settings.maxPitch, this.phi))
    }

    // Smoothly interpolate distance
    const distance = THREE.MathUtils.lerp(
      this.settings.distance,
      this.targetDistance,
      this.settings.smoothness * 2
    )
    this.settings.distance = distance

    // Spherical coordinates → Cartesian
    const offsetX = Math.sin(this.theta) * Math.cos(this.phi) * distance
    const offsetY = Math.sin(this.phi) * distance + this.settings.height
    const offsetZ = Math.cos(this.theta) * Math.cos(this.phi) * distance

    this.targetPosition.set(
      targetPos.x + offsetX,
      targetPos.y + offsetY,
      targetPos.z + offsetZ
    )

    // First frame: snap immediately
    if (!this.initialized) {
      this.currentPosition.copy(this.targetPosition)
      this.currentLookAt.copy(targetPos)
      this.currentLookAt.y += 1
      this.initialized = true
    }

    // Smooth camera movement (faster smoothing when in overview for responsive feel)
    const smooth = this.overviewMode ? this.settings.smoothness * 3 : this.settings.smoothness
    this.currentPosition.lerp(this.targetPosition, smooth)
    this.camera.position.copy(this.currentPosition)

    // Look at target
    this.lookAtPosition.copy(targetPos)
    this.lookAtPosition.y += 1
    this.currentLookAt.lerp(this.lookAtPosition, this.settings.rotationSmoothness)
    this.camera.lookAt(this.currentLookAt)
  }

  resize() {
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()
  }

  update() {}

  getForwardDirection() {
    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(this.camera.quaternion)
    forward.y = 0
    forward.normalize()
    return forward
  }

  getRightDirection() {
    const right = new THREE.Vector3(1, 0, 0)
    right.applyQuaternion(this.camera.quaternion)
    right.y = 0
    right.normalize()
    return right
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown)
    window.removeEventListener('pointermove', this._onPointerMove)
    window.removeEventListener('pointerup', this._onPointerUp)
    this.canvas.removeEventListener('wheel', this._onWheel)
    this.canvas.removeEventListener('touchstart', this._onTouchStart)
    this.canvas.removeEventListener('touchmove', this._onTouchMove)
    this.canvas.removeEventListener('touchend', this._onTouchEnd)
    document.removeEventListener('keydown', this._onKeyDown)
  }
}
