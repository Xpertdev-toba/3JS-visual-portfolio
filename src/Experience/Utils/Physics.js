import * as CANNON from 'cannon-es'
import { Experience } from '../Experience.js'

/**
 * Physics — Enhanced Cannon-ES Physics System
 * ═══════════════════════════════════════════════════════════════════════════
 * Provides physics simulation with:
 * - Optimized broadphase and solver settings
 * - Heightfield terrain collisions
 * - Character physics with ground detection
 * - Raycast utilities for interaction and grounding
 * - Material presets for different surface types
 */
export class Physics {
  constructor() {
    this.experience = new Experience()
    this.time = this.experience.time

    this.zoneBodies = []
    this.dynamicBodies = [] // Track dynamic bodies for cleanup

    // Physics configuration
    this.config = {
      gravity: -20,           // Stronger gravity for snappy movement
      solverIterations: 8,    // Balance accuracy vs performance
      timestep: 1 / 60,
      maxSubSteps: 3,
    }

    this.setWorld()
    this.setMaterials()
    this.setGround()
  }

  setWorld() {
    this.world = new CANNON.World()
    this.world.gravity.set(0, this.config.gravity, 0)

    // SAP Broadphase — optimal for scenes with many static objects
    this.world.broadphase = new CANNON.SAPBroadphase(this.world)

    // Allow sleeping for performance (static objects go dormant)
    this.world.allowSleep = true

    // Solver configuration
    this.world.solver.iterations = this.config.solverIterations
    this.world.solver.tolerance = 0.001

    // Enable faster AABB checks
    this.world.quatNormalizeSkip = 0
    this.world.quatNormalizeFast = false
  }

  setMaterials() {
    // Default material (general surfaces)
    this.defaultMaterial = new CANNON.Material('default')

    // Player material (less friction for responsive controls)
    this.playerMaterial = new CANNON.Material('player')

    // Slippery material (ice, wet surfaces)
    this.slipperyMaterial = new CANNON.Material('slippery')

    // Bouncy material (trampolines, jump pads)
    this.bouncyMaterial = new CANNON.Material('bouncy')

    // Contact materials
    this.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      { friction: 0.4, restitution: 0.1 }
    )

    this.playerGroundContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.defaultMaterial,
      { friction: 0.3, restitution: 0.0 }
    )

    this.slipperyContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.slipperyMaterial,
      { friction: 0.02, restitution: 0.0 }
    )

    this.bouncyContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.bouncyMaterial,
      { friction: 0.3, restitution: 0.8 }
    )

    // Add contact materials to world
    this.world.addContactMaterial(this.defaultContactMaterial)
    this.world.addContactMaterial(this.playerGroundContact)
    this.world.addContactMaterial(this.slipperyContact)
    this.world.addContactMaterial(this.bouncyContact)

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

  /**
   * Add a dynamic body for tracking/cleanup
   */
  addDynamicBody(body) {
    this.world.addBody(body)
    this.dynamicBodies.push(body)
    return body
  }

  /**
   * Remove a dynamic body
   */
  removeDynamicBody(body) {
    const index = this.dynamicBodies.indexOf(body)
    if (index !== -1) {
      this.dynamicBodies.splice(index, 1)
    }
    this.world.removeBody(body)
  }

  /**
   * Raycast from a point in a direction
   * Returns { hit: boolean, point: Vec3, normal: Vec3, body: Body, distance: number }
   */
  raycast(from, direction, maxDistance = 100) {
    const ray = new CANNON.Ray(
      new CANNON.Vec3(from.x, from.y, from.z),
      new CANNON.Vec3(
        from.x + direction.x * maxDistance,
        from.y + direction.y * maxDistance,
        from.z + direction.z * maxDistance
      )
    )

    ray.mode = CANNON.Ray.CLOSEST
    ray.skipBackfaces = true

    const result = new CANNON.RaycastResult()
    ray.intersectWorld(this.world, { result })

    if (result.hasHit) {
      return {
        hit: true,
        point: result.hitPointWorld,
        normal: result.hitNormalWorld,
        body: result.body,
        distance: result.distance
      }
    }

    return { hit: false, point: null, normal: null, body: null, distance: maxDistance }
  }

  /**
   * Ground check - raycast downward from a position
   */
  groundCheck(position, distance = 2) {
    return this.raycast(
      { x: position.x, y: position.y + 0.1, z: position.z },
      { x: 0, y: -1, z: 0 },
      distance
    )
  }

  update() {
    // Step physics world - use config values for stability
    const fixedTimeStep = this.config.timestep
    const maxDelta = 0.1 // Cap to prevent spiral of death
    const deltaTime = Math.min(this.time.delta / 1000, maxDelta)
    
    this.world.step(fixedTimeStep, deltaTime, this.config.maxSubSteps)
  }

  /**
   * Clean up physics resources
   */
  dispose() {
    // Remove all dynamic bodies
    for (const body of this.dynamicBodies) {
      this.world.removeBody(body)
    }
    this.dynamicBodies = []

    // Remove zone colliders
    this.removeZoneColliders()

    // Remove heightfield
    if (this.heightfieldBody) {
      this.world.removeBody(this.heightfieldBody)
      this.heightfieldBody = null
    }

    // Remove ground
    if (this.groundBody) {
      this.world.removeBody(this.groundBody)
      this.groundBody = null
    }

    console.log('🧹 Physics disposed')
  }
}
