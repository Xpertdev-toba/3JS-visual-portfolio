import * as THREE from 'three'
import { Experience } from './Experience.js'

export class Renderer {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.setInstance()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    })
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(1) // Force 1x for performance
    
    // Tone mapping
    this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMappingExposure = 1.1
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    
    // Shadows - use basic for performance
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.BasicShadowMap
    
    // Background
    this.instance.setClearColor('#87ceeb')
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(1)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
