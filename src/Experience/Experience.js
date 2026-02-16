import * as THREE from 'three'
import { Sizes } from './Utils/Sizes.js'
import { Time } from './Utils/Time.js'
import { Physics } from './Utils/Physics.js'
import { Camera } from './Camera.js'
import { Renderer } from './Renderer.js'
import { World } from './World/World.js'
import { Resources } from './Utils/Resources.js'
import { UIManager } from './UIManager.js'
import { TouchControls } from './Utils/TouchControls.js'
import { sources } from './sources.js'

let instance = null

export class Experience {
  constructor(options = {}) {
    // Singleton pattern
    if (instance) {
      return instance
    }
    instance = this

    // Options
    this.canvas = options.canvas
    if (!this.canvas) {
      throw new Error('Canvas element not found!')
    }

    // Check WebGL availability
    const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl')
    if (!gl) {
      throw new Error('WebGL is not supported on this device/browser!')
    }

    // Debug mode
    this.debug = window.location.hash === '#debug'

    // FPS tracking
    this.fpsFrames = 0
    this.fpsTime = 0
    this.currentFPS = 60

    // Track initialization state
    this._initComplete = false

    try {
      // Setup core systems
      console.log('📦 Initializing core systems...')
      this.sizes = new Sizes()
      this.time = new Time()
      this.scene = new THREE.Scene()
      this.resources = new Resources(sources)
      this.physics = new Physics()
      this.camera = new Camera()
      this.renderer = new Renderer()

      // World (contains environment, player, portals, etc.)
      console.log('🌍 Creating world...')
      this.world = new World()

      // UI Manager (connects DOM to experience)
      console.log('🎨 Setting up UI...')
      this.uiManager = new UIManager()

      // Touch controls for mobile
      this.touchControls = new TouchControls()

      // Event listeners
      this.sizes.on('resize', () => this.resize())
      this.time.on('tick', () => this.update())

      // Resources loaded
      this.resources.on('ready', () => {
        this.onReady()
      })

      this._initComplete = true
      console.log('✅ Experience initialization complete — scene objects:', this.scene.children.length)
    } catch (initError) {
      console.error('❌ Experience initialization error:', initError)
      // Re-throw so main.js can catch it
      throw initError
    } finally {
      // ALWAYS hide loading screen, even if there was an error
      this.hideLoadingScreen()
    }

    // Auto-hide the controls panel after 5 seconds
    this.autoHideControls()
  }

  onReady() {
    this.hideLoadingScreen()
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    const deltaTime = this.time.delta / 1000

    // Physics first
    this.physics.update()

    // World (player, environment)
    this.world.update(deltaTime)

    // Camera follows player
    if (this.world.player && this.camera.thirdPerson) {
      this.camera.thirdPerson.follow(this.world.player.mesh, deltaTime)

      // Extend fog when zoomed far out so scene stays visible
      if (this.scene.fog) {
        const camDist = this.camera.thirdPerson.settings.distance
        if (camDist > 30) {
          this.scene.fog.near = camDist * 0.5
          this.scene.fog.far = camDist * 3
        }
      }
    }

    // Render
    this.renderer.update()

    // FPS tracking
    this.updateFPS()
  }

  updateFPS() {
    this.fpsFrames++
    this.fpsTime += this.time.delta

    if (this.fpsTime >= 1000) {
      this.currentFPS = this.fpsFrames
      this.fpsFrames = 0
      this.fpsTime = 0
      this.uiManager?.updateFPS(this.currentFPS)
    }
  }

  autoHideControls() {
    const instructions = document.getElementById('instructions')
    if (!instructions) return
    // Show on load
    instructions.classList.add('visible')
    // Hide after 5 seconds
    setTimeout(() => {
      instructions.classList.add('hiding')
      instructions.classList.remove('visible')
    }, 5000)
  }

  hideLoadingScreen() {
    if (this._loadingHidden) return
    this._loadingHidden = true

    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      loadingScreen.style.pointerEvents = 'none'
      setTimeout(() => {
        loadingScreen.style.display = 'none'
      }, 600)
    }
  }

  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')

    // Traverse the scene and dispose
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        for (const key in child.material) {
          const value = child.material[key]
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })

    // Cleanup systems
    this.uiManager?.destroy()
    this.world?.destroy()
    this.camera?.destroy()
    this.time?.destroy()
    this.sizes?.destroy()
    this.touchControls?.destroy()

    this.renderer.instance.dispose()
    instance = null
  }
}
