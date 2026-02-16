import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { EventEmitter } from './EventEmitter.js'

export class Resources extends EventEmitter {
  constructor(sources) {
    super()

    this.sources = sources
    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}

    // Texture loader
    this.loaders.textureLoader = new THREE.TextureLoader()

    // Cube texture loader
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()

    // GLTF loader with Draco compression support
    this.loaders.gltfLoader = new GLTFLoader()
    
    // Draco loader for compressed models
    this.loaders.dracoLoader = new DRACOLoader()
    // Use relative path for GitHub Pages compatibility
    const basePath = import.meta.env.BASE_URL || './'
    this.loaders.dracoLoader.setDecoderPath(`${basePath}draco/`)
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
  }

  startLoading() {
    // If no sources, trigger ready after a short delay
    // This ensures event listeners are set up first
    if (this.toLoad === 0) {
      setTimeout(() => {
        this.trigger('ready')
      }, 100)
      return
    }

    // Update loading bar
    const loadingBarFill = document.getElementById('loading-bar-fill')
    const loadingText = document.querySelector('.loading-text')

    const updateBar = () => {
      const pct = (this.loaded / this.toLoad) * 100
      if (loadingBarFill) loadingBarFill.style.width = `${pct}%`
    }

    const onError = (source, err) => {
      console.error(`❌ Failed to load ${source.type}: ${source.path}`, err)
      if (loadingText) loadingText.textContent = `Error loading ${source.name}...`
      // Count as loaded so we don't hang forever
      this.sourceLoaded(source, null)
      updateBar()
    }

    const onProgress = (source, xhr) => {
      if (xhr.lengthComputable && loadingText) {
        const mb = (xhr.loaded / 1048576).toFixed(1)
        loadingText.textContent = `Loading ${source.name}... ${mb}MB`
      }
    }

    // Load each source
    for (const source of this.sources) {
      switch (source.type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(
            source.path,
            (file) => { this.sourceLoaded(source, file); updateBar() },
            (xhr) => onProgress(source, xhr),
            (err) => onError(source, err)
          )
          break

        case 'texture':
          this.loaders.textureLoader.load(
            source.path,
            (file) => { this.sourceLoaded(source, file); updateBar() },
            undefined,
            (err) => onError(source, err)
          )
          break

        case 'cubeTexture':
          this.loaders.cubeTextureLoader.load(
            source.path,
            (file) => { this.sourceLoaded(source, file); updateBar() },
            undefined,
            (err) => onError(source, err)
          )
          break
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }
}
