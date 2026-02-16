import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * InteractionSystem — Proximity Detection & Input Handling
 * ═══════════════════════════════════════════════════════════════════════════
 * Manages player interactions with world objects, portfolio panels, and portals.
 *
 * Features:
 * - Proximity-based interaction detection
 * - Raycasting for precise targeting
 * - Keyboard/touch interaction triggers
 * - Interaction cooldowns to prevent spam
 * - Visual interaction prompts
 */

export class InteractionSystem {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    // Configuration
    this.config = {
      interactionRadius: 5,        // Distance to detect nearby interactables
      raycastDistance: 8,          // Max raycast distance for precise targeting
      interactionCooldown: 300,    // MS between interactions
      promptFadeDistance: 3,       // Distance at which prompt starts fading
    }

    // State
    this.nearbyInteractables = []
    this.currentTarget = null
    this.lastInteractionTime = 0
    this.isInteracting = false

    // Raycaster for precise targeting
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = this.config.raycastDistance

    // Pre-allocated vectors
    this._tempVec = new THREE.Vector3()
    this._direction = new THREE.Vector3()

    // Callbacks
    this.onInteract = null
    this.onTargetChange = null
    this.onNearbyChange = null

    this._setupControls()
  }

  _setupControls() {
    this._onKeyDown = (e) => {
      if (e.code === 'KeyE' && !e.repeat) {
        this.tryInteract()
      }
    }

    window.addEventListener('keydown', this._onKeyDown)
  }

  /**
   * Set the list of interactable objects to check
   * @param {Array<THREE.Object3D>} objects - Objects with userData.isInteractable = true
   */
  setInteractables(objects) {
    this.interactables = objects
  }

  /**
   * Check for nearby interactables and update current target
   * @param {THREE.Vector3} playerPosition - Player's world position
   * @param {THREE.Vector3} playerDirection - Player's forward direction
   */
  update(playerPosition, playerDirection) {
    if (!this.interactables || this.interactables.length === 0) return

    // Find all interactables within radius
    const nearby = []
    for (const obj of this.interactables) {
      if (!obj.userData?.isInteractable) continue
      if (!obj.visible && obj.parent && !obj.parent.visible) continue

      // Get world position
      obj.getWorldPosition(this._tempVec)
      const distance = playerPosition.distanceTo(this._tempVec)

      if (distance <= this.config.interactionRadius) {
        nearby.push({ object: obj, distance })
      }
    }

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance)

    // Check if nearby list changed
    const nearbyChanged = this._hasNearbyChanged(nearby)
    if (nearbyChanged) {
      this.nearbyInteractables = nearby
      if (this.onNearbyChange) {
        this.onNearbyChange(nearby.map(n => n.object))
      }
    }

    // Find best target using raycast from player
    this._updateTarget(playerPosition, playerDirection)
  }

  _updateTarget(playerPosition, playerDirection) {
    let newTarget = null
    let minScore = Infinity

    // Score each nearby interactable based on distance and angle to player's forward
    for (const { object, distance } of this.nearbyInteractables) {
      object.getWorldPosition(this._tempVec)

      // Direction from player to object
      this._direction.copy(this._tempVec).sub(playerPosition).normalize()

      // Angle between player forward and object direction
      const dot = playerDirection.dot(this._direction)
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)))

      // Score: prioritize objects directly ahead and closer
      // Objects behind the player (angle > 90°) get penalized heavily
      const anglePenalty = angle > Math.PI / 2 ? 1000 : angle * 2
      const score = distance + anglePenalty

      if (score < minScore && score < this.config.interactionRadius * 2) {
        minScore = score
        newTarget = object
      }
    }

    // Check if target changed
    if (newTarget !== this.currentTarget) {
      // Notify old target (unhover)
      if (this.currentTarget) {
        this._setObjectHovered(this.currentTarget, false)
      }

      // Update target
      this.currentTarget = newTarget

      // Notify new target (hover)
      if (newTarget) {
        this._setObjectHovered(newTarget, true)
      }

      // Callback
      if (this.onTargetChange) {
        this.onTargetChange(newTarget)
      }
    }
  }

  _setObjectHovered(obj, hovered) {
    // Check if it's a panel reference
    if (obj.userData?.panelRef) {
      obj.userData.panelRef.setHovered(hovered)
    }

    // Emit hover event
    if (hovered) {
      window.dispatchEvent(new CustomEvent('interactableHover', {
        detail: { object: obj, userData: obj.userData }
      }))
    } else {
      window.dispatchEvent(new CustomEvent('interactableUnhover', {
        detail: { object: obj, userData: obj.userData }
      }))
    }
  }

  _hasNearbyChanged(newNearby) {
    if (newNearby.length !== this.nearbyInteractables.length) return true
    for (let i = 0; i < newNearby.length; i++) {
      if (newNearby[i].object !== this.nearbyInteractables[i]?.object) return true
    }
    return false
  }

  /**
   * Attempt to interact with current target
   * @returns {boolean} Whether interaction was triggered
   */
  tryInteract() {
    // Cooldown check
    const now = performance.now()
    if (now - this.lastInteractionTime < this.config.interactionCooldown) {
      return false
    }

    if (!this.currentTarget) return false

    this.lastInteractionTime = now
    this.isInteracting = true

    // Get interaction data
    const userData = this.currentTarget.userData
    const interactionData = {
      object: this.currentTarget,
      type: userData.type || 'generic',
      projectId: userData.projectId,
      zoneId: userData.zoneId,
      zoneName: userData.zoneName,
      isPortal: userData.isPortal,
      portalId: userData.portalId,
      toZone: userData.toZone,
      destination: userData.destination,
      panelRef: userData.panelRef,
    }

    // Trigger panel interaction if it's a panel
    if (userData.panelRef) {
      userData.panelRef.interact()
    }

    // Callback
    if (this.onInteract) {
      this.onInteract(interactionData)
    }

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('interact', { detail: interactionData }))

    // Reset interaction state after a short delay
    setTimeout(() => {
      this.isInteracting = false
    }, 100)

    return true
  }

  /**
   * Get current target info
   */
  getCurrentTarget() {
    if (!this.currentTarget) return null
    return {
      object: this.currentTarget,
      userData: this.currentTarget.userData,
      distance: this._getDistanceToPlayer(this.currentTarget),
    }
  }

  _getDistanceToPlayer(obj) {
    const player = this.experience.world?.player
    if (!player) return Infinity
    obj.getWorldPosition(this._tempVec)
    return player.mesh.position.distanceTo(this._tempVec)
  }

  /**
   * Check if player is near any interactable
   */
  hasNearbyInteractables() {
    return this.nearbyInteractables.length > 0
  }

  /**
   * Cleanup
   */
  dispose() {
    window.removeEventListener('keydown', this._onKeyDown)
    this.interactables = []
    this.nearbyInteractables = []
    this.currentTarget = null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTION PROMPT (HUD Element)
// ═══════════════════════════════════════════════════════════════════════════

export class InteractionPrompt {
  constructor() {
    this.element = null
    this.visible = false
    this._createPrompt()
  }

  _createPrompt() {
    this.element = document.createElement('div')
    this.element.id = 'interaction-prompt'
    this.element.innerHTML = `
      <div class="prompt-content">
        <span class="prompt-key">E</span>
        <span class="prompt-text">Interact</span>
      </div>
    `

    // Styles
    this.element.style.cssText = `
      position: fixed;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      pointer-events: none;
      z-index: 50;
      transition: opacity 0.2s ease, transform 0.2s ease;
    `

    const style = document.createElement('style')
    style.textContent = `
      #interaction-prompt .prompt-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 24px;
        background: rgba(10, 15, 30, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }
      #interaction-prompt .prompt-key {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        font-family: "SF Pro Display", -apple-system, sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }
      #interaction-prompt .prompt-text {
        font-family: "SF Pro Display", -apple-system, sans-serif;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      #interaction-prompt.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    `

    document.head.appendChild(style)
    document.body.appendChild(this.element)
  }

  show(text = 'Interact') {
    if (this.visible) return
    this.visible = true
    this.element.querySelector('.prompt-text').textContent = text
    this.element.classList.add('visible')
  }

  hide() {
    if (!this.visible) return
    this.visible = false
    this.element.classList.remove('visible')
  }

  setText(text) {
    this.element.querySelector('.prompt-text').textContent = text
  }

  setKey(key) {
    this.element.querySelector('.prompt-key').textContent = key
  }

  dispose() {
    this.element?.remove()
  }
}
