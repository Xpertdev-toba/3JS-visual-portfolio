import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * WorldSpaceUI — 3D World-Space UI Panel System
 * ═══════════════════════════════════════════════════════════════════════════
 * Creates interactive UI panels rendered directly in 3D space (not screen overlay).
 * Uses canvas textures for crisp text and dynamic content updates.
 *
 * Features:
 * - Canvas-based texture rendering for text and images
 * - Billboard mode (always faces camera) or fixed rotation
 * - Distance-based visibility and LOD
 * - Hover/selection states
 * - Smooth animations
 *
 * USAGE:
 * const panel = new WorldSpacePanel({
 *   width: 4, height: 3,
 *   position: new THREE.Vector3(0, 2, 0),
 *   title: 'Project Name',
 *   subtitle: 'Subtitle',
 *   description: 'Description text...',
 *   accentColor: 0x4A90D9,
 *   thumbnailUrl: 'path/to/image.jpg',
 *   billboard: false,
 * })
 */

// ═══════════════════════════════════════════════════════════════════════════
// WORLD SPACE PANEL CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class WorldSpacePanel {
  constructor(options = {}) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // Configuration
    this.config = {
      width: options.width ?? 4,
      height: options.height ?? 3,
      resolution: options.resolution ?? 512, // Canvas pixels per unit
      position: options.position ?? new THREE.Vector3(0, 2, 0),
      rotation: options.rotation ?? 0,
      billboard: options.billboard ?? false,
      fadeDistance: options.fadeDistance ?? 50,
      maxDistance: options.maxDistance ?? 80,
      accentColor: options.accentColor ?? 0x4A90D9,
      backgroundColor: options.backgroundColor ?? 'rgba(10, 15, 30, 0.92)',
      glassEffect: options.glassEffect ?? true,
    }

    // Content
    this.content = {
      title: options.title ?? '',
      subtitle: options.subtitle ?? '',
      description: options.description ?? '',
      thumbnailUrl: options.thumbnailUrl ?? null,
      tags: options.tags ?? [],
      type: options.type ?? 'info',
      projectId: options.projectId ?? null,
    }

    // State
    this.state = {
      visible: true,
      hovered: false,
      selected: false,
      opacity: 1,
      scale: 1,
    }

    // Callbacks
    this.onInteract = options.onInteract ?? null
    this.onHover = options.onHover ?? null

    // Three.js objects
    this.group = new THREE.Group()
    this.group.name = `Panel_${this.content.projectId || 'unnamed'}`
    this.mesh = null
    this.glowMesh = null
    this.interactionMesh = null
    this.canvas = null
    this.ctx = null
    this.texture = null

    // Pre-allocated vectors
    this._tempVec = new THREE.Vector3()

    this._init()
  }

  _init() {
    this._createCanvas()
    this._createMesh()
    this._createGlow()
    this._createInteractionZone()
    this._renderContent()

    this.group.position.copy(this.config.position)
    this.group.rotation.y = this.config.rotation

    this.scene.add(this.group)
  }

  _createCanvas() {
    const pixelWidth = Math.floor(this.config.width * this.config.resolution)
    const pixelHeight = Math.floor(this.config.height * this.config.resolution)

    this.canvas = document.createElement('canvas')
    this.canvas.width = pixelWidth
    this.canvas.height = pixelHeight
    this.ctx = this.canvas.getContext('2d')

    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.minFilter = THREE.LinearFilter
    this.texture.magFilter = THREE.LinearFilter
    this.texture.anisotropy = 1
  }

  _createMesh() {
    const geometry = new THREE.PlaneGeometry(this.config.width, this.config.height)

    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.renderOrder = 10 // Render after opaque objects
    this.group.add(this.mesh)
  }

  _createGlow() {
    if (!this.config.glassEffect) return

    // Subtle glow border
    const glowGeo = new THREE.PlaneGeometry(
      this.config.width + 0.15,
      this.config.height + 0.15
    )
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.config.accentColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    this.glowMesh = new THREE.Mesh(glowGeo, glowMat)
    this.glowMesh.position.z = -0.01
    this.glowMesh.renderOrder = 9
    this.group.add(this.glowMesh)
  }

  _createInteractionZone() {
    // Invisible mesh for raycasting (slightly larger than panel)
    const interactGeo = new THREE.PlaneGeometry(
      this.config.width + 0.5,
      this.config.height + 0.5
    )
    const interactMat = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
    })

    this.interactionMesh = new THREE.Mesh(interactGeo, interactMat)
    this.interactionMesh.position.z = 0.05
    this.interactionMesh.userData = {
      isInteractable: true,
      panelRef: this,
      projectId: this.content.projectId,
      type: this.content.type,
    }
    this.group.add(this.interactionMesh)
  }

  _renderContent() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height
    const padding = w * 0.06
    const accentHex = '#' + this.config.accentColor.toString(16).padStart(6, '0')

    // Clear canvas
    ctx.clearRect(0, 0, w, h)

    // Background with glass effect
    if (this.config.glassEffect) {
      // Dark gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
      bgGrad.addColorStop(0, 'rgba(15, 20, 35, 0.95)')
      bgGrad.addColorStop(1, 'rgba(8, 12, 25, 0.98)')
      ctx.fillStyle = bgGrad
      this._roundRect(ctx, 0, 0, w, h, w * 0.03)
      ctx.fill()

      // Subtle border
      ctx.strokeStyle = accentHex
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.4
      this._roundRect(ctx, 2, 2, w - 4, h - 4, w * 0.03)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Top accent line
      ctx.fillStyle = accentHex
      ctx.fillRect(padding, padding * 0.5, w - padding * 2, 4)
    } else {
      ctx.fillStyle = this.config.backgroundColor
      ctx.fillRect(0, 0, w, h)
    }

    // Content area Y position
    let y = padding * 1.5

    // Thumbnail (if provided)
    if (this.content.thumbnailUrl && this._thumbnail) {
      const thumbW = w - padding * 2
      const thumbH = h * 0.35
      const thumbY = y

      // Thumbnail container with rounded corners
      ctx.save()
      ctx.beginPath()
      this._roundRect(ctx, padding, thumbY, thumbW, thumbH, w * 0.02)
      ctx.clip()

      // Draw thumbnail
      const imgAspect = this._thumbnail.width / this._thumbnail.height
      const containerAspect = thumbW / thumbH
      let drawW, drawH, drawX, drawY

      if (imgAspect > containerAspect) {
        drawH = thumbH
        drawW = thumbH * imgAspect
        drawX = padding - (drawW - thumbW) / 2
        drawY = thumbY
      } else {
        drawW = thumbW
        drawH = thumbW / imgAspect
        drawX = padding
        drawY = thumbY - (drawH - thumbH) / 2
      }

      ctx.drawImage(this._thumbnail, drawX, drawY, drawW, drawH)
      ctx.restore()

      // Thumbnail border
      ctx.strokeStyle = accentHex
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.3
      this._roundRect(ctx, padding, thumbY, thumbW, thumbH, w * 0.02)
      ctx.stroke()
      ctx.globalAlpha = 1

      y = thumbY + thumbH + padding * 0.8
    }

    // Type badge
    if (this.content.type) {
      const badge = this._getTypeBadge(this.content.type)
      ctx.font = `bold ${w * 0.035}px "SF Pro Display", -apple-system, sans-serif`
      const badgeWidth = ctx.measureText(badge).width + w * 0.04

      ctx.fillStyle = accentHex
      ctx.globalAlpha = 0.2
      this._roundRect(ctx, padding, y, badgeWidth, w * 0.055, w * 0.015)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.fillStyle = accentHex
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(badge, padding + w * 0.02, y + w * 0.0275)

      y += w * 0.08
    }

    // Title
    if (this.content.title) {
      ctx.font = `bold ${w * 0.07}px "SF Pro Display", -apple-system, sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(this.content.title, padding, y, w - padding * 2)
      y += w * 0.09
    }

    // Subtitle
    if (this.content.subtitle) {
      ctx.font = `${w * 0.04}px "SF Pro Display", -apple-system, sans-serif`
      ctx.fillStyle = accentHex
      ctx.fillText(this.content.subtitle, padding, y, w - padding * 2)
      y += w * 0.06
    }

    // Description
    if (this.content.description) {
      ctx.font = `${w * 0.035}px "SF Pro Display", -apple-system, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      this._wrapText(ctx, this.content.description, padding, y, w - padding * 2, w * 0.045)
      y += w * 0.15
    }

    // Tags
    if (this.content.tags && this.content.tags.length > 0) {
      const tagsY = h - padding * 1.5
      let tagX = padding

      ctx.font = `${w * 0.03}px "SF Pro Display", -apple-system, sans-serif`

      for (const tag of this.content.tags.slice(0, 4)) {
        const tagWidth = ctx.measureText(tag).width + w * 0.03
        if (tagX + tagWidth > w - padding) break

        // Tag background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        this._roundRect(ctx, tagX, tagsY, tagWidth, w * 0.04, w * 0.01)
        ctx.fill()

        // Tag text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(tag, tagX + w * 0.015, tagsY + w * 0.02)

        tagX += tagWidth + w * 0.015
      }
    }

    // Interaction hint
    const hintY = h - padding * 0.5
    ctx.font = `${w * 0.028}px "SF Pro Display", -apple-system, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Press E to interact', w / 2, hintY)

    // Update texture
    this.texture.needsUpdate = true
  }

  _getTypeBadge(type) {
    const badges = {
      unity_webgl: '🎮 PLAYABLE',
      webapp: '🌐 WEB APP',
      video: '🎬 VIDEO',
      gallery: '🖼️ GALLERY',
      info: 'ℹ️ INFO',
      contact: '📧 CONTACT',
    }
    return badges[type] || type.toUpperCase()
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ')
    let line = ''
    let lines = 0
    const maxLines = 4

    for (let i = 0; i < words.length && lines < maxLines; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), x, y)
        line = words[i] + ' '
        y += lineHeight
        lines++
      } else {
        line = testLine
      }
    }

    if (lines < maxLines && line.trim()) {
      ctx.fillText(line.trim() + (lines >= maxLines - 1 ? '...' : ''), x, y)
    }
  }

  /**
   * Load thumbnail image asynchronously
   */
  loadThumbnail(url) {
    if (!url) return Promise.resolve()

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        this._thumbnail = img
        this._renderContent()
        resolve()
      }
      img.onerror = () => {
        console.warn(`Failed to load thumbnail: ${url}`)
        resolve()
      }
      img.src = url
    })
  }

  /**
   * Update panel every frame
   * @param {THREE.Camera} camera - Current camera
   * @param {number} deltaTime - Time since last frame
   */
  update(camera, deltaTime) {
    if (!this.state.visible) return

    // Distance-based opacity
    this._tempVec.copy(this.config.position)
    const distance = camera.position.distanceTo(this._tempVec)

    if (distance > this.config.maxDistance) {
      this.group.visible = false
      return
    }

    this.group.visible = true

    // Fade based on distance
    let targetOpacity = 1
    if (distance > this.config.fadeDistance) {
      targetOpacity = 1 - (distance - this.config.fadeDistance) / (this.config.maxDistance - this.config.fadeDistance)
    }

    // Smooth opacity transition
    this.state.opacity += (targetOpacity - this.state.opacity) * 0.1
    this.mesh.material.opacity = this.state.opacity

    if (this.glowMesh) {
      this.glowMesh.material.opacity = this.state.opacity * 0.15
    }

    // Billboard mode
    if (this.config.billboard) {
      this.group.lookAt(camera.position)
    }

    // Hover effect
    const targetScale = this.state.hovered ? 1.05 : 1
    this.state.scale += (targetScale - this.state.scale) * 0.15
    this.group.scale.setScalar(this.state.scale)

    // Glow intensity on hover
    if (this.glowMesh && this.state.hovered) {
      this.glowMesh.material.opacity = this.state.opacity * 0.35
    }
  }

  /**
   * Set hover state
   */
  setHovered(hovered) {
    if (this.state.hovered === hovered) return
    this.state.hovered = hovered
    if (this.onHover) this.onHover(hovered, this)
  }

  /**
   * Trigger interaction
   */
  interact() {
    if (this.onInteract) {
      this.onInteract(this.content, this)
    }
  }

  /**
   * Set visibility
   */
  setVisible(visible) {
    this.state.visible = visible
    this.group.visible = visible
  }

  /**
   * Update content and re-render
   */
  setContent(content) {
    Object.assign(this.content, content)
    this._renderContent()
  }

  /**
   * Get world position
   */
  getWorldPosition() {
    return this.group.getWorldPosition(this._tempVec.clone())
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.scene.remove(this.group)

    if (this.texture) this.texture.dispose()
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }
    if (this.glowMesh) {
      this.glowMesh.geometry.dispose()
      this.glowMesh.material.dispose()
    }
    if (this.interactionMesh) {
      this.interactionMesh.geometry.dispose()
      this.interactionMesh.material.dispose()
    }

    this._thumbnail = null
    this.canvas = null
    this.ctx = null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WORLD SPACE UI MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export class WorldSpaceUIManager {
  constructor() {
    this.experience = new Experience()
    this.panels = new Map()

    // Pre-allocated for updates
    this._tempVec = new THREE.Vector3()
  }

  /**
   * Create a new world-space panel
   * @param {string} id - Unique panel identifier
   * @param {Object} options - Panel configuration
   * @returns {WorldSpacePanel}
   */
  createPanel(id, options) {
    if (this.panels.has(id)) {
      console.warn(`Panel ${id} already exists, disposing old one`)
      this.removePanel(id)
    }

    const panel = new WorldSpacePanel(options)
    this.panels.set(id, panel)

    // Load thumbnail if provided
    if (options.thumbnailUrl) {
      panel.loadThumbnail(options.thumbnailUrl)
    }

    return panel
  }

  /**
   * Get panel by ID
   */
  getPanel(id) {
    return this.panels.get(id)
  }

  /**
   * Remove and dispose panel
   */
  removePanel(id) {
    const panel = this.panels.get(id)
    if (panel) {
      panel.dispose()
      this.panels.delete(id)
    }
  }

  /**
   * Get all panels
   */
  getAllPanels() {
    return Array.from(this.panels.values())
  }

  /**
   * Get panels near a position
   */
  getPanelsNear(position, radius) {
    const nearby = []
    for (const panel of this.panels.values()) {
      this._tempVec.copy(panel.config.position)
      if (position.distanceTo(this._tempVec) <= radius) {
        nearby.push(panel)
      }
    }
    return nearby
  }

  /**
   * Update all panels
   */
  update(camera, deltaTime) {
    for (const panel of this.panels.values()) {
      panel.update(camera, deltaTime)
    }
  }

  /**
   * Dispose all panels
   */
  dispose() {
    for (const panel of this.panels.values()) {
      panel.dispose()
    }
    this.panels.clear()
  }
}
