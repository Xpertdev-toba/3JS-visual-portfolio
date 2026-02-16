import { Experience } from './Experience.js'

/**
 * UI Manager - Handles all glass UI interactions
 * Connects Three.js experience with DOM elements
 */
export class UIManager {
  constructor() {
    this.experience = new Experience()
    
    // Cache DOM elements
    this.elements = {
      // Buttons
      btnTime: document.getElementById('btn-time'),
      btnAudio: document.getElementById('btn-audio'),
      btnSettings: document.getElementById('btn-settings'),
      
      // Panels
      timeControl: document.getElementById('time-control'),
      settingsPanel: document.getElementById('settings-panel'),
      
      // Time presets
      timePresets: document.querySelectorAll('.time-preset'),
      
      // Settings controls
      qualitySlider: document.getElementById('quality-slider'),
      qualityValue: document.getElementById('quality-value'),
      volumeSlider: document.getElementById('volume-slider'),
      volumeValue: document.getElementById('volume-value'),
      toggleCycle: document.getElementById('toggle-cycle'),
      toggleFps: document.getElementById('toggle-fps'),
      
      // Portal UI
      portalUI: document.getElementById('portal-ui'),
      portalTitle: document.getElementById('portal-title'),
      portalDescription: document.getElementById('portal-description'),
      portalClose: document.getElementById('portal-close'),
      portalEnter: document.getElementById('portal-enter'),
      
      // Project Modal
      projectModal: document.getElementById('project-modal'),
      modalTitle: document.getElementById('modal-title'),
      modalClose: document.getElementById('modal-close'),
      projectIframe: document.getElementById('project-iframe'),
      
      // Stats
      perfStats: document.getElementById('perf-stats'),
      fpsCounter: document.getElementById('fps-counter'),
      
      // Notifications
      notificationContainer: document.getElementById('notification-container')
    }

    this.currentPortalData = null
    this._listeners = [] // track all listeners for cleanup
    this.setupEventListeners()
    this.setupPortalEvents()
    this.setupEnvironmentToggle()
  }

  /** Helper to add event listener with auto-tracking for cleanup */
  _listen(target, event, handler, options) {
    if (!target) return
    target.addEventListener(event, handler, options)
    this._listeners.push({ target, event, handler, options })
  }

  setupEnvironmentToggle() {
    const btn = document.getElementById('env-toggle')
    const label = document.getElementById('env-toggle-label')
    if (!btn) return

    this._listen(btn, 'click', () => {
      window.dispatchEvent(new CustomEvent('toggleEnvironment'))
    })

    this._listen(window, 'environmentChanged', (e) => {
      const mode = e.detail.mode
      if (label) {
        label.textContent = mode === 'test' ? '🧪 Test' : '🌳 Forest'
      }
      btn.setAttribute('data-mode', mode)
    })
  }

  setupEventListeners() {
    // Time button
    this._listen(this.elements.btnTime, 'click', () => {
      this.togglePanel('timeControl')
    })

    // Audio button
    this._listen(this.elements.btnAudio, 'click', () => {
      this.toggleAudio()
    })

    // Settings button
    this._listen(this.elements.btnSettings, 'click', () => {
      this.togglePanel('settingsPanel')
    })

    // Time presets
    this.elements.timePresets?.forEach(preset => {
      this._listen(preset, 'click', () => {
        this.setTimePreset(preset.dataset.preset)
        this.elements.timePresets.forEach(p => p.classList.remove('active'))
        preset.classList.add('active')
      })
    })

    // Quality slider
    this._listen(this.elements.qualitySlider, 'input', (e) => {
      const levels = ['Low', 'Medium', 'High']
      const value = parseInt(e.target.value)
      this.elements.qualityValue.textContent = levels[value]
      this.setQuality(value)
    })

    // Volume slider
    this._listen(this.elements.volumeSlider, 'input', (e) => {
      const value = parseInt(e.target.value)
      this.elements.volumeValue.textContent = `${value}%`
      this.setVolume(value / 100)
    })

    // Toggle cycle
    this._listen(this.elements.toggleCycle, 'click', () => {
      this.elements.toggleCycle.classList.toggle('active')
      this.toggleDayNightCycle()
    })

    // Toggle FPS
    this._listen(this.elements.toggleFps, 'click', () => {
      this.elements.toggleFps.classList.toggle('active')
      this.toggleFpsDisplay()
    })

    // Portal close
    this._listen(this.elements.portalClose, 'click', () => {
      this.hidePortalUI()
    })

    // Portal enter
    this._listen(this.elements.portalEnter, 'click', () => {
      this.enterPortal()
    })

    // Modal close
    this._listen(this.elements.modalClose, 'click', () => {
      this.closeProjectModal()
    })

    // Click outside modal to close
    this._listen(this.elements.projectModal, 'click', (e) => {
      if (e.target === this.elements.projectModal) {
        this.closeProjectModal()
      }
    })

    // Escape key to close panels
    this._listen(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPanels()
        this.closeProjectModal()
      }
    })
  }

  setupPortalEvents() {
    this._listen(window, 'portalEnter', (e) => {
      this.showPortalUI(e.detail)
    })

    this._listen(window, 'portalExit', () => {
      this.hidePortalUI()
    })

    this._listen(window, 'portalActivate', (e) => {
      this.openProjectModal(e.detail)
    })
  }

  togglePanel(panelName) {
    const panel = this.elements[panelName]
    if (!panel) return

    // Close other panels
    if (panelName !== 'timeControl') {
      this.elements.timeControl?.classList.remove('visible')
    }
    if (panelName !== 'settingsPanel') {
      this.elements.settingsPanel?.classList.remove('visible')
    }

    // Toggle current panel
    panel.classList.toggle('visible')
  }

  closeAllPanels() {
    this.elements.timeControl?.classList.remove('visible')
    this.elements.settingsPanel?.classList.remove('visible')
    this.hidePortalUI()
  }

  toggleAudio() {
    const audioManager = this.experience.audioManager
    if (audioManager) {
      const isMuted = audioManager.toggleMute()
      this.elements.btnAudio.textContent = isMuted ? '🔇' : '🔊'
      this.elements.btnAudio.classList.toggle('active', !isMuted)
    } else {
      this.notify('Audio coming soon', 'info')
    }
  }

  setTimePreset(preset) {
    const env = this.experience.world?.environment
    if (env) {
      env.setPreset(preset)
    }
  }

  setQuality(level) {
    const renderer = this.experience.renderer
    if (!renderer) return

    switch (level) {
      case 0: // Low
        renderer.instance.setPixelRatio(1)
        if (this.experience.postProcessing) {
          this.experience.postProcessing.bloomEffect.intensity = 0
        }
        break
      case 1: // Medium
        renderer.instance.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
        if (this.experience.postProcessing) {
          this.experience.postProcessing.bloomEffect.intensity = 0.3
        }
        break
      case 2: // High
        renderer.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        if (this.experience.postProcessing) {
          this.experience.postProcessing.bloomEffect.intensity = 0.5
        }
        break
    }
  }

  setVolume(value) {
    const audioManager = this.experience.audioManager
    if (audioManager) {
      audioManager.setMasterVolume(value)
    }
    // Update UI regardless
    if (this.elements.volumeValue) {
      this.elements.volumeValue.textContent = `${Math.round(value * 100)}%`
    }
  }

  toggleDayNightCycle() {
    // Auto day/night cycle not yet implemented
    this.notify('Auto cycle coming soon')
  }

  toggleFpsDisplay() {
    const isVisible = this.elements.perfStats?.classList.toggle('visible')
    return isVisible
  }

  showPortalUI(data) {
    this.currentPortalData = data
    
    if (this.elements.portalTitle) {
      this.elements.portalTitle.textContent = data.title || 'Portal'
    }
    if (this.elements.portalDescription) {
      this.elements.portalDescription.textContent = data.description || ''
    }
    
    this.elements.portalUI?.classList.add('visible')
  }

  hidePortalUI() {
    this.elements.portalUI?.classList.remove('visible')
    this.currentPortalData = null
  }

  enterPortal() {
    if (!this.currentPortalData) return

    // Dispatch event for PortalSystem to handle transition
    window.dispatchEvent(new CustomEvent('portalActivate', {
      detail: this.currentPortalData.data
    }))

    this.openProjectModal(this.currentPortalData.data)
  }

  openProjectModal(data) {
    if (this.elements.modalTitle) {
      this.elements.modalTitle.textContent = data.title || 'Project'
    }
    
    if (this.elements.projectIframe && data.url) {
      this.elements.projectIframe.src = data.url
    }
    
    this.elements.projectModal?.classList.add('active')
  }

  closeProjectModal() {
    this.elements.projectModal?.classList.remove('active')
    
    if (this.elements.projectIframe) {
      this.elements.projectIframe.src = 'about:blank'
    }
  }

  /**
   * Show notification
   */
  notify(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    
    this.elements.notificationContainer?.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateY(-20px)'
      setTimeout(() => notification.remove(), 300)
    }, duration)
  }

  /**
   * Update FPS counter
   */
  updateFPS(fps) {
    if (this.elements.fpsCounter) {
      this.elements.fpsCounter.textContent = Math.round(fps)
    }
  }

  destroy() {
    // Remove all tracked event listeners
    for (const { target, event, handler, options } of this._listeners) {
      target.removeEventListener(event, handler, options)
    }
    this._listeners = []
  }
}
