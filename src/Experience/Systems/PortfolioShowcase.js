import * as THREE from 'three'
import { Experience } from '../Experience.js'
import { WorldSpacePanel, WorldSpaceUIManager } from '../UI/WorldSpaceUI.js'
import { InteractionSystem, InteractionPrompt } from '../Systems/InteractionSystem.js'
import { PORTFOLIO_ZONES, getProjectById, getZoneProjects } from '../Data/portfolioData.js'

/**
 * PortfolioShowcase — Main Portfolio Display System
 * ═══════════════════════════════════════════════════════════════════════════
 * Orchestrates world-space UI panels, interactions, and project displays.
 *
 * Responsibilities:
 * - Create panels for each project at zone locations
 * - Manage interaction system updates
 * - Handle project detail views (modal, WebGL embed)
 * - Track visited projects and zone discovery
 *
 * Integration:
 * - Called from World.js after environment is set up
 * - Updates in main animation loop
 */

export class PortfolioShowcase {
  constructor(zones) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.zones = zones // Zone definitions from environment

    // Systems
    this.uiManager = new WorldSpaceUIManager()
    this.interactionSystem = new InteractionSystem()
    this.interactionPrompt = new InteractionPrompt()

    // State
    this.initialized = false
    this.visitedProjects = new Set()
    this.activeDetailView = null

    // Pre-allocated vectors
    this._playerPos = new THREE.Vector3()
    this._playerDir = new THREE.Vector3()
    this._tempVec = new THREE.Vector3()

    // Bind methods
    this._onInteract = this._onInteract.bind(this)
    this._onTargetChange = this._onTargetChange.bind(this)

    this._init()
  }

  _init() {
    console.log('📋 Initializing Portfolio Showcase...')

    // Set up interaction callbacks
    this.interactionSystem.onInteract = this._onInteract
    this.interactionSystem.onTargetChange = this._onTargetChange

    // Create panels for all zones
    this._createAllPanels()

    // Collect all interactable meshes
    this._updateInteractables()

    // Listen for zone changes
    window.addEventListener('zoneChange', (e) => this._onZoneChange(e))

    // Listen for detail view close
    window.addEventListener('closeDetailView', () => this.closeDetailView())

    this.initialized = true
    console.log(`✅ Portfolio Showcase: ${this.uiManager.panels.size} panels created`)
  }

  _createAllPanels() {
    for (const [zoneId, zoneData] of Object.entries(PORTFOLIO_ZONES)) {
      const envZone = this.zones[zoneId]
      if (!envZone) continue

      const zoneCenter = envZone.center
      const zoneElevation = envZone.elevation || 0

      for (const project of zoneData.projects) {
        // Calculate world position
        const worldPos = new THREE.Vector3(
          zoneCenter.x + (project.position?.x || 0),
          zoneElevation + (project.position?.y || 2),
          zoneCenter.z + (project.position?.z || 0)
        )

        // Create panel
        const panelId = project.id
        const panelOptions = {
          position: worldPos,
          rotation: project.rotation || 0,
          width: project.featured ? 5 : 4,
          height: project.featured ? 3.75 : 3,
          accentColor: zoneData.accentColor,
          title: project.title,
          subtitle: project.subtitle,
          description: project.description,
          thumbnailUrl: project.thumbnailUrl,
          tags: project.tags || [],
          type: project.type,
          projectId: project.id,
          billboard: false,
          onInteract: (content) => this._showProjectDetail(project, zoneId),
        }

        this.uiManager.createPanel(panelId, panelOptions)
      }
    }
  }

  _updateInteractables() {
    // Collect all panel interaction meshes
    const interactables = []

    for (const panel of this.uiManager.getAllPanels()) {
      if (panel.interactionMesh) {
        interactables.push(panel.interactionMesh)
      }
    }

    // Also add any environment landmarks/portals
    const world = this.experience.world
    if (world?.activeEnvironment) {
      const env = world.activeEnvironment

      // Add portals
      if (env.portals) {
        for (const portal of env.portals) {
          if (portal.userData?.isPortal) {
            interactables.push(portal)
          }
        }
      }

      // Add landmarks
      if (env.landmarks) {
        for (const landmark of env.landmarks) {
          if (landmark.userData?.isInteractable) {
            interactables.push(landmark)
          }
        }
      }
    }

    this.interactionSystem.setInteractables(interactables)
  }

  _onInteract(data) {
    console.log('🎯 Interaction:', data)

    // Handle portal teleportation
    if (data.isPortal && data.destination) {
      this._handlePortalTeleport(data)
      return
    }

    // Handle zone landmark
    if (data.zoneId && !data.projectId) {
      this._showZoneInfo(data.zoneId, data.zoneName)
      return
    }

    // Handle project panel
    if (data.projectId && data.panelRef) {
      const project = getProjectById(data.projectId)
      if (project) {
        this._showProjectDetail(project, project.zoneId)
      }
    }
  }

  _onTargetChange(target) {
    if (target) {
      const userData = target.userData
      let promptText = 'Interact'

      if (userData.isPortal) {
        promptText = `Teleport to ${userData.toZone}`
      } else if (userData.projectId) {
        promptText = 'View Project'
      } else if (userData.zoneId) {
        promptText = `About ${userData.zoneName}`
      }

      this.interactionPrompt.show(promptText)
    } else {
      this.interactionPrompt.hide()
    }
  }

  _handlePortalTeleport(data) {
    const world = this.experience.world
    if (!world?.player || !data.destination) return

    // Add visual feedback
    this.experience.uiManager?.notify(`Teleporting to ${data.toZone}...`, 'info', 1500)

    // Teleport player
    setTimeout(() => {
      world.player.teleport({
        x: data.destination.x,
        y: data.destination.y + 1,
        z: data.destination.z
      })
    }, 300)
  }

  _onZoneChange(event) {
    const { zoneId, zoneName, firstVisit } = event.detail

    if (firstVisit && zoneId) {
      // Show zone discovery notification
      this.experience.uiManager?.notify(`Discovered: ${zoneName}`, 'success', 3000)
    }
  }

  _showZoneInfo(zoneId, zoneName) {
    const zoneProjects = getZoneProjects(zoneId)
    if (!zoneProjects) return

    // For now, dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('showZoneInfo', {
      detail: {
        zoneId,
        zoneName,
        description: zoneProjects.description,
        projectCount: zoneProjects.projects.length,
        accentColor: zoneProjects.accentColor,
      }
    }))
  }

  _showProjectDetail(project, zoneId) {
    // Mark as visited
    this.visitedProjects.add(project.id)

    // Create detail view based on project type
    switch (project.type) {
      case 'unity_webgl':
        this._openWebGLEmbed(project)
        break
      case 'video':
        this._openVideoPlayer(project)
        break
      case 'gallery':
        this._openGallery(project)
        break
      case 'contact':
        this._openContactForm(project)
        break
      default:
        this._openProjectModal(project)
    }
  }

  _openProjectModal(project) {
    // Dispatch event for modal handling
    window.dispatchEvent(new CustomEvent('showProjectDetail', {
      detail: {
        project,
        type: 'modal',
      }
    }))
  }

  _openWebGLEmbed(project) {
    if (!project.webglUrl) {
      this._openProjectModal(project)
      return
    }

    // Create fullscreen WebGL embed
    this.activeDetailView = this._createDetailOverlay(`
      <div class="detail-header">
        <h2>${project.title}</h2>
        <p>${project.subtitle || ''}</p>
        <button class="detail-close" onclick="window.dispatchEvent(new CustomEvent('closeDetailView'))">✕ Close</button>
      </div>
      <div class="webgl-container">
        <iframe
          src="${project.webglUrl}"
          frameborder="0"
          allowfullscreen
          allow="autoplay; fullscreen; gamepad"
        ></iframe>
      </div>
      <div class="detail-footer">
        <p>${project.description || ''}</p>
        ${this._renderLinks(project.links)}
      </div>
    `, 'webgl')
  }

  _openVideoPlayer(project) {
    const videoUrl = project.videoUrl || ''

    this.activeDetailView = this._createDetailOverlay(`
      <div class="detail-header">
        <h2>${project.title}</h2>
        <p>${project.subtitle || ''}</p>
        <button class="detail-close" onclick="window.dispatchEvent(new CustomEvent('closeDetailView'))">✕ Close</button>
      </div>
      <div class="video-container">
        <iframe
          src="${videoUrl}"
          frameborder="0"
          allowfullscreen
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
      <div class="detail-footer">
        <p>${project.description || ''}</p>
        ${this._renderLinks(project.links)}
      </div>
    `, 'video')
  }

  _openGallery(project) {
    const screenshots = project.screenshots || []
    const screenshotHTML = screenshots.map((url, i) => `
      <img src="${url}" alt="Screenshot ${i + 1}" class="gallery-image" />
    `).join('')

    this.activeDetailView = this._createDetailOverlay(`
      <div class="detail-header">
        <h2>${project.title}</h2>
        <p>${project.subtitle || ''}</p>
        <button class="detail-close" onclick="window.dispatchEvent(new CustomEvent('closeDetailView'))">✕ Close</button>
      </div>
      <div class="gallery-container">
        ${screenshotHTML || '<p>No images available</p>'}
      </div>
      <div class="detail-footer">
        <p>${project.description || ''}</p>
        ${this._renderLinks(project.links)}
      </div>
    `, 'gallery')
  }

  _openContactForm(project) {
    const contact = project.contact || {}

    this.activeDetailView = this._createDetailOverlay(`
      <div class="detail-header">
        <h2>${project.title}</h2>
        <p>${project.subtitle || ''}</p>
        <button class="detail-close" onclick="window.dispatchEvent(new CustomEvent('closeDetailView'))">✕ Close</button>
      </div>
      <div class="contact-container">
        <p class="contact-description">${project.description || ''}</p>
        <div class="contact-info">
          ${contact.email ? `<a href="mailto:${contact.email}" class="contact-link">📧 ${contact.email}</a>` : ''}
          ${contact.phone ? `<a href="tel:${contact.phone}" class="contact-link">📱 ${contact.phone}</a>` : ''}
          ${contact.address ? `<p class="contact-address">📍 ${contact.address}</p>` : ''}
        </div>
        ${this._renderLinks(project.links)}
      </div>
    `, 'contact')
  }

  _renderLinks(links) {
    if (!links || Object.keys(links).length === 0) return ''

    const linkHTML = Object.entries(links).map(([key, url]) => {
      const icon = this._getLinkIcon(key)
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      return `<a href="${url}" target="_blank" rel="noopener" class="project-link">${icon} ${label}</a>`
    }).join('')

    return `<div class="project-links">${linkHTML}</div>`
  }

  _getLinkIcon(key) {
    const icons = {
      live: '🌐',
      github: '💻',
      steam: '🎮',
      itch: '🎲',
      playstore: '📱',
      appstore: '🍎',
      vimeo: '🎬',
      documentation: '📚',
      demo: '▶️',
      calendly: '📅',
      email: '📧',
      linkedin: '💼',
    }
    return icons[key] || '🔗'
  }

  _createDetailOverlay(content, type) {
    // Remove existing
    this.closeDetailView()

    const overlay = document.createElement('div')
    overlay.id = 'project-detail-overlay'
    overlay.className = `detail-type-${type}`
    overlay.innerHTML = `
      <div class="detail-backdrop" onclick="window.dispatchEvent(new CustomEvent('closeDetailView'))"></div>
      <div class="detail-content">
        ${content}
      </div>
    `

    // Add styles if not already present
    if (!document.getElementById('detail-overlay-styles')) {
      const style = document.createElement('style')
      style.id = 'detail-overlay-styles'
      style.textContent = `
        #project-detail-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .detail-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
        }
        .detail-content {
          position: relative;
          width: 90%;
          max-width: 1200px;
          max-height: 90vh;
          background: rgba(15, 20, 35, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .detail-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .detail-header h2 {
          flex: 1;
          margin: 0;
          font-size: 24px;
          color: #fff;
        }
        .detail-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
        }
        .detail-close {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }
        .detail-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .webgl-container,
        .video-container {
          flex: 1;
          min-height: 400px;
          background: #000;
        }
        .webgl-container iframe,
        .video-container iframe {
          width: 100%;
          height: 100%;
          min-height: 400px;
        }
        .gallery-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        .gallery-image {
          width: 100%;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .gallery-image:hover {
          transform: scale(1.02);
        }
        .contact-container {
          padding: 48px;
          text-align: center;
        }
        .contact-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 32px;
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .contact-link {
          font-size: 18px;
          color: #4A90D9;
          text-decoration: none;
        }
        .contact-link:hover {
          text-decoration: underline;
        }
        .contact-address {
          color: rgba(255, 255, 255, 0.6);
        }
        .detail-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .detail-footer p {
          margin: 0 0 16px;
          color: rgba(255, 255, 255, 0.7);
        }
        .project-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .project-link {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          text-decoration: none;
          transition: background 0.2s;
        }
        .project-link:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .detail-type-webgl .detail-content {
          max-width: 95%;
          height: 90vh;
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(overlay)

    // Escape key to close
    this._escHandler = (e) => {
      if (e.key === 'Escape') this.closeDetailView()
    }
    window.addEventListener('keydown', this._escHandler)

    return overlay
  }

  closeDetailView() {
    if (this.activeDetailView) {
      this.activeDetailView.remove()
      this.activeDetailView = null
    }
    if (this._escHandler) {
      window.removeEventListener('keydown', this._escHandler)
      this._escHandler = null
    }
  }

  /**
   * Update showcase every frame
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (!this.initialized) return

    const player = this.experience.world?.player
    const camera = this.experience.camera?.instance

    if (!player || !camera) return

    // Get player position and forward direction
    this._playerPos.copy(player.mesh.position)
    camera.getWorldDirection(this._playerDir)
    this._playerDir.y = 0
    this._playerDir.normalize()

    // Update interaction system
    this.interactionSystem.update(this._playerPos, this._playerDir)

    // Update UI panels (distance culling, billboard)
    this.uiManager.update(camera, deltaTime)
  }

  /**
   * Get visited project count
   */
  getProgress() {
    let total = 0
    for (const zone of Object.values(PORTFOLIO_ZONES)) {
      total += zone.projects.length
    }
    return {
      visited: this.visitedProjects.size,
      total,
      percentage: total > 0 ? Math.round((this.visitedProjects.size / total) * 100) : 0,
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    this.closeDetailView()
    this.uiManager.dispose()
    this.interactionSystem.dispose()
    this.interactionPrompt.dispose()

    window.removeEventListener('zoneChange', this._onZoneChange)
    window.removeEventListener('closeDetailView', this.closeDetailView)

    this.initialized = false
    console.log('🧹 Portfolio Showcase disposed')
  }
}
