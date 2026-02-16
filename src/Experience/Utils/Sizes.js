import { EventEmitter } from './EventEmitter.js'

export class Sizes extends EventEmitter {
  constructor() {
    super()

    // Setup
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Resize event (store ref for cleanup)
    this._onResize = () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)

      this.trigger('resize')
    }
    window.addEventListener('resize', this._onResize)
  }

  destroy() {
    window.removeEventListener('resize', this._onResize)
  }
}
