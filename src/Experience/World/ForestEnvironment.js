import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Experience } from '../Experience.js'

/**
 * ForestEnvironment - GLB forest world properly scaled and optimized
 * Auto-scales the model to fit a ~80x80 unit world area
 */
export class ForestEnvironment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.physics = this.experience.physics

    this.group = new THREE.Group()
    this.group.name = 'ForestEnvironment'
    this.portals = []
    this.landmarks = []
    this.bodies = []

    // Target world size: model should span about 80 units on longest axis
    this.targetWorldSize = 80

    // Zone config
    this.zones = {
      HUB: { name: 'Central Hub', center: new THREE.Vector3(0, 0, 0), radius: 8, color: 0xFFD700 },
      Z1: { name: 'IT Services', center: new THREE.Vector3(0, 0, -18), radius: 6, color: 0x4A90D9 },
      Z2: { name: 'Game Dev', center: new THREE.Vector3(-18, 0, 0), radius: 6, color: 0x9B59B6 },
      Z3: { name: 'AI Automation', center: new THREE.Vector3(18, 0, 0), radius: 6, color: 0xE91E63 },
      Z4: { name: 'Media', center: new THREE.Vector3(-15, 0, 18), radius: 6, color: 0xFF9800 },
      Z5: { name: 'Marketing', center: new THREE.Vector3(15, 0, 18), radius: 6, color: 0x4CAF50 },
      Z6: { name: 'About', center: new THREE.Vector3(-10, 0, 30), radius: 5, color: 0xFFB74D },
      Z7: { name: 'Contact', center: new THREE.Vector3(10, 0, 30), radius: 5, color: 0x26C6DA },
    }

    this.loadForest()
    this.createZoneMarkers()
    this.createPortals()

    this.scene.add(this.group)
    console.log('🌳 Forest Environment loaded')
  }

  loadForest() {
    const gltf = this.resources.items.forestEnvironment
    if (!gltf) {
      console.warn('⚠️ Forest GLB not available')
      return
    }

    const model = gltf.scene.clone()

    // Measure the raw model
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)

    console.log(`📐 Raw model: ${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)}`)
    console.log(`📐 Raw center: (${center.x.toFixed(1)}, ${center.y.toFixed(1)}, ${center.z.toFixed(1)})`)

    // Calculate scale to fit target world size
    const maxHorizontal = Math.max(size.x, size.z)
    const scale = this.targetWorldSize / maxHorizontal
    model.scale.setScalar(scale)

    console.log(`📐 Applied scale: ${scale.toFixed(4)}`)

    // Recalculate bounds after scaling
    const scaledBox = new THREE.Box3().setFromObject(model)
    const scaledCenter = new THREE.Vector3()
    scaledBox.getCenter(scaledCenter)

    // Center horizontally and align bottom to y=0
    model.position.x = -scaledCenter.x
    model.position.z = -scaledCenter.z
    model.position.y = -scaledBox.min.y

    // Verify final bounds
    const finalBox = new THREE.Box3().setFromObject(model)
    const finalSize = new THREE.Vector3()
    finalBox.getSize(finalSize)
    console.log(`✅ Final model: ${finalSize.x.toFixed(1)} x ${finalSize.y.toFixed(1)} x ${finalSize.z.toFixed(1)}, ground at y=${finalBox.min.y.toFixed(2)}`)

    // Optimize meshes aggressively
    let meshCount = 0
    const mergeableMaterials = new Map()

    model.traverse((child) => {
      if (child.isMesh) {
        meshCount++
        child.castShadow = false
        child.receiveShadow = true
        child.frustumCulled = true

        // Optimize material
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach(m => {
            // Convert to cheaper material where possible
            m.flatShading = true
            m.side = THREE.FrontSide
            m.fog = true
            // Remove expensive features
            if (m.map) m.map.anisotropy = 1
            if (m.normalMap) { m.normalMap.dispose(); m.normalMap = null }
            if (m.roughnessMap) { m.roughnessMap.dispose(); m.roughnessMap = null }
            if (m.metalnessMap) { m.metalnessMap.dispose(); m.metalnessMap = null }
            if (m.aoMap) { m.aoMap.dispose(); m.aoMap = null }
            m.envMapIntensity = 0
            m.needsUpdate = true
          })
        }

        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
          // Remove unused attributes
          if (child.geometry.attributes.uv2) child.geometry.deleteAttribute('uv2')
        }
      }
    })

    console.log(`✅ Optimized ${meshCount} forest meshes`)
    this.group.add(model)
    this.forestModel = model

    // Generate physics colliders from large meshes
    this.createColliders(model)
  }

  createColliders(model) {
    let colliderCount = 0
    model.traverse((child) => {
      if (!child.isMesh) return

      // Get world-space bounding box for this mesh
      const box = new THREE.Box3().setFromObject(child)
      const size = new THREE.Vector3()
      box.getSize(size)
      const center = new THREE.Vector3()
      box.getCenter(center)

      // Skip tiny meshes (leaves, small decorations) — only collide with substantial geometry
      if (size.x < 0.5 && size.y < 0.5 && size.z < 0.5) return

      // Create a CANNON box at the mesh's bounding box
      const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
      const shape = new CANNON.Box(halfExtents)
      const body = new CANNON.Body({
        mass: 0,
        shape,
        position: new CANNON.Vec3(center.x, center.y, center.z),
        material: this.physics.defaultMaterial
      })
      body.collisionResponse = true
      this.physics.world.addBody(body)
      this.bodies.push(body)
      colliderCount++
    })
    console.log(`🧱 Created ${colliderCount} forest colliders`)
  }

  createZoneMarkers() {
    // Shared materials
    const ringMat = new THREE.MeshBasicMaterial({
      transparent: true, opacity: 0.25, side: THREE.DoubleSide
    })

    for (const [id, zone] of Object.entries(this.zones)) {
      // Ground ring
      const rMat = ringMat.clone()
      rMat.color = new THREE.Color(zone.color)
      const ringGeo = new THREE.RingGeometry(zone.radius - 0.3, zone.radius, 16)
      ringGeo.rotateX(-Math.PI / 2)
      const ring = new THREE.Mesh(ringGeo, rMat)
      ring.position.copy(zone.center)
      ring.position.y = 0.15
      this.group.add(ring)

      // Marker pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 2, 5),
        new THREE.MeshStandardMaterial({ color: zone.color, emissive: zone.color, emissiveIntensity: 0.3 })
      )
      pole.position.copy(zone.center)
      pole.position.y = 1
      pole.userData = { isInteractable: true, zoneId: id, zoneName: zone.name }
      this.group.add(pole)
      this.landmarks.push(pole)

      // Orb on top
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        new THREE.MeshBasicMaterial({ color: zone.color })
      )
      orb.position.copy(zone.center)
      orb.position.y = 2.2
      this.group.add(orb)
    }
  }

  createPortals() {
    const defs = [
      { id: 'P1', to: 'Z1', pos: [0, 0, -5] },
      { id: 'P2', to: 'Z2', pos: [-5, 0, 0] },
      { id: 'P3', to: 'Z3', pos: [5, 0, 0] },
      { id: 'P4', to: 'Z4', pos: [-4, 0, 4] },
      { id: 'P5', to: 'Z5', pos: [4, 0, 4] },
    ]

    const archMat = new THREE.MeshStandardMaterial({ color: 0x654321, flatShading: true })

    defs.forEach(def => {
      const g = new THREE.Group()
      g.position.set(def.pos[0], 0, def.pos[2])

      // Arch
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.07, 4, 10, Math.PI), archMat)
      arch.rotation.x = Math.PI
      arch.position.y = 1.2
      g.add(arch)

      // Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.07, 0.09, 2.4, 4)
      const l = new THREE.Mesh(pillarGeo, archMat)
      l.position.set(-1.2, 1.2, 0)
      g.add(l)
      const r = new THREE.Mesh(pillarGeo, archMat)
      r.position.set(1.2, 1.2, 0)
      g.add(r)

      // Portal surface
      const color = this.zones[def.to]?.color || 0x4A90D9
      const surface = new THREE.Mesh(
        new THREE.CircleGeometry(0.9, 10),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      )
      surface.position.y = 1.2
      g.add(surface)

      g.userData = {
        isPortal: true,
        portalId: def.id,
        toZone: def.to,
        destination: this.zones[def.to]?.center.clone().setY(1) || new THREE.Vector3(0, 1, 0)
      }

      this.group.add(g)
      this.portals.push(g)
    })
  }

  getZoneAtPosition(position) {
    for (const [id, zone] of Object.entries(this.zones)) {
      const dist = Math.hypot(position.x - zone.center.x, position.z - zone.center.z)
      if (dist <= zone.radius) return { id, ...zone }
    }
    return null
  }

  getPortalsNearPosition(position, radius = 2.5) {
    return this.portals.filter(p => p.position.distanceTo(position) <= radius)
  }

  getZoneSpawnPoint(zoneId) {
    const zone = this.zones[zoneId]
    if (zone) return zone.center.clone().setY(2)
    return new THREE.Vector3(0, 2, 5)
  }

  update() {
    // no per-frame cost
  }

  dispose() {
    // Remove physics bodies
    this.bodies.forEach(b => this.physics.world.removeBody(b))
    this.bodies = []

    this.group.traverse(child => {
      if (child.isMesh) {
        child.geometry?.dispose()
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
        else child.material?.dispose()
      }
    })
    this.scene.remove(this.group)
    this.portals = []
    this.landmarks = []
  }
}
