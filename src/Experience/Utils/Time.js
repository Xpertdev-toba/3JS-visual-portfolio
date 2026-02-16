import { EventEmitter } from './EventEmitter.js'

export class Time extends EventEmitter {
  constructor() {
    super()

    // Setup
    this.start = Date.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16
    this.rafId = null

    // Start the tick loop
    this.rafId = window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  tick() {
    const currentTime = Date.now()
    this.delta = currentTime - this.current
    this.current = currentTime
    this.elapsed = this.current - this.start

    this.trigger('tick')

    this.rafId = window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  destroy() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}
