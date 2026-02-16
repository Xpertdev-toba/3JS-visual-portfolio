import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Experience } from '../Experience.js'

/**
 * TestEnvironment — Production-Ready Procedural World
 * ═══════════════════════════════════════════════════
 * TobaTech Jungle: 8 zones, paths, portals, landmarks,
 * trees, terrain elevation, physics, particles.
 *
 * Optimized: instanced meshes, shared materials, bounded particles.
 */
export class TestEnvironment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.physics = this.experience.physics

    this.group = new THREE.Group()
    this.group.name = 'TestEnvironment'
    this.bodies = []
    this.dynamicMeshes = []
    this.animatedObjects = []
    this.particles = []
    this.portals = []
    this.landmarks = []
    this.zoneLabels = [] // Floating text labels

    // ── Zone Config (level design doc) ──
    // PORTFOLIO SERVICE AREAS:
    // HUB  = Welcome/Landing - Central portfolio showcase
    // Z1   = IT Services - Software dev, web apps, APIs, backend
    // Z2   = Game Development - Unity, Unreal, mobile games
    // Z3   = AI & Automation - ML, chatbots, RPA, data analytics
    // Z4   = Media Production - Video, motion graphics, VFX, 3D
    // Z5   = Digital Marketing - SEO, social media, ads, content
    // Z6   = About/Team - Company story, values, team members
    // Z7   = Contact - Contact form, social links, booking
    this.zones = {
      HUB: { name: 'The Nexus Clearing',   center: new THREE.Vector3(0, 0, 0),      radius: 24, color: 0xFFD700, elevation: 0 },
      Z1:  { name: 'CodeForge Ruins',      center: new THREE.Vector3(0, 0, -180),    radius: 21, color: 0x4A90D9, elevation: -1.5 },
      Z2:  { name: 'Pixel Grove',          center: new THREE.Vector3(-180, 0, 0),    radius: 21, color: 0x9B59B6, elevation: 4.5 },
      Z3:  { name: 'Neural Cavern',        center: new THREE.Vector3(180, 0, 0),     radius: 21, color: 0xE91E63, elevation: -3 },
      Z4:  { name: 'Lumina Falls',         center: new THREE.Vector3(-150, 0, 180),  radius: 21, color: 0xFF9800, elevation: 9 },
      Z5:  { name: 'Beacon Spire',         center: new THREE.Vector3(150, 0, 180),   radius: 21, color: 0x4CAF50, elevation: 6 },
      Z6:  { name: 'Origin Tree',          center: new THREE.Vector3(-100, 0, 300),  radius: 18, color: 0xFFB74D, elevation: 15 },
      Z7:  { name: 'Echo Chamber',         center: new THREE.Vector3(100, 0, 300),   radius: 15, color: 0x26C6DA, elevation: 12 },
    }

    // Shared material pool (optimization)
    this._matPool = {}

    // Build the world
    this._buildTerrain()
    this._buildPaths()
    this._buildZoneGrounds()
    this._buildHubLandmark()
    this._buildZ1Landmark()
    this._buildZ2Landmark()
    this._buildZ3Landmark()
    this._buildZ4Landmark()
    this._buildZ5Landmark()
    this._buildZ6Landmark()
    this._buildZ7Landmark()
    this._buildPortals()
    this._buildTrees()
    this._buildRocks()
    this._buildBoundaryWalls()
    this._buildParticles()
    this._buildSpawnMarker()
    this._buildZoneLabels()

    this.scene.add(this.group)

    // Register zone elevation colliders with physics
    this.physics.addZoneColliders(this.zones)

    // Create heightfield physics collider matching visual terrain
    if (this._terrainHeights) {
      this.physics.setHeightfield(this._terrainHeights, this._terrainSize, this._terrainSegs)
    }

    console.log('🏗️ Production World loaded — zones:', Object.keys(this.zones).length, 'bodies:', this.bodies.length)
  }

  // ═══════════════════════════════════════
  // SHARED HELPERS
  // ═══════════════════════════════════════

  _mat(key, color, opts = {}) {
    const id = `${key}_${color}`
    if (!this._matPool[id]) {
      this._matPool[id] = new THREE.MeshStandardMaterial({
        color, roughness: opts.roughness ?? 0.7, metalness: opts.metalness ?? 0,
        flatShading: true, ...opts,
      })
    }
    return this._matPool[id]
  }

  _bmat(key, color, opts = {}) {
    const id = `b_${key}_${color}`
    if (!this._matPool[id]) {
      this._matPool[id] = new THREE.MeshBasicMaterial({ color, ...opts })
    }
    return this._matPool[id]
  }

  /** Add a cheap emissive glow sphere instead of expensive PointLight */
  _addLight(parent, color, intensity, distance, decay, x, y, z) {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: Math.min(intensity * 0.3, 0.8) })
    )
    glow.position.set(x, y, z)
    parent.add(glow)
    return glow
  }

  _staticBox(pos, size, color, opts = {}) {
    const geo = new THREE.BoxGeometry(size[0], size[1], size[2])
    const mesh = new THREE.Mesh(geo, this._mat('box', color, opts))
    mesh.position.set(pos[0], pos[1], pos[2])
    if (opts.rotY) mesh.rotation.y = opts.rotY
    if (opts.rotX) mesh.rotation.x = opts.rotX
    mesh.castShadow = false
    mesh.receiveShadow = true
    this.group.add(mesh)

    const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2))
    const body = new CANNON.Body({ mass: 0, shape, material: this.physics.defaultMaterial })
    body.position.set(pos[0], pos[1], pos[2])
    if (opts.rotY) body.quaternion.setFromEuler(0, opts.rotY, 0)
    if (opts.rotX) body.quaternion.setFromEuler(opts.rotX, 0, 0)
    this.physics.world.addBody(body)
    this.bodies.push(body)
    return mesh
  }

  _staticCyl(pos, rTop, rBot, h, color, opts = {}) {
    const segs = opts.segments ?? 8
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, segs)
    const mesh = new THREE.Mesh(geo, this._mat('cyl', color, opts))
    mesh.position.set(pos[0], pos[1], pos[2])
    mesh.castShadow = false
    mesh.receiveShadow = true
    this.group.add(mesh)

    const r = Math.max(rTop, rBot)
    const shape = new CANNON.Cylinder(r, r, h, 6)
    const body = new CANNON.Body({ mass: 0, shape, material: this.physics.defaultMaterial })
    body.position.set(pos[0], pos[1], pos[2])
    this.physics.world.addBody(body)
    this.bodies.push(body)
    return mesh
  }

  // ═══════════════════════════════════════
  // TERRAIN
  // ═══════════════════════════════════════

  _buildTerrain() {
    const size = 1000, segs = 64
    const geo = new THREE.PlaneGeometry(size, size, segs, segs)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const baseColor = new THREE.Color(0x2d4a3d)
    const tmp = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      let y = Math.sin(x * 0.008) * Math.cos(z * 0.006) * 6
        + Math.sin(x * 0.015 + z * 0.012) * 3

      tmp.copy(baseColor)
      for (const zone of Object.values(this.zones)) {
        const dx = x - zone.center.x, dz = z - zone.center.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < zone.radius * 2) {
          const t = 1 - Math.min(dist / (zone.radius * 2), 1)
          y += zone.elevation * t * t * (3 - 2 * t)
        }
        if (dist < zone.radius * 1.5) {
          tmp.lerp(new THREE.Color(zone.color), (1 - dist / (zone.radius * 1.5)) * 0.15)
        }
      }
      pos.setY(i, y)
      colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()

    const floor = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.85, flatShading: true,
    }))
    floor.receiveShadow = false
    floor.name = 'Terrain'
    this.group.add(floor)

    // Store terrain height data for physics heightfield
    this._terrainSize = size
    this._terrainSegs = segs
    this._terrainHeights = new Float32Array((segs + 1) * (segs + 1))
    for (let i = 0; i < pos.count; i++) {
      this._terrainHeights[i] = pos.getY(i)
    }

    const grid = new THREE.GridHelper(size, size / 2, 0x3a5a4a, 0x2a3a2a)
    grid.material.opacity = 0.08
    grid.material.transparent = true
    grid.position.y = 0.02
    this.group.add(grid)
  }

  // ═══════════════════════════════════════
  // PATHS
  // ═══════════════════════════════════════

  _buildPaths() {
    const pathMat = this._mat('path', 0x8B7355, { roughness: 0.9 })
    const paths = [
      // HUB to Z1 (north)
      { from: [0, 0, 50], to: [0, 0, -110], w: 8 },
      { from: [0, 0, -110], to: [0, 0, -160], w: 8 },
      // HUB to Z2 (west)
      { from: [-40, 0, 0], to: [-110, 0, 0], w: 6 },
      { from: [-110, 0, 0], to: [-160, 0, 0], w: 6 },
      // HUB to Z3 (east)
      { from: [40, 0, 0], to: [110, 0, 0], w: 6 },
      { from: [110, 0, 0], to: [160, 0, 0], w: 6 },
      // HUB to Z4 (southwest)
      { from: [-30, 0, 30], to: [-120, 0, 150], w: 5 },
      { from: [-120, 0, 150], to: [-140, 0, 170], w: 5 },
      // HUB to Z5 (southeast)
      { from: [30, 0, 30], to: [120, 0, 150], w: 5 },
      { from: [120, 0, 150], to: [140, 0, 170], w: 5 },
      // Z4 to Z6
      { from: [-130, 0, 220], to: [-100, 0, 280], w: 4 },
      // Z5 to Z7
      { from: [130, 0, 220], to: [100, 0, 280], w: 4 },
      // Z6 to Z7 (back path)
      { from: [-80, 0, 300], to: [80, 0, 300], w: 4 },
    ]

    paths.forEach(p => {
      const s = new THREE.Vector3(p.from[0], 0.05, p.from[2])
      const e = new THREE.Vector3(p.to[0], 0.05, p.to[2])
      const dir = e.clone().sub(s)
      const len = dir.length()
      dir.normalize()

      const geo = new THREE.PlaneGeometry(p.w, len)
      geo.rotateX(-Math.PI / 2)
      const mesh = new THREE.Mesh(geo, pathMat)
      mesh.position.copy(s.clone().add(e).multiplyScalar(0.5))
      mesh.rotation.y = -Math.atan2(dir.z, dir.x) + Math.PI / 2
      mesh.receiveShadow = true
      this.group.add(mesh)

      // Edge stones
      const cnt = Math.floor(len / 3)
      for (let i = 0; i <= cnt; i++) {
        const t = i / Math.max(cnt, 1)
        const pt = s.clone().lerp(e, t)
        const perp = new THREE.Vector3(-dir.z, 0, dir.x)
        for (const side of [-1, 1]) {
          const sp = pt.clone().add(perp.clone().multiplyScalar(side * p.w * 0.55))
          const stone = new THREE.Mesh(
            new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 4, 3),
            this._mat('stone', 0x6B5B3A)
          )
          stone.position.set(sp.x, 0.08, sp.z)
          stone.scale.y = 0.5
          this.group.add(stone)
        }
      }
    })
  }

  // ═══════════════════════════════════════
  // ZONE GROUND MARKERS
  // ═══════════════════════════════════════

  _buildZoneGrounds() {
    for (const [id, zone] of Object.entries(this.zones)) {
      const ey = zone.elevation
      // Ring
      const ringGeo = new THREE.RingGeometry(zone.radius - 0.4, zone.radius, 32)
      ringGeo.rotateX(-Math.PI / 2)
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: zone.color, transparent: true, opacity: 0.2, side: THREE.DoubleSide,
      }))
      ring.position.set(zone.center.x, ey + 0.1, zone.center.z)
      this.group.add(ring)

      // Inner disc
      const discGeo = new THREE.CircleGeometry(zone.radius * 0.85, 24)
      discGeo.rotateX(-Math.PI / 2)
      const disc = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({
        color: zone.color, transparent: true, opacity: 0.06, side: THREE.DoubleSide,
      }))
      disc.position.set(zone.center.x, ey + 0.08, zone.center.z)
      this.group.add(disc)

      // Zone pole
      const poleH = 2.5
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, poleH, 5),
        this._mat('pole', zone.color, { emissive: zone.color, emissiveIntensity: 0.25 })
      )
      pole.position.set(zone.center.x, ey + poleH / 2, zone.center.z)
      pole.castShadow = false
      pole.userData = { isInteractable: true, zoneId: id, zoneName: zone.name }
      this.group.add(pole)

      // Orb
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        this._bmat('orb', zone.color)
      )
      orb.position.set(zone.center.x, ey + poleH + 0.2, zone.center.z)
      this.group.add(orb)
      this.landmarks.push(pole)
    }
  }

  // ═══════════════════════════════════════
  // HUB: THE NEXUS CLEARING
  // ═══════════════════════════════════════

  _buildHubLandmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.HUB

    // ── Compass Crystal (rotating diamond) ──
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.MeshStandardMaterial({
        color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.3,
        metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.85, flatShading: true,
      })
    )
    crystal.position.set(cx, ey + 3.5, cz)
    crystal.castShadow = false
    this.group.add(crystal)
    this.animatedObjects.push({ mesh: crystal, type: 'rotate_float', speed: 0.3, amplitude: 0.3 })

    // Emissive glow replaces PointLight
    const crystalGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.4 })
    )
    crystalGlow.position.set(cx, ey + 3.5, cz)
    this.group.add(crystalGlow)

    // ── Stone Circle (6 rune pillars) ──
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const rx = cx + Math.cos(a) * 5, rz = cz + Math.sin(a) * 5

      this._staticCyl([rx, ey + 0.8, rz], 0.25, 0.35, 1.6, 0x5c5c5c, { roughness: 0.9, segments: 5 })

      const rune = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.02, 0.15),
        this._bmat('rune', 0xFFD700, { transparent: true, opacity: 0.6 })
      )
      rune.position.set(rx, ey + 1.65, rz)
      this.group.add(rune)
      this.animatedObjects.push({ mesh: rune, type: 'pulse', speed: 0.5 + i * 0.15 })
    }

    // ── Direction signposts ──
    const signZones = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7']
    signZones.forEach(zid => {
      const zone = this.zones[zid]
      const dir = zone.center.clone().sub(this.zones.HUB.center).normalize()
      const sx = cx + dir.x * 3.5, sz = cz + dir.z * 3.5

      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.08), this._mat('post', 0x654321))
      post.position.set(sx, ey + 0.75, sz)
      post.castShadow = false
      this.group.add(post)

      const arrowGeo = new THREE.ConeGeometry(0.15, 0.4, 4)
      arrowGeo.rotateZ(-Math.PI / 2)
      const arrow = new THREE.Mesh(arrowGeo, this._bmat('arrow', zone.color))
      arrow.position.set(sx, ey + 1.4, sz)
      arrow.lookAt(new THREE.Vector3(zone.center.x, ey + 1.4, zone.center.z))
      this.group.add(arrow)
    })

    this._staticBox([cx + 2, ey + 0.3, cz + 4], [1.2, 0.6, 0.8], 0x7a7a7a, { roughness: 0.95 })
  }

  // ═══════════════════════════════════════
  // Z1: CODEFORGE RUINS — IT Services
  // ═══════════════════════════════════════

  _buildZ1Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z1

    // ── Compiler Obelisk ──
    const obelisk = new THREE.Mesh(
      new THREE.BoxGeometry(1, 6, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x2c3e50, emissive: 0x4A90D9, emissiveIntensity: 0.15,
        metalness: 0.6, roughness: 0.3, flatShading: true,
      })
    )
    obelisk.position.set(cx, ey + 3, cz)
    obelisk.castShadow = false
    this.group.add(obelisk)

    const oBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(0.5, 3, 0.3)), material: this.physics.defaultMaterial })
    oBody.position.set(cx, ey + 3, cz)
    this.physics.world.addBody(oBody)
    this.bodies.push(oBody)

    this._addLight(this.group, 0x4A90D9, 1.5, 10, 2, cx, ey + 5, cz)

    // ── Code stream lines ──
    for (let i = 0; i < 8; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.3 + Math.random() * 0.4, 0.03, 0.03),
        this._bmat('code', 0x6AB0FF, { transparent: true, opacity: 0.5 })
      )
      line.position.set(cx + (Math.random() - 0.5) * 0.6, ey + 1 + i * 0.6, cz + 0.35)
      this.group.add(line)
      this.animatedObjects.push({ mesh: line, type: 'code_scroll', speed: 0.5 + Math.random() * 0.5, originY: line.position.y, maxY: ey + 5.5, minY: ey + 0.5 })
    }

    // ── Ruin pillars ──
    const pp = [[cx - 4, cz - 2], [cx + 4, cz - 2], [cx - 3, cz + 3], [cx + 3, cz + 3], [cx - 5, cz + 1], [cx + 5, cz - 1]]
    pp.forEach(([px, pz]) => {
      const h = 1.5 + Math.random() * 2.5
      this._staticCyl([px, ey + h / 2, pz], 0.2, 0.3, h, 0x4A6080, { segments: 5 })
      if (Math.random() > 0.5) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), this._mat('cap', 0x556677))
        cap.position.set(px, ey + h + 0.08, pz)
        cap.rotation.y = Math.random() * Math.PI
        this.group.add(cap)
      }
    })

    // ── Terminal screens ──
    const terms = [[cx - 3, cz - 1], [cx + 3, cz - 1], [cx, cz + 4]]
    terms.forEach(([tx, tz]) => {
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.8),
        new THREE.MeshBasicMaterial({ color: 0x4A90D9, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
      )
      scr.position.set(tx, ey + 1.2, tz)
      scr.lookAt(new THREE.Vector3(cx, ey + 1.2, cz))
      this.group.add(scr)
      this.animatedObjects.push({ mesh: scr, type: 'flicker', speed: 2 })

      this._staticBox([tx, ey + 0.4, tz], [0.15, 0.8, 0.15], 0x37474F)
    })

    // ── Electric arcs ──
    const arcMat = new THREE.LineBasicMaterial({ color: 0x6AB0FF, transparent: true, opacity: 0.3 })
    for (let i = 0; i < Math.min(3, Math.floor(pp.length / 2)); i++) {
      const a = pp[i * 2], b = pp[i * 2 + 1]
      if (!a || !b) break
      const pts = []
      for (let s = 0; s <= 6; s++) {
        const t = s / 6
        pts.push(new THREE.Vector3(
          a[0] + (b[0] - a[0]) * t,
          ey + 2 + Math.sin(t * Math.PI) * 0.8 + (Math.random() - 0.5) * 0.3,
          a[1] + (b[1] - a[1]) * t
        ))
      }
      this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat))
    }
  }

  // ═══════════════════════════════════════
  // Z2: PIXEL GROVE — Game Development
  // ═══════════════════════════════════════

  _buildZ2Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z2
    const canopyColors = [0x7B1FA2, 0x9C27B0, 0xAB47BC, 0xCE93D8]

    // ── Polygon Tree trunk ──
    this._staticCyl([cx, ey + 2, cz], 0.3, 0.5, 4, 0x5c3a1a, { segments: 5 })

    // ── Canopy layers ──
    for (let i = 0; i < 4; i++) {
      const s = 2.5 - i * 0.5
      const canopy = new THREE.Mesh(
        new THREE.OctahedronGeometry(s, 0),
        new THREE.MeshStandardMaterial({
          color: canopyColors[i], emissive: canopyColors[i], emissiveIntensity: 0.1,
          flatShading: true, transparent: true, opacity: 0.85,
        })
      )
      canopy.position.set(cx, ey + 5 + i * 1.5, cz)
      canopy.rotation.y = i * 0.5
      canopy.castShadow = false
      this.group.add(canopy)
      this.animatedObjects.push({ mesh: canopy, type: 'slow_rotate', speed: 0.15 + i * 0.05 })
    }

    // Canopy physics
    const cBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(2.5, 4, 2.5)), material: this.physics.defaultMaterial })
    cBody.position.set(cx, ey + 7, cz)
    this.physics.world.addBody(cBody)
    this.bodies.push(cBody)

    // ── Spinning cube leaves ──
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 2
      const cubeSize = 0.2 + Math.random() * 0.3
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
        this._bmat('leaf', canopyColors[i % 4], { transparent: true, opacity: 0.6 })
      )
      cube.position.set(cx + Math.cos(a) * r, ey + 5 + Math.random() * 5, cz + Math.sin(a) * r)
      this.group.add(cube)
      this.animatedObjects.push({ mesh: cube, type: 'spin_cube', speed: 0.5 + Math.random() * 1.5 })
    }

    // ── Arcade cabinets ──
    const arcP = [[cx - 4, cz + 2], [cx + 4, cz - 2]]
    arcP.forEach(([ax, az]) => {
      this._staticBox([ax, ey + 0.8, az], [0.8, 1.6, 0.6], 0x4A148C)
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.4),
        this._bmat('ascreen', 0xCE93D8, { transparent: true, opacity: 0.5 })
      )
      scr.position.set(ax, ey + 1.2, az + 0.31)
      this.group.add(scr)
      this.animatedObjects.push({ mesh: scr, type: 'flicker', speed: 3 })
    })

    // ── Floating coins ──
    for (let i = 0; i < 5; i++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), this._bmat('coin', 0xFFD700))
      coin.position.set(cx + (Math.random() - 0.5) * 10, ey + 1 + Math.random() * 2, cz + (Math.random() - 0.5) * 10)
      coin.rotation.x = Math.PI / 2
      this.group.add(coin)
      this.animatedObjects.push({ mesh: coin, type: 'rotate_float', speed: 2, amplitude: 0.15 })
    }

    this._addLight(this.group, 0x9B59B6, 1, 12, 2, cx, ey + 6, cz)
  }

  // ═══════════════════════════════════════
  // Z3: NEURAL CAVERN — AI Automation
  // ═══════════════════════════════════════

  _buildZ3Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z3

    // ── Brain Core ──
    const brain = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshStandardMaterial({
        color: 0xE91E63, emissive: 0xFF4081, emissiveIntensity: 0.35,
        metalness: 0.7, roughness: 0.15, transparent: true, opacity: 0.75, flatShading: true,
      })
    )
    brain.position.set(cx, ey + 4, cz)
    brain.castShadow = false
    this.group.add(brain)
    this.animatedObjects.push({ mesh: brain, type: 'rotate_float', speed: 0.2, amplitude: 0.4 })

    this._addLight(this.group, 0xE91E63, 2, 15, 2, cx, ey + 4, cz)

    const bBody = new CANNON.Body({ mass: 0, shape: new CANNON.Sphere(1.5), material: this.physics.defaultMaterial })
    bBody.position.set(cx, ey + 4, cz)
    this.physics.world.addBody(bBody)
    this.bodies.push(bBody)

    // ── Synapse nodes ──
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r = 3 + Math.random() * 2.5
      const nx = cx + Math.cos(a) * r, nz = cz + Math.sin(a) * r
      const ny = ey + 1.5 + Math.random() * 2

      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 6, 6),
        this._bmat('synapse', 0xFF4081, { transparent: true, opacity: 0.5 })
      )
      node.position.set(nx, ny, nz)
      this.group.add(node)
      this.animatedObjects.push({ mesh: node, type: 'pulse', speed: 0.8 + i * 0.1 })

      this.group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx, ey + 4, cz), new THREE.Vector3(nx, ny, nz)]),
        new THREE.LineBasicMaterial({ color: 0xFF4081, transparent: true, opacity: 0.2 })
      ))
    }

    // ── Crystals ──
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const cr = this.zones.Z3.radius * 0.7
      const ccx = cx + Math.cos(a) * cr, ccz = cz + Math.sin(a) * cr
      const ch = 0.8 + Math.random() * 1.5
      const cryst = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 + Math.random() * 0.15, ch, 4),
        this._mat('crystal', 0xE91E63, { emissive: 0xE91E63, emissiveIntensity: 0.2, metalness: 0.5 })
      )
      cryst.position.set(ccx, ey + ch / 2, ccz)
      cryst.castShadow = false
      this.group.add(cryst)
    }

    // ── Cave walls ──
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      const wr = this.zones.Z3.radius - 0.5
      this._staticBox(
        [cx + Math.cos(a) * wr, ey + 1.5, cz + Math.sin(a) * wr],
        [2.5, 3, 0.4], 0x3c3c5a,
        { rotY: a + Math.PI / 2, roughness: 0.95 }
      )
    }
  }

  // ═══════════════════════════════════════
  // Z4: LUMINA FALLS — Media Production
  // ═══════════════════════════════════════

  _buildZ4Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z4

    // ── Waterfall cliff ──
    this._staticBox([cx, ey + 1.5, cz - 2], [5, 3, 1.5], 0x6B5240, { roughness: 0.95 })

    // ── Waterfall cascade ──
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    for (let i = 0; i < 3; i++) {
      const water = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + i * 0.3, 3), waterMat)
      water.position.set(cx + (i - 1) * 0.7, ey + 1.5, cz - 1.24)
      this.group.add(water)
      this.animatedObjects.push({ mesh: water, type: 'waterfall', speed: 1.5 + i * 0.3 })
    }

    // ── Pool ──
    const poolGeo = new THREE.CircleGeometry(2.5, 16)
    poolGeo.rotateX(-Math.PI / 2)
    const pool = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial({ color: 0x0288D1, transparent: true, opacity: 0.4 }))
    pool.position.set(cx, ey + 0.05, cz - 3)
    this.group.add(pool)

    // ── Film reels ──
    const reels = [[cx - 3, cz + 2], [cx + 3, cz + 3]]
    reels.forEach(([rx, rz]) => {
      const reel = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.12, 6, 12),
        this._mat('reel', 0xFF9800, { metalness: 0.4 })
      )
      reel.position.set(rx, ey + 0.3, rz)
      reel.rotation.x = Math.PI / 2
      this.group.add(reel)
      this.animatedObjects.push({ mesh: reel, type: 'slow_rotate', speed: 0.3 })

      const center = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8), this._mat('reelc', 0xE65100))
      center.position.set(rx, ey + 0.3, rz)
      this.group.add(center)
    })

    // ── Camera drone ──
    const droneGrp = new THREE.Group()
    droneGrp.position.set(cx + 2, ey + 4, cz + 1)
    droneGrp.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), this._mat('drone', 0x37474F, { metalness: 0.5 })))
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.4), this._mat('arm', 0x455A64))
      arm.position.set(Math.cos(a) * 0.35, 0.1, Math.sin(a) * 0.35)
      arm.lookAt(new THREE.Vector3(0, 0, 0))
      droneGrp.add(arm)
    }
    this.group.add(droneGrp)
    this.animatedObjects.push({ mesh: droneGrp, type: 'drone_hover', speed: 1, originPos: droneGrp.position.clone() })

    this._addLight(this.group, 0xFF9800, 1.5, 12, 2, cx, ey + 3, cz)
  }

  // ═══════════════════════════════════════
  // Z5: BEACON SPIRE — Digital Marketing
  // ═══════════════════════════════════════

  _buildZ5Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z5

    // ── Signal Tower ──
    this._staticBox([cx, ey + 1, cz], [2, 2, 2], 0x2E7D32, { roughness: 0.8 })
    this._staticCyl([cx, ey + 5, cz], 0.3, 0.5, 6, 0x388E3C, { segments: 6 })

    // ── Beacon top ──
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.MeshStandardMaterial({
        color: 0x4CAF50, emissive: 0x81C784, emissiveIntensity: 0.5,
        metalness: 0.5, roughness: 0.2, flatShading: true,
      })
    )
    beacon.position.set(cx, ey + 8.5, cz)
    beacon.castShadow = false
    this.group.add(beacon)
    this.animatedObjects.push({ mesh: beacon, type: 'rotate_float', speed: 1, amplitude: 0.1 })

    this._addLight(this.group, 0x4CAF50, 3, 25, 2, cx, ey + 9, cz)

    // ── Signal wave rings ──
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.5 + i * 1.2, 0.03, 4, 16),
        this._bmat('signal', 0x81C784, { transparent: true, opacity: 0.2 - i * 0.05 })
      )
      ring.position.set(cx, ey + 7 + i * 0.5, cz)
      ring.rotation.x = Math.PI / 2
      this.group.add(ring)
      this.animatedObjects.push({ mesh: ring, type: 'expand_ring', speed: 0.3 + i * 0.1, maxScale: 2.5 })
    }

    // ── Billboards ──
    const bbs = [{ pos: [cx - 4, ey + 2, cz + 2], r: 0.3 }, { pos: [cx + 4, ey + 2.5, cz - 1], r: -0.4 }]
    bbs.forEach(bb => {
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1),
        this._mat('billboard', 0x2E7D32, { emissive: 0x4CAF50, emissiveIntensity: 0.15 })
      )
      board.position.set(bb.pos[0], bb.pos[1], bb.pos[2])
      board.rotation.y = bb.r
      this.group.add(board)
      this._staticBox([bb.pos[0], ey + 1, bb.pos[2]], [0.1, 2, 0.1], 0x5D4037)
    })
  }

  // ═══════════════════════════════════════
  // Z6: ORIGIN TREE — About / Team
  // ═══════════════════════════════════════

  _buildZ6Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z6

    // ── Elder Tree trunk ──
    this._staticCyl([cx, ey + 3, cz], 0.8, 1.2, 6, 0x5D4037, { segments: 7 })

    // ── Layered canopy ──
    const canopyDef = [
      { r: 3.5, y: ey + 8, c: 0xFF8F00 },
      { r: 3, y: ey + 9.5, c: 0xFFA726 },
      { r: 2, y: ey + 11, c: 0xFFB74D },
    ]
    canopyDef.forEach(cl => {
      const canopy = new THREE.Mesh(
        new THREE.IcosahedronGeometry(cl.r, 1),
        new THREE.MeshStandardMaterial({
          color: cl.c, emissive: cl.c, emissiveIntensity: 0.08,
          flatShading: true, transparent: true, opacity: 0.7,
        })
      )
      canopy.position.set(cx, cl.y, cz)
      canopy.castShadow = false
      this.group.add(canopy)
    })

    const tBody = new CANNON.Body({ mass: 0, shape: new CANNON.Sphere(3.5), material: this.physics.defaultMaterial })
    tBody.position.set(cx, ey + 8, cz)
    this.physics.world.addBody(tBody)
    this.bodies.push(tBody)

    // ── Glowing heart ──
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      this._bmat('heart', 0xFFB74D, { transparent: true, opacity: 0.6 })
    )
    heart.position.set(cx, ey + 2, cz)
    this.group.add(heart)
    this.animatedObjects.push({ mesh: heart, type: 'pulse', speed: 0.4 })

    this._addLight(this.group, 0xFFB74D, 1.5, 8, 2, cx, ey + 2, cz)

    // ── Root tendrils ──
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      const rootLen = 2 + Math.random() * 1.5
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, rootLen, 4), this._mat('root', 0x5D4037))
      root.position.set(cx + Math.cos(a) * 1.2, ey + 0.3, cz + Math.sin(a) * 1.2)
      root.rotation.z = Math.cos(a) * 0.5
      root.rotation.x = Math.sin(a) * 0.5
      this.group.add(root)
    }

    // ── Photo frames ──
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const fx = cx + Math.cos(a) * 3, fz = cz + Math.sin(a) * 3
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.05), this._mat('frame', 0x8D6E63))
      frame.position.set(fx, ey + 1.5, fz)
      frame.lookAt(new THREE.Vector3(cx, ey + 1.5, cz))
      this.group.add(frame)
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.4),
        this._bmat('photo', 0xFFB74D, { transparent: true, opacity: 0.3 })
      )
      photo.position.set(fx, ey + 1.5, fz)
      photo.lookAt(new THREE.Vector3(cx, ey + 1.5, cz))
      this.group.add(photo)
    }
  }

  // ═══════════════════════════════════════
  // Z7: ECHO CHAMBER — Contact
  // ═══════════════════════════════════════

  _buildZ7Landmark() {
    const { center: { x: cx, z: cz }, elevation: ey } = this.zones.Z7

    // ── Contact Crystal ──
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshStandardMaterial({
        color: 0x26C6DA, emissive: 0x26C6DA, emissiveIntensity: 0.4,
        metalness: 0.6, roughness: 0.15, transparent: true, opacity: 0.8, flatShading: true,
      })
    )
    crystal.position.set(cx, ey + 3, cz)
    crystal.castShadow = false
    this.group.add(crystal)
    this.animatedObjects.push({ mesh: crystal, type: 'rotate_float', speed: 0.5, amplitude: 0.25 })

    const cBody = new CANNON.Body({ mass: 0, shape: new CANNON.Sphere(1), material: this.physics.defaultMaterial })
    cBody.position.set(cx, ey + 3, cz)
    this.physics.world.addBody(cBody)
    this.bodies.push(cBody)

    this._addLight(this.group, 0x26C6DA, 2, 15, 2, cx, ey + 3, cz)

    // ── Echo rings ──
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.5 + i * 1, 0.03, 4, 24),
        this._bmat('echo', 0x26C6DA, { transparent: true, opacity: 0.15 - i * 0.03 })
      )
      ring.position.set(cx, ey + 3, cz)
      ring.rotation.x = Math.PI / 2
      this.group.add(ring)
      this.animatedObjects.push({ mesh: ring, type: 'expand_ring', speed: 0.2 + i * 0.08, maxScale: 3 })
    }

    // ── Amphitheater walls ──
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI + Math.PI * 0.75
      const wr = this.zones.Z7.radius - 0.5
      const wallH = 2 + Math.random() * 1.5
      this._staticBox(
        [cx + Math.cos(a) * wr, ey + wallH / 2, cz + Math.sin(a) * wr],
        [1.8, wallH, 0.3], 0x1A6B7A,
        { rotY: a + Math.PI / 2, emissive: 0x26C6DA, emissiveIntensity: 0.05, metalness: 0.3 }
      )
    }

    // ── Social pillars ──
    const socials = [0x1DA1F2, 0x4267B2, 0xE1306C, 0x0077B5]
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2
      const px = cx + Math.cos(a) * 2.5, pz = cz + Math.sin(a) * 2.5
      this._staticCyl([px, ey + 1, pz], 0.12, 0.15, 2, socials[i], { segments: 4 })

      this.group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(px, ey + 2, pz), new THREE.Vector3(cx, ey + 3, cz)]),
        new THREE.LineBasicMaterial({ color: 0x26C6DA, transparent: true, opacity: 0.15 })
      ))
    }
  }

  // ═══════════════════════════════════════
  // PORTALS
  // ═══════════════════════════════════════

  _buildPortals() {
    const defs = [
      { id: 'P1', to: 'Z1', pos: [0, 0, -5], rotY: 0 },
      { id: 'P2', to: 'Z2', pos: [-5, 0, 0], rotY: Math.PI / 2 },
      { id: 'P3', to: 'Z3', pos: [5, 0, 0], rotY: -Math.PI / 2 },
      { id: 'P4', to: 'Z4', pos: [-4, 0, 4], rotY: Math.PI / 4 },
      { id: 'P5', to: 'Z5', pos: [4, 0, 4], rotY: -Math.PI / 4 },
    ]

    const archMat = this._mat('arch', 0x654321, { roughness: 0.9 })

    defs.forEach(def => {
      const g = new THREE.Group()
      g.position.set(def.pos[0], 0, def.pos[2])
      g.rotation.y = def.rotY

      // Arch
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.12, 4, 12, Math.PI), archMat)
      arch.rotation.x = Math.PI
      arch.position.y = 1.4
      g.add(arch)

      // Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.8, 5)
      const lPillar = new THREE.Mesh(pillarGeo, archMat)
      lPillar.position.set(-1.4, 1.4, 0)
      lPillar.castShadow = false
      g.add(lPillar)
      const rPillar = new THREE.Mesh(pillarGeo, archMat)
      rPillar.position.set(1.4, 1.4, 0)
      rPillar.castShadow = false
      g.add(rPillar)

      // Portal surface
      const zoneColor = this.zones[def.to]?.color || 0x4A90D9
      const surface = new THREE.Mesh(
        new THREE.CircleGeometry(1.1, 16),
        new THREE.MeshBasicMaterial({ color: zoneColor, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      )
      surface.position.y = 1.4
      g.add(surface)
      this.animatedObjects.push({ mesh: surface, type: 'portal_pulse', speed: 1.5 })

      this._addLight(g, zoneColor, 0.8, 6, 2, 0, 1.4, 0)

      // Pillar physics
      const pillarShape = new CANNON.Cylinder(0.15, 0.15, 2.8, 5)
      for (const sideX of [-1.4, 1.4]) {
        const worldP = new THREE.Vector3(sideX, 1.4, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), def.rotY)
        const body = new CANNON.Body({ mass: 0, shape: pillarShape, material: this.physics.defaultMaterial })
        body.position.set(def.pos[0] + worldP.x, 1.4, def.pos[2] + worldP.z)
        this.physics.world.addBody(body)
        this.bodies.push(body)
      }

      g.userData = {
        isPortal: true, portalId: def.id, toZone: def.to,
        destination: this.zones[def.to]?.center.clone().setY(2) || new THREE.Vector3(0, 2, 0),
      }
      this.group.add(g)
      this.portals.push(g)
    })
  }

  // ═══════════════════════════════════════
  // TREES (Instanced)
  // ═══════════════════════════════════════

  _buildTrees() {
    const positions = []
    const worldSize = 450, attempts = 600, minZone = 35, minTree = 8

    for (let i = 0; i < attempts; i++) {
      const x = (Math.random() - 0.5) * worldSize * 2
      const z = (Math.random() - 0.5) * worldSize * 2
      let skip = false
      for (const zone of Object.values(this.zones)) {
        const dx = x - zone.center.x, dz = z - zone.center.z
        if (Math.sqrt(dx * dx + dz * dz) < minZone) { skip = true; break }
      }
      if (skip) continue
      let tooClose = false
      for (const tp of positions) {
        if (Math.sqrt((x - tp[0]) ** 2 + (z - tp[1]) ** 2) < minTree) { tooClose = true; break }
      }
      if (!tooClose) positions.push([x, z])
    }

    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.6, 8, 4)
    const trunkInst = new THREE.InstancedMesh(trunkGeo, this._mat('trunk', 0x5c3a1a, { roughness: 0.95 }), positions.length)
    trunkInst.castShadow = true; trunkInst.receiveShadow = true

    const canopyGeo = new THREE.IcosahedronGeometry(3.6, 0)
    const canopyInst = new THREE.InstancedMesh(canopyGeo, this._mat('treecanopy', 0x1B5E20, { roughness: 0.85 }), positions.length)
    canopyInst.castShadow = true

    const dummy = new THREE.Object3D()
    positions.forEach(([x, z], i) => {
      const scale = 0.6 + Math.random() * 0.8
      const trunkH = 8 * scale

      dummy.position.set(x, trunkH / 2, z)
      dummy.scale.set(scale, scale, scale)
      dummy.rotation.y = Math.random() * Math.PI
      dummy.updateMatrix()
      trunkInst.setMatrixAt(i, dummy.matrix)

      dummy.position.set(x, trunkH + 2.4 * scale, z)
      dummy.scale.set(scale * 1.2, scale * (0.8 + Math.random() * 0.5), scale * 1.2)
      dummy.updateMatrix()
      canopyInst.setMatrixAt(i, dummy.matrix)

      if (scale > 0.8) {
        const tShape = new CANNON.Cylinder(0.45 * scale, 0.75 * scale, trunkH, 4)
        const tBody = new CANNON.Body({ mass: 0, shape: tShape, material: this.physics.defaultMaterial })
        tBody.position.set(x, trunkH / 2, z)
        this.physics.world.addBody(tBody)
        this.bodies.push(tBody)
      }
    })

    this.group.add(trunkInst)
    this.group.add(canopyInst)
    console.log(`🌲 Placed ${positions.length} trees (instanced)`)
  }

  // ═══════════════════════════════════════
  // ROCKS (Instanced decoration)
  // ═══════════════════════════════════════

  _buildRocks() {
    const count = 150
    const geo = new THREE.DodecahedronGeometry(3, 0)
    const inst = new THREE.InstancedMesh(geo, this._mat('rock', 0x5a5a5a, { roughness: 0.95 }), count)
    inst.castShadow = false; inst.receiveShadow = true

    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 840, z = (Math.random() - 0.5) * 840
      const s = 0.3 + Math.random() * 0.8
      dummy.position.set(x, s * 0.3, z)
      dummy.scale.set(s * (0.8 + Math.random() * 0.4), s * 0.5, s * (0.8 + Math.random() * 0.4))
      dummy.rotation.set(Math.random(), Math.random(), Math.random())
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    this.group.add(inst)
  }

  // ═══════════════════════════════════════
  // BOUNDARY WALLS
  // ═══════════════════════════════════════

  _buildBoundaryWalls() {
    const S = 500, wallH = 20
    const defs = [
      { pos: [0, wallH / 2, -S], size: [S * 2, wallH, 2] },
      { pos: [0, wallH / 2, S], size: [S * 2, wallH, 2] },
      { pos: [-S, wallH / 2, 0], size: [2, wallH, S * 2] },
      { pos: [S, wallH / 2, 0], size: [2, wallH, S * 2] },
    ]
    const fogMat = new THREE.MeshBasicMaterial({ color: 0x2d4a3d, transparent: true, opacity: 0.2, side: THREE.DoubleSide })

    defs.forEach(w => {
      const shape = new CANNON.Box(new CANNON.Vec3(w.size[0] / 2, w.size[1] / 2, w.size[2] / 2))
      const body = new CANNON.Body({ mass: 0, shape, material: this.physics.defaultMaterial })
      body.position.set(w.pos[0], w.pos[1], w.pos[2])
      this.physics.world.addBody(body)
      this.bodies.push(body)

      const geo = new THREE.PlaneGeometry(Math.max(w.size[0], w.size[2]), w.size[1])
      const mesh = new THREE.Mesh(geo, fogMat)
      mesh.position.set(w.pos[0], w.pos[1], w.pos[2])
      if (w.size[2] >= 1) mesh.rotation.y = Math.PI / 2
      this.group.add(mesh)
    })
  }

  // ═══════════════════════════════════════
  // PARTICLES
  // ═══════════════════════════════════════

  _buildParticles() {
    // ── Fireflies ──
    const ffCount = 100
    const ffGeo = new THREE.BufferGeometry()
    const ffPos = new Float32Array(ffCount * 3)
    const ffSpeeds = []
    for (let i = 0; i < ffCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 600
      ffPos[i * 3 + 1] = 1.5 + Math.random() * 12
      ffPos[i * 3 + 2] = (Math.random() - 0.5) * 60
      ffSpeeds.push({
        sx: (Math.random() - 0.5) * 0.02,
        sy: (Math.random() - 0.5) * 0.01,
        sz: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
      })
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3))
    const fireflies = new THREE.Points(ffGeo, new THREE.PointsMaterial({
      color: 0xFFE082, size: 0.15, transparent: true, opacity: 0.8,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    fireflies.name = 'Fireflies'
    this.group.add(fireflies)
    this.particles.push({ points: fireflies, speeds: ffSpeeds, type: 'firefly' })

    // ── Pollen ──
    const pCount = 60
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)
    const pSpeeds = []
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 500
      pPos[i * 3 + 1] = 3 + Math.random() * 18
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 500
      pSpeeds.push({
        sx: (Math.random() - 0.5) * 0.02,
        sy: Math.random() * 0.01,
        sz: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
      })
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pollen = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.3, transparent: true, opacity: 0.5,
      sizeAttenuation: true, depthWrite: false,
    }))
    pollen.name = 'Pollen'
    this.group.add(pollen)
    this.particles.push({ points: pollen, speeds: pSpeeds, type: 'pollen' })
  }

  // ═══════════════════════════════════════
  // SPAWN MARKER
  // ═══════════════════════════════════════

  _buildSpawnMarker() {
    const ringGeo = new THREE.RingGeometry(2, 2.5, 16)
    ringGeo.rotateX(-Math.PI / 2)
    const ring = new THREE.Mesh(ringGeo, this._bmat('spawn', 0x00E676, { transparent: true, opacity: 0.4 }))
    ring.position.set(0, 0.15, 50)
    this.group.add(ring)
    this.animatedObjects.push({ mesh: ring, type: 'pulse', speed: 0.6 })

    const dotGeo = new THREE.CircleGeometry(1, 8)
    dotGeo.rotateX(-Math.PI / 2)
    const dot = new THREE.Mesh(dotGeo, this._bmat('spawndot', 0x00E676, { transparent: true, opacity: 0.25 }))
    dot.position.set(0, 0.16, 50)
    this.group.add(dot)

    this._addLight(this.group, 0x00E676, 1.5, 15, 2, 0, 3, 50)
  }

  // ═══════════════════════════════════════
  // FLOATING ZONE LABELS
  // ═══════════════════════════════════════

  _buildZoneLabels() {
    for (const [id, zone] of Object.entries(this.zones)) {
      const label = this._createTextSprite(zone.name, zone.color)
      label.position.set(zone.center.x, zone.elevation + 25, zone.center.z)
      label.userData = { baseY: zone.elevation + 25, phase: Math.random() * Math.PI * 2 }
      this.group.add(label)
      this.zoneLabels.push(label)
    }
  }

  /**
   * Create a canvas-based text sprite (always faces camera)
   */
  _createTextSprite(text, color) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = 512
    canvas.height = 128
    
    // Background (subtle gradient)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.3)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Text styling
    ctx.font = 'bold 48px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Glow effect
    ctx.shadowColor = `#${color.toString(16).padStart(6, '0')}`
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Outline
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 6
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2)
    
    // Fill with zone color
    const hexColor = `#${color.toString(16).padStart(6, '0')}`
    ctx.fillStyle = hexColor
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
      depthWrite: false,
    })
    
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(24, 6, 1) // Larger scale for bigger world
    sprite.name = `Label_${text}`
    
    return sprite
  }

  // ═══════════════════════════════════════
  // ZONE QUERY API
  // ═══════════════════════════════════════

  getZoneAtPosition(position) {
    for (const [id, zone] of Object.entries(this.zones)) {
      const dx = position.x - zone.center.x, dz = position.z - zone.center.z
      if (Math.sqrt(dx * dx + dz * dz) <= zone.radius) return { id, ...zone }
    }
    return null
  }

  getPortalsNearPosition(position, radius = 2.5) {
    return this.portals.filter(p => p.position.distanceTo(position) <= radius)
  }

  getZoneSpawnPoint(zoneId) {
    const zone = this.zones[zoneId]
    if (zone) return zone.center.clone().setY(zone.elevation + 2)
    return new THREE.Vector3(0, 2, 5)
  }

  // ═══════════════════════════════════════
  // ANIMATION UPDATE LOOP
  // ═══════════════════════════════════════

  update() {
    const t = performance.now() * 0.001

    // ── Animated objects ──
    for (const obj of this.animatedObjects) {
      const m = obj.mesh
      switch (obj.type) {
        case 'rotate_float':
          m.rotation.y += obj.speed * 0.01
          m.position.y += Math.sin(t * obj.speed) * obj.amplitude * 0.005
          break
        case 'slow_rotate':
          m.rotation.y += obj.speed * 0.005
          break
        case 'pulse': {
          const s = 1 + Math.sin(t * obj.speed * 2) * 0.15
          m.scale.set(s, s, s)
          if (m.material?.opacity !== undefined) m.material.opacity = 0.4 + Math.sin(t * obj.speed * 2) * 0.2
          break
        }
        case 'flicker':
          if (m.material) m.material.opacity = 0.25 + Math.sin(t * obj.speed * 5) * 0.15 + Math.sin(t * obj.speed * 13) * 0.05
          break
        case 'code_scroll':
          m.position.y += 0.01 * obj.speed
          if (m.position.y > obj.maxY) m.position.y = obj.minY
          break
        case 'spin_cube':
          m.rotation.x += obj.speed * 0.01
          m.rotation.z += obj.speed * 0.008
          break
        case 'portal_pulse':
          if (m.material) m.material.opacity = 0.25 + Math.sin(t * obj.speed) * 0.12
          break
        case 'expand_ring': {
          const cycle = (t * obj.speed) % (Math.PI * 2)
          const sc = 1 + (cycle / (Math.PI * 2)) * (obj.maxScale - 1)
          m.scale.set(sc, sc, 1)
          if (m.material) m.material.opacity = 0.15 * (1 - cycle / (Math.PI * 2))
          break
        }
        case 'waterfall':
          if (m.material) m.material.opacity = 0.25 + Math.sin(t * obj.speed * 3) * 0.1
          break
        case 'drone_hover':
          m.position.x = obj.originPos.x + Math.sin(t * 0.5) * 1.5
          m.position.y = obj.originPos.y + Math.sin(t * 0.8) * 0.3
          m.position.z = obj.originPos.z + Math.cos(t * 0.4) * 1
          m.rotation.y += 0.005
          break
      }
    }

    // ── Particles ──
    for (const p of this.particles) {
      const pos = p.points.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const sp = p.speeds[i]
        if (p.type === 'firefly') {
          pos.array[i * 3] += Math.sin(t * 2 + sp.phase) * sp.sx
          pos.array[i * 3 + 1] += Math.sin(t * 1.5 + sp.phase) * sp.sy
          pos.array[i * 3 + 2] += Math.cos(t * 2 + sp.phase) * sp.sz
        } else {
          pos.array[i * 3] += sp.sx
          pos.array[i * 3 + 1] += Math.sin(t * 0.5 + sp.phase) * sp.sy
          pos.array[i * 3 + 2] += sp.sz
          if (pos.array[i * 3] > 250) pos.array[i * 3] = -250
          if (pos.array[i * 3] < -250) pos.array[i * 3] = 250
          if (pos.array[i * 3 + 2] > 250) pos.array[i * 3 + 2] = -250
          if (pos.array[i * 3 + 2] < -250) pos.array[i * 3 + 2] = 250
        }
      }
      pos.needsUpdate = true
    }

    // ── Floating zone labels ──
    for (const label of this.zoneLabels) {
      const { baseY, phase } = label.userData
      label.position.y = baseY + Math.sin(t * 0.5 + phase) * 1.5
    }

    // ── Dynamic meshes ──
    for (const { mesh, body } of this.dynamicMeshes) {
      mesh.position.copy(body.position)
      mesh.quaternion.copy(body.quaternion)
    }
  }

  // ═══════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════

  dispose() {
    this.bodies.forEach(body => this.physics.world.removeBody(body))
    this.bodies = []
    this.physics.removeZoneColliders()

    this.group.traverse(child => {
      if (child.isMesh || child.isInstancedMesh || child.isLine || child.isPoints || child.isSprite) {
        child.geometry?.dispose()
        if (Array.isArray(child.material)) child.material.forEach(m => { m.map?.dispose(); m.dispose() })
        else { child.material?.map?.dispose(); child.material?.dispose() }
      }
    })

    this.scene.remove(this.group)
    for (const mat of Object.values(this._matPool)) mat.dispose()
    this._matPool = {}
    this.animatedObjects = []
    this.particles = []
    this.portals = []
    this.landmarks = []
    this.dynamicMeshes = []
    this.zoneLabels = []
    console.log('🧹 Production World disposed')
  }
}
