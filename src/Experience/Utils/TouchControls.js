import { Experience } from '../Experience.js'

/**
 * Touch controls with virtual joystick for mobile devices
 * Handles movement and camera rotation on touch screens
 */
export class TouchControls {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas

    // State
    this.isEnabled = false
    this.isTouchDevice = this.detectTouchDevice()
    
    // Movement joystick
    this.moveJoystick = {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      touchId: null
    }

    // Camera joystick (right side)
    this.cameraJoystick = {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      touchId: null
    }

    // Jump button
    this.jumpRequested = false

    // Settings
    this.settings = {
      joystickRadius: 60,
      deadzone: 0.1,
      sensitivity: 1.0,
      cameraSensitivity: 0.003
    }

    // UI elements
    this.uiElements = {}

    if (this.isTouchDevice) {
      this.createUI()
      this.setupEventListeners()
      this.enable()
    }
  }

  /**
   * Detect if device supports touch
   */
  detectTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    )
  }

  /**
   * Create touch control UI
   */
  createUI() {
    // Container
    const container = document.createElement('div')
    container.id = 'touch-controls'
    container.innerHTML = `
      <style>
        #touch-controls {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          display: none;
        }
        
        #touch-controls.enabled {
          display: block;
        }
        
        .joystick-zone {
          position: absolute;
          bottom: 20px;
          width: 150px;
          height: 150px;
          pointer-events: auto;
        }
        
        .joystick-zone.left {
          left: 20px;
        }
        
        .joystick-zone.right {
          right: 20px;
        }
        
        .joystick-base {
          position: absolute;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          backdrop-filter: blur(10px);
        }
        
        .joystick-stick {
          position: absolute;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease-out;
        }
        
        .jump-button {
          position: absolute;
          bottom: 180px;
          right: 50px;
          width: 70px;
          height: 70px;
          background: rgba(102, 126, 234, 0.3);
          border: 2px solid rgba(102, 126, 234, 0.6);
          border-radius: 50%;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 24px;
          font-weight: bold;
          backdrop-filter: blur(10px);
          user-select: none;
          -webkit-user-select: none;
        }
        
        .jump-button:active {
          background: rgba(102, 126, 234, 0.6);
          transform: scale(0.95);
        }
        
        .action-button {
          position: absolute;
          bottom: 100px;
          right: 130px;
          width: 60px;
          height: 60px;
          background: rgba(118, 75, 162, 0.3);
          border: 2px solid rgba(118, 75, 162, 0.6);
          border-radius: 50%;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 20px;
          backdrop-filter: blur(10px);
          user-select: none;
          -webkit-user-select: none;
        }
      </style>
      
      <div class="joystick-zone left" id="move-joystick-zone">
        <div class="joystick-base">
          <div class="joystick-stick" id="move-stick"></div>
        </div>
      </div>
      
      <div class="joystick-zone right" id="camera-joystick-zone">
        <div class="joystick-base">
          <div class="joystick-stick" id="camera-stick"></div>
        </div>
      </div>
      
      <div class="jump-button" id="jump-button">⬆</div>
      <div class="action-button" id="action-button">✦</div>
    `

    document.body.appendChild(container)
    
    this.uiElements = {
      container,
      moveZone: container.querySelector('#move-joystick-zone'),
      moveStick: container.querySelector('#move-stick'),
      cameraZone: container.querySelector('#camera-joystick-zone'),
      cameraStick: container.querySelector('#camera-stick'),
      jumpButton: container.querySelector('#jump-button'),
      actionButton: container.querySelector('#action-button')
    }
  }

  /**
   * Setup touch event listeners
   */
  setupEventListeners() {
    // Move joystick
    this.uiElements.moveZone.addEventListener('touchstart', (e) => this.onMoveStart(e), { passive: false })
    this.uiElements.moveZone.addEventListener('touchmove', (e) => this.onMoveMove(e), { passive: false })
    this.uiElements.moveZone.addEventListener('touchend', (e) => this.onMoveEnd(e))
    this.uiElements.moveZone.addEventListener('touchcancel', (e) => this.onMoveEnd(e))

    // Camera joystick
    this.uiElements.cameraZone.addEventListener('touchstart', (e) => this.onCameraStart(e), { passive: false })
    this.uiElements.cameraZone.addEventListener('touchmove', (e) => this.onCameraMove(e), { passive: false })
    this.uiElements.cameraZone.addEventListener('touchend', (e) => this.onCameraEnd(e))
    this.uiElements.cameraZone.addEventListener('touchcancel', (e) => this.onCameraEnd(e))

    // Jump button
    this.uiElements.jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault()
      this.jumpRequested = true
    })
    this.uiElements.jumpButton.addEventListener('touchend', () => {
      this.jumpRequested = false
    })

    // Action button
    this.uiElements.actionButton.addEventListener('touchstart', (e) => {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('touchAction'))
    })
  }

  onMoveStart(event) {
    event.preventDefault()
    const touch = event.changedTouches[0]
    const rect = this.uiElements.moveZone.getBoundingClientRect()
    
    this.moveJoystick.active = true
    this.moveJoystick.touchId = touch.identifier
    this.moveJoystick.startX = rect.left + rect.width / 2
    this.moveJoystick.startY = rect.top + rect.height / 2
    this.moveJoystick.currentX = touch.clientX
    this.moveJoystick.currentY = touch.clientY
    
    this.updateMoveStick()
  }

  onMoveMove(event) {
    event.preventDefault()
    if (!this.moveJoystick.active) return
    
    for (const touch of event.changedTouches) {
      if (touch.identifier === this.moveJoystick.touchId) {
        this.moveJoystick.currentX = touch.clientX
        this.moveJoystick.currentY = touch.clientY
        this.updateMoveStick()
        break
      }
    }
  }

  onMoveEnd(event) {
    for (const touch of event.changedTouches) {
      if (touch.identifier === this.moveJoystick.touchId) {
        this.moveJoystick.active = false
        this.moveJoystick.deltaX = 0
        this.moveJoystick.deltaY = 0
        this.uiElements.moveStick.style.transform = 'translate(-50%, -50%)'
        break
      }
    }
  }

  updateMoveStick() {
    let dx = this.moveJoystick.currentX - this.moveJoystick.startX
    let dy = this.moveJoystick.currentY - this.moveJoystick.startY
    
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = this.settings.joystickRadius
    
    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance
      dy = (dy / distance) * maxDistance
    }
    
    // Normalized values (-1 to 1)
    this.moveJoystick.deltaX = dx / maxDistance
    this.moveJoystick.deltaY = dy / maxDistance
    
    // Apply deadzone
    if (Math.abs(this.moveJoystick.deltaX) < this.settings.deadzone) {
      this.moveJoystick.deltaX = 0
    }
    if (Math.abs(this.moveJoystick.deltaY) < this.settings.deadzone) {
      this.moveJoystick.deltaY = 0
    }
    
    // Update visual
    this.uiElements.moveStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
  }

  onCameraStart(event) {
    event.preventDefault()
    const touch = event.changedTouches[0]
    
    this.cameraJoystick.active = true
    this.cameraJoystick.touchId = touch.identifier
    this.cameraJoystick.startX = touch.clientX
    this.cameraJoystick.startY = touch.clientY
  }

  onCameraMove(event) {
    event.preventDefault()
    if (!this.cameraJoystick.active) return
    
    for (const touch of event.changedTouches) {
      if (touch.identifier === this.cameraJoystick.touchId) {
        const dx = touch.clientX - this.cameraJoystick.startX
        const dy = touch.clientY - this.cameraJoystick.startY
        
        this.cameraJoystick.deltaX = dx * this.settings.cameraSensitivity
        this.cameraJoystick.deltaY = dy * this.settings.cameraSensitivity
        
        // Update visual
        const clampedDx = Math.max(-this.settings.joystickRadius, Math.min(this.settings.joystickRadius, dx))
        const clampedDy = Math.max(-this.settings.joystickRadius, Math.min(this.settings.joystickRadius, dy))
        this.uiElements.cameraStick.style.transform = `translate(calc(-50% + ${clampedDx}px), calc(-50% + ${clampedDy}px))`
        
        // Reset start for continuous rotation
        this.cameraJoystick.startX = touch.clientX
        this.cameraJoystick.startY = touch.clientY
        break
      }
    }
  }

  onCameraEnd(event) {
    for (const touch of event.changedTouches) {
      if (touch.identifier === this.cameraJoystick.touchId) {
        this.cameraJoystick.active = false
        this.cameraJoystick.deltaX = 0
        this.cameraJoystick.deltaY = 0
        this.uiElements.cameraStick.style.transform = 'translate(-50%, -50%)'
        break
      }
    }
  }

  /**
   * Get current input state
   */
  getInput() {
    return {
      moveX: this.moveJoystick.deltaX * this.settings.sensitivity,
      moveY: -this.moveJoystick.deltaY * this.settings.sensitivity, // Invert Y
      cameraX: this.cameraJoystick.deltaX,
      cameraY: this.cameraJoystick.deltaY,
      jump: this.jumpRequested
    }
  }

  enable() {
    this.isEnabled = true
    if (this.uiElements.container) {
      this.uiElements.container.classList.add('enabled')
    }
  }

  disable() {
    this.isEnabled = false
    if (this.uiElements.container) {
      this.uiElements.container.classList.remove('enabled')
    }
  }

  /**
   * Toggle visibility based on device orientation
   */
  checkOrientation() {
    if (window.innerWidth < window.innerHeight) {
      // Portrait - show controls
      this.enable()
    }
  }

  destroy() {
    if (this.uiElements.container) {
      this.uiElements.container.remove()
    }
  }
}
