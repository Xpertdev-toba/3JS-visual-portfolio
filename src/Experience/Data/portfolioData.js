/**
 * Portfolio Data Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 * Centralized project data for TobaTech Jungle portfolio showcase.
 * Each zone can have multiple portfolio items displayed as world-space panels.
 *
 * STRUCTURE:
 * - zoneId: Matches zones defined in TestEnvironment (Z1, Z2, Z3, etc.)
 * - projects: Array of project objects for that zone
 * - Each project has: id, title, description, type, media, links, tags
 */

export const PORTFOLIO_ZONES = {
  // ═══════════════════════════════════════════════════════════════════════════
  // Z1: CodeForge Ruins — IT Services
  // ═══════════════════════════════════════════════════════════════════════════
  Z1: {
    zoneName: 'IT Services',
    description: 'Enterprise software, web applications, APIs, and backend systems',
    accentColor: 0x4A90D9,
    projects: [
      {
        id: 'z1_proj1',
        title: 'Enterprise Dashboard',
        subtitle: 'Real-time Analytics Platform',
        description: 'Full-stack dashboard with real-time data visualization, user management, and reporting. Built with React, Node.js, and PostgreSQL.',
        type: 'webapp',
        thumbnailUrl: 'textures/portfolio/z1_dashboard.jpg',
        screenshots: [
          'textures/portfolio/z1_dashboard_1.jpg',
          'textures/portfolio/z1_dashboard_2.jpg',
        ],
        links: {
          live: 'https://example.com/dashboard',
          github: 'https://github.com/example/dashboard',
        },
        tags: ['React', 'Node.js', 'PostgreSQL', 'WebSocket'],
        featured: true,
        position: { x: -3, y: 2, z: -1 }, // Relative to zone center
        rotation: 0.3, // Y rotation in radians
      },
      {
        id: 'z1_proj2',
        title: 'REST API Gateway',
        subtitle: 'Microservices Architecture',
        description: 'Highly scalable API gateway handling 10M+ requests/day. Features rate limiting, authentication, and load balancing.',
        type: 'webapp',
        thumbnailUrl: 'textures/portfolio/z1_api.jpg',
        screenshots: [],
        links: {
          documentation: 'https://example.com/api-docs',
        },
        tags: ['Node.js', 'Redis', 'Docker', 'Kubernetes'],
        featured: false,
        position: { x: 3, y: 2, z: -1 },
        rotation: -0.3,
      },
      {
        id: 'z1_proj3',
        title: 'E-Commerce Platform',
        subtitle: 'Full-Stack Solution',
        description: 'Complete e-commerce solution with payment processing, inventory management, and customer analytics.',
        type: 'webapp',
        thumbnailUrl: 'textures/portfolio/z1_ecommerce.jpg',
        screenshots: [],
        links: {
          live: 'https://example.com/store',
        },
        tags: ['Next.js', 'Stripe', 'MongoDB'],
        featured: false,
        position: { x: 0, y: 2, z: 4 },
        rotation: Math.PI,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z2: Pixel Grove — Game Development
  // ═══════════════════════════════════════════════════════════════════════════
  Z2: {
    zoneName: 'Game Development',
    description: 'Unity, Unreal Engine, mobile games, and interactive experiences',
    accentColor: 0x9B59B6,
    projects: [
      {
        id: 'z2_proj1',
        title: 'Adventure Quest',
        subtitle: 'Unity 3D RPG',
        description: 'Open-world RPG with procedural generation, quest system, and multiplayer support. Play directly in your browser!',
        type: 'unity_webgl',
        thumbnailUrl: 'textures/portfolio/z2_adventure.jpg',
        screenshots: [
          'textures/portfolio/z2_adventure_1.jpg',
          'textures/portfolio/z2_adventure_2.jpg',
        ],
        webglUrl: 'https://example.com/games/adventure-quest', // Unity WebGL build URL
        links: {
          steam: 'https://store.steampowered.com/app/xxxxx',
          itch: 'https://example.itch.io/adventure-quest',
        },
        tags: ['Unity', 'C#', 'Multiplayer', 'RPG'],
        featured: true,
        position: { x: -4, y: 2.5, z: 2 },
        rotation: 0.4,
      },
      {
        id: 'z2_proj2',
        title: 'Puzzle Dimensions',
        subtitle: 'Mobile Puzzle Game',
        description: 'Mind-bending puzzle game with 200+ levels. Features AR mode and daily challenges.',
        type: 'unity_webgl',
        thumbnailUrl: 'textures/portfolio/z2_puzzle.jpg',
        screenshots: [],
        webglUrl: 'https://example.com/games/puzzle-dimensions',
        links: {
          playstore: 'https://play.google.com/store/apps/details?id=com.example.puzzle',
          appstore: 'https://apps.apple.com/app/puzzle-dimensions/id123456',
        },
        tags: ['Unity', 'Mobile', 'AR', 'Puzzle'],
        featured: true,
        position: { x: 4, y: 2.5, z: -2 },
        rotation: -0.4,
      },
      {
        id: 'z2_proj3',
        title: 'Racing Unleashed',
        subtitle: 'Unreal Engine Racing',
        description: 'High-speed racing game with realistic physics, 30+ tracks, and online multiplayer.',
        type: 'video',
        thumbnailUrl: 'textures/portfolio/z2_racing.jpg',
        videoUrl: 'https://youtube.com/embed/xxxxx',
        links: {
          steam: 'https://store.steampowered.com/app/xxxxx',
        },
        tags: ['Unreal Engine', 'C++', 'Racing', 'Multiplayer'],
        featured: false,
        position: { x: 0, y: 2.5, z: -5 },
        rotation: 0,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z3: Neural Cavern — AI & Automation
  // ═══════════════════════════════════════════════════════════════════════════
  Z3: {
    zoneName: 'AI & Automation',
    description: 'Machine learning, chatbots, RPA, and intelligent systems',
    accentColor: 0xE91E63,
    projects: [
      {
        id: 'z3_proj1',
        title: 'Smart Assistant',
        subtitle: 'AI Chatbot Platform',
        description: 'Multi-lingual AI assistant with natural language understanding, sentiment analysis, and custom training capabilities.',
        type: 'webapp',
        thumbnailUrl: 'textures/portfolio/z3_chatbot.jpg',
        screenshots: [],
        links: {
          demo: 'https://example.com/chatbot-demo',
        },
        tags: ['Python', 'TensorFlow', 'NLP', 'GPT'],
        featured: true,
        position: { x: -4, y: 1.5, z: 0 },
        rotation: 0.5,
      },
      {
        id: 'z3_proj2',
        title: 'Vision Analytics',
        subtitle: 'Computer Vision Platform',
        description: 'Real-time object detection, facial recognition, and video analytics for security and retail.',
        type: 'webapp',
        thumbnailUrl: 'textures/portfolio/z3_vision.jpg',
        screenshots: [],
        links: {
          documentation: 'https://example.com/vision-docs',
        },
        tags: ['Python', 'PyTorch', 'OpenCV', 'YOLO'],
        featured: false,
        position: { x: 4, y: 1.5, z: 0 },
        rotation: -0.5,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z4: Lumina Falls — Media Production
  // ═══════════════════════════════════════════════════════════════════════════
  Z4: {
    zoneName: 'Media Production',
    description: 'Video production, motion graphics, VFX, and 3D animation',
    accentColor: 0xFF9800,
    projects: [
      {
        id: 'z4_proj1',
        title: 'Brand Film',
        subtitle: 'Corporate Video',
        description: 'Award-winning brand documentary featuring drone cinematography and custom motion graphics.',
        type: 'video',
        thumbnailUrl: 'textures/portfolio/z4_brand.jpg',
        videoUrl: 'https://youtube.com/embed/xxxxx',
        links: {
          vimeo: 'https://vimeo.com/xxxxx',
        },
        tags: ['Premiere Pro', 'After Effects', 'DaVinci'],
        featured: true,
        position: { x: -3, y: 3, z: 2 },
        rotation: 0.3,
      },
      {
        id: 'z4_proj2',
        title: '3D Product Showcase',
        subtitle: 'Product Visualization',
        description: 'Photorealistic 3D renders and animations for product marketing.',
        type: 'gallery',
        thumbnailUrl: 'textures/portfolio/z4_3d.jpg',
        screenshots: [
          'textures/portfolio/z4_3d_1.jpg',
          'textures/portfolio/z4_3d_2.jpg',
          'textures/portfolio/z4_3d_3.jpg',
        ],
        links: {},
        tags: ['Blender', 'Cinema 4D', '3D'],
        featured: false,
        position: { x: 3, y: 3, z: -2 },
        rotation: -0.3,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z5: Beacon Spire — Digital Marketing
  // ═══════════════════════════════════════════════════════════════════════════
  Z5: {
    zoneName: 'Digital Marketing',
    description: 'SEO, social media, paid advertising, and content marketing',
    accentColor: 0x4CAF50,
    projects: [
      {
        id: 'z5_proj1',
        title: 'SEO Dashboard',
        subtitle: 'Analytics & Optimization',
        description: 'Comprehensive SEO toolkit with keyword tracking, competitor analysis, and automated reporting.',
        type: 'webapp',
        thumbnailUrl: 'textures/portfolio/z5_seo.jpg',
        screenshots: [],
        links: {
          demo: 'https://example.com/seo-demo',
        },
        tags: ['SEO', 'Analytics', 'Marketing'],
        featured: true,
        position: { x: 0, y: 2.5, z: 3 },
        rotation: Math.PI,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z6: Origin Tree — About/Team
  // ═══════════════════════════════════════════════════════════════════════════
  Z6: {
    zoneName: 'About Us',
    description: 'Our story, values, and the team behind TobaTech',
    accentColor: 0xFFB74D,
    projects: [
      {
        id: 'z6_about',
        title: 'Our Story',
        subtitle: 'About TobaTech',
        description: 'Founded in 2020, TobaTech is a creative technology studio specializing in immersive digital experiences.',
        type: 'info',
        thumbnailUrl: 'textures/portfolio/z6_about.jpg',
        content: {
          founded: '2020',
          team: '15+ professionals',
          clients: '100+ worldwide',
          mission: 'Creating technology that inspires',
        },
        links: {
          linkedin: 'https://linkedin.com/company/tobatech',
        },
        tags: ['About', 'Team', 'Mission'],
        featured: true,
        position: { x: 0, y: 3.5, z: 0 },
        rotation: 0,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z7: Echo Chamber — Contact
  // ═══════════════════════════════════════════════════════════════════════════
  Z7: {
    zoneName: 'Contact',
    description: 'Get in touch with us',
    accentColor: 0x26C6DA,
    projects: [
      {
        id: 'z7_contact',
        title: 'Get In Touch',
        subtitle: 'Contact Us',
        description: 'Ready to start your next project? We\'d love to hear from you.',
        type: 'contact',
        thumbnailUrl: 'textures/portfolio/z7_contact.jpg',
        contact: {
          email: 'hello@tobatech.com',
          phone: '+1 (555) 123-4567',
          address: '123 Tech Street, Innovation City',
        },
        links: {
          calendly: 'https://calendly.com/tobatech',
          email: 'mailto:hello@tobatech.com',
        },
        tags: ['Contact', 'Booking'],
        featured: true,
        position: { x: 0, y: 3, z: 0 },
        rotation: 0,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HUB: The Nexus Clearing — Welcome/Featured
  // ═══════════════════════════════════════════════════════════════════════════
  HUB: {
    zoneName: 'Welcome',
    description: 'Featured projects and portfolio highlights',
    accentColor: 0xFFD700,
    projects: [
      {
        id: 'hub_welcome',
        title: 'Welcome to TobaTech',
        subtitle: 'Interactive Portfolio',
        description: 'Explore our work across different zones. Each area showcases our expertise in different domains.',
        type: 'info',
        thumbnailUrl: 'textures/portfolio/hub_welcome.jpg',
        content: {
          zones: [
            { name: 'CodeForge Ruins', direction: 'North', service: 'IT Services' },
            { name: 'Pixel Grove', direction: 'West', service: 'Game Development' },
            { name: 'Neural Cavern', direction: 'East', service: 'AI & Automation' },
            { name: 'Lumina Falls', direction: 'Southwest', service: 'Media Production' },
            { name: 'Beacon Spire', direction: 'Southeast', service: 'Digital Marketing' },
          ],
        },
        links: {},
        tags: ['Welcome', 'Guide'],
        featured: true,
        position: { x: 0, y: 4, z: 3 },
        rotation: Math.PI,
      },
    ],
  },
}

/**
 * Get all featured projects across all zones
 * @returns {Array} Array of featured project objects with zone info
 */
export function getFeaturedProjects() {
  const featured = []
  for (const [zoneId, zone] of Object.entries(PORTFOLIO_ZONES)) {
    for (const project of zone.projects) {
      if (project.featured) {
        featured.push({ ...project, zoneId, zoneName: zone.zoneName })
      }
    }
  }
  return featured
}

/**
 * Get projects for a specific zone
 * @param {string} zoneId - Zone identifier (Z1, Z2, etc.)
 * @returns {Object|null} Zone data with projects or null
 */
export function getZoneProjects(zoneId) {
  return PORTFOLIO_ZONES[zoneId] || null
}

/**
 * Get a specific project by ID
 * @param {string} projectId - Project identifier
 * @returns {Object|null} Project data with zone info or null
 */
export function getProjectById(projectId) {
  for (const [zoneId, zone] of Object.entries(PORTFOLIO_ZONES)) {
    const project = zone.projects.find(p => p.id === projectId)
    if (project) {
      return { ...project, zoneId, zoneName: zone.zoneName, accentColor: zone.accentColor }
    }
  }
  return null
}

/**
 * Get all projects of a specific type
 * @param {string} type - Project type (unity_webgl, webapp, video, etc.)
 * @returns {Array} Array of matching projects
 */
export function getProjectsByType(type) {
  const results = []
  for (const [zoneId, zone] of Object.entries(PORTFOLIO_ZONES)) {
    for (const project of zone.projects) {
      if (project.type === type) {
        results.push({ ...project, zoneId, zoneName: zone.zoneName })
      }
    }
  }
  return results
}
