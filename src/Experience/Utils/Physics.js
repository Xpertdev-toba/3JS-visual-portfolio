import * as CANNON from 'cannon-es'
import { Experience } from '../Experience.js'

export class Physics {
  constructor() {
    this.experience = new Experience()
    this.time = this.experience.time

    this.zoneBodies = []

    this.setWorld()
    this.setGround()
  }

  setWorld() {
    this.world = new CANNON.World()
    this.world.gravity.set(0, -15, 0) // Slightly stronger gravity for responsive feel
    
    // Improve performance
    this.world.broadphase = new CANNON.SAPBroadphase(this.world)
    this.world.allowSleep = true
    
    // Reduce solver iterations for performance
    this.world.solver.iterations = 5

    // Default material
    this.defaultMaterial = new CANNON.Material('default')
    this.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.5,
        restitution: 0.1
      }
    )
    this.world.addContactMaterial(this.defaultContactMaterial)
    this.world.defaultContactMaterial = this.defaultContactMaterial
  }

  setGround() {
    // Large flat ground plane at y=0 as fallback
    const groundShape = new CANNON.Plane()
    this.groundBody = new CANNON.Body({
      mass: 0,
      shape: groundShape,
      material: this.defaultMaterial
    })
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.groundBody.position.set(0, 0, 0)
    this.world.addBody(this.groundBody)
  }

  /**
   * Create a heightfield collider that matches the visual terrain mesh.
   * heightData: Float32Array of (segs+1)*(segs+1) Y values (row-major, same order as PlaneGeometry vertices)
   * size: total world size of terrain (e.g. 100)
   * segs: number of segments per side (e.g. 32)
   */
  setHeightfield(heightData, size, segs) {
    // Remove flat ground — heightfield replaces it
    if (this.groundBody) {
      this.world.removeBody(this.groundBody)
      this.groundBody = null
    }

    const cols = segs + 1 // vertices per row
    const rows = segs + 1 // vertices per column
    const elementSize = size / segs // distance between adjacent height samples

    // CANNON.Heightfield expects a 2D array: matrix[col][row] where
    // col -> x axis, row -> z axis.
    // Three.js PlaneGeometry vertices after rotateX(-PI/2) are laid out:
    //   i = row * cols + col  with x from -size/2..+size/2, z from +size/2..-size/2
    // cannon-es Heightfield has x along columns and z along rows,
    // origin at the body position.

    const matrix = []
    for (let col = 0; col < cols; col++) {
      const columnData = []
      for (let row = 0; row < rows; row++) {
        // Three.js PlaneGeometry: vertex index = row * cols + col
        // After rotateX(-PI/2), z goes from +size/2 (row 0) to -size/2 (row = segs)
        // Heightfield row 0 = -z side, so we invert the row
        const srcRow = rows - 1 - row
        const idx = srcRow * cols + col
        columnData.push(heightData[idx] || 0)
      }
      matrix.push(columnData)
    }

    const hfShape = new CANNON.Heightfield(matrix, { elementSize })
    this.heightfieldBody = new CANNON.Body({
      mass: 0, shape: hfShape, material: this.defaultMaterial
    })

    // Heightfield local axes: x along cols, y along rows, z = height values.
    // Rotate -90° around X so local z → world Y (up).
    // After rotation, local y → world -z, so body z = +size/2 to make grid span -size/2..+size/2.
    this.heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.heightfieldBody.position.set(-size / 2, 0, size / 2)

    this.world.addBody(this.heightfieldBody)
    console.log(`⛰️ Heightfield collider: ${cols}x${rows}, elementSize=${elementSize.toFixed(2)}`)
  }

  /**
   * Add zone-specific elevated ground colliders to match terrain mesh
   * Called by TestEnvironment after zones are defined
   */
  addZoneColliders(zones) {
    // Remove previous zone bodies
    this.removeZoneColliders()

    // With heightfield active, zone colliders are no longer needed as the
    // heightfield already encodes zone elevations. Skip them.
    if (this.heightfieldBody) return

    for (const [id, zone] of Object.entries(zones)) {
      if (Math.abs(zone.elevation) < 0.01) continue // skip flat zones, covered by ground plane

      const r = zone.radius
      // Thick box so player can't clip through from below
      const halfThick = 0.5
      const shape = new CANNON.Box(new CANNON.Vec3(r, halfThick, r))
      const body = new CANNON.Body({
        mass: 0,
        shape,
        material: this.defaultMaterial
      })
      body.position.set(zone.center.x, zone.elevation - halfThick, zone.center.z)
      this.world.addBody(body)
      this.zoneBodies.push(body)
    }
  }

  removeZoneColliders() {
    for (const body of this.zoneBodies) {
      this.world.removeBody(body)
    }
    this.zoneBodies = []
  }

  update() {
    // Step physics world - fixed timestep for stability
    this.world.step(1 / 60, Math.min(this.time.delta / 1000, 0.1), 3)
  }
}
