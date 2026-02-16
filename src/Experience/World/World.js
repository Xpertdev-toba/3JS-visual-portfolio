import { Experience } from '../Experience.js'
import { Environment } from './Environment.js'
import { Player } from './Player.js'
import { TestEnvironment } from './TestEnvironment.js'
import { ForestEnvironment } from './ForestEnvironment.js'
import { PortfolioShowcase } from '../Systems/PortfolioShowcase.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

/**
 * World - Main orchestrator with environment toggle
 * Supports two modes: 'test' (block world) and 'forest' (GLB environment)
 */
export class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.physics = this.experience.physics

    // Environment mode: 'test' | 'forest'
    this.activeMode = 'test'
    this.activeEnvironment = null

    // Lazy-loaded forest model cache
    this.forestModel = null
    this.forestLoading = false

    // Portfolio showcase system (world-space UI panels)
    this.portfolioShowcase = null

    // Zone tracking
    this.currentZone = null
    this.visitedZones = new Set(['HUB'])

    // Core systems (always present)
    this.environment = new Environment()
    this.player = new Player()

    // Start with test environment immediately (no GLB needed)
    this.createTestEnvironment()

    // Listen for toggle events from UI
    this._onToggle = () => this.toggleEnvironment()
    window.addEventListener('toggleEnvironment', this._onToggle)
  }

  createTestEnvironment() {
    this.disposeCurrentEnvironment()
    this.activeMode = 'test'
    this.activeEnvironment = new TestEnvironment()
    
    // Initialize portfolio showcase with world-space UI panels
    this.portfolioShowcase = new PortfolioShowcase(this.activeEnvironment.zones)
    
    this.player.teleport({ x: 0, y: 2, z: 5 })
    console.log('🧪 Switched to Test Environment')
    this.updateToggleUI()
  }

  createForestEnvironment() {
    if (this.forestLoading) {
      console.warn('⚠️ Forest GLB still loading...')
      return
    }

    // If already cached, use it
    if (this.forestModel) {
      this._switchToForest()
      return
    }

    // Lazy-load the forest GLB on first toggle
    this.forestLoading = true
    console.log('🌳 Loading forest GLB...')
    this.experience.uiManager?.notify('Loading forest environment...', 'info', 5000)

    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    // Use relative path for GitHub Pages compatibility
    const basePath = import.meta.env.BASE_URL || './'
    dracoLoader.setDecoderPath(`${basePath}draco/`)
    gltfLoader.setDRACOLoader(dracoLoader)

    gltfLoader.load(
      'models/environment/free_low_poly_forest.glb',
      (gltf) => {
        this.forestModel = gltf
        this.resources.items['forestEnvironment'] = gltf
        this.forestLoading = false
        console.log('✅ Forest GLB loaded')
        this._switchToForest()
        dracoLoader.dispose()
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100)
          console.log(`🌳 Forest loading: ${pct}%`)
        }
      },
      (err) => {
        this.forestLoading = false
        console.error('❌ Failed to load forest GLB', err)
        this.experience.uiManager?.notify('Failed to load forest', 'error')
        dracoLoader.dispose()
      }
    )
  }

  _switchToForest() {
    this.disposeCurrentEnvironment()
    this.activeMode = 'forest'
    this.activeEnvironment = new ForestEnvironment()
    this.player.teleport({ x: 0, y: 2, z: 5 })
    console.log('🌳 Switched to Forest Environment')
    this.updateToggleUI()
  }

  toggleEnvironment() {
    if (this.activeMode === 'test') {
      this.createForestEnvironment()
    } else {
      this.createTestEnvironment()
    }
  }

  disposeCurrentEnvironment() {
    if (this.portfolioShowcase) {
      this.portfolioShowcase.dispose()
      this.portfolioShowcase = null
    }
    if (this.activeEnvironment) {
      this.activeEnvironment.dispose()
      this.activeEnvironment = null
    }
    this.currentZone = null
  }

  updateToggleUI() {
    window.dispatchEvent(new CustomEvent('environmentChanged', {
      detail: { mode: this.activeMode }
    }))
  }

  update(deltaTime) {
    // Update player
    if (this.player) {
      this.player.update()

      // Zone tracking (forest environment has zones)
      if (this.activeEnvironment && this.activeEnvironment.getZoneAtPosition) {
        const pos = this.player.mesh.position
        const zone = this.activeEnvironment.getZoneAtPosition(pos)

        if (zone && zone.id !== this.currentZone) {
          this.onZoneEnter(zone)
        } else if (!zone && this.currentZone) {
          this.onZoneExit()
        }
      }
    }

    // Update environment (sync dynamic objects)
    if (this.activeEnvironment) {
      this.activeEnvironment.update(deltaTime)
    }

    // Update portfolio showcase (world-space UI panels)
    if (this.portfolioShowcase) {
      this.portfolioShowcase.update(deltaTime)
    }
  }

  onZoneEnter(zone) {
    const isFirstVisit = !this.visitedZones.has(zone.id)
    this.currentZone = zone.id
    this.visitedZones.add(zone.id)

    console.log(`📍 Entered: ${zone.name}`)
    window.dispatchEvent(new CustomEvent('zoneChange', {
      detail: {
        zoneId: zone.id,
        zoneName: zone.name,
        firstVisit: isFirstVisit
      }
    }))
  }

  onZoneExit() {
    console.log(`📍 Left zone: ${this.currentZone}`)
    this.currentZone = null
    window.dispatchEvent(new CustomEvent('zoneChange', {
      detail: { zoneId: null }
    }))
  }

  teleportToZone(zoneId) {
    if (this.activeEnvironment?.getZoneSpawnPoint && this.player) {
      const spawn = this.activeEnvironment.getZoneSpawnPoint(zoneId)
      this.player.teleport(spawn)
    }
  }

  destroy() {
    this.disposeCurrentEnvironment()
    this.player?.dispose()
    this.environment?.dispose?.()
    window.removeEventListener('toggleEnvironment', this._onToggle)
  }
}
