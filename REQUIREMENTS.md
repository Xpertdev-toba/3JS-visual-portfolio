# TobaTech Jungle — Technical Requirements Document

> Complete technical blueprint for implementing the interactive 3D portfolio experience.

---

## A. Architecture Blueprint

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Input     │  │   Update    │  │   Render    │  │    Audio    │        │
│  │  Manager    │  │    Loop     │  │   Pipeline  │  │   Manager   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         ▼                ▼                ▼                ▼                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         EVENT BUS                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                │                │                │                │
│         ▼                ▼                ▼                ▼                │
│  ┌───────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐          │
│  │ Character │  │   Zone     │  │ Interaction │  │   Asset      │          │
│  │ Controller│  │  Manager   │  │   Manager   │  │   Loader     │          │
│  └───────────┘  └────────────┘  └─────────────┘  └──────────────┘          │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           SCENE MANAGER                              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │  World  │  │ Portals │  │  Robot  │  │Particles│  │   VFX   │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           UI OVERLAY                                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │   HUD   │  │ Panels  │  │ MiniMap │  │ Modals  │  │  Toast  │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core System Responsibilities

| System | Primary Responsibility | Secondary | Dependencies |
|--------|----------------------|-----------|--------------|
| SceneManager | Three.js scene lifecycle, render loop | LOD management | AssetLoader |
| World | Environment meshes, terrain, lighting | Fog, skybox | SceneManager |
| CharacterController | Robot movement, physics, animation | Ground detection | InputManager, Physics |
| CameraController | Follow cam, orbit, transitions | Shake, FOV | CharacterController |
| ZoneManager | Zone detection, loading triggers | Boundaries | World, AssetLoader |
| InteractionManager | Totem detection, highlight, action | Raycast | InputManager, UIOverlay |
| AssetLoader | GLTF loading, caching, disposal | Progress | — |
| UIOverlay | HTML/CSS panels, HUD, forms | Accessibility | EventBus |
| AudioManager | Spatial audio, ambience, SFX | Volume control | ZoneManager |
| InputManager | Keyboard, mouse, touch, gamepad | Keybinding | — |
| EventBus | Pub/sub communication | — | — |
| QualityManager | Performance detection, tier switching | FPS monitoring | SceneManager |

### Update Loop Order

```typescript
// Main loop execution order (60 FPS target)
function update(deltaTime: number): void {
  // 1. Input polling
  InputManager.update();
  
  // 2. Physics step
  PhysicsWorld.step(deltaTime);
  
  // 3. Character update
  CharacterController.update(deltaTime);
  
  // 4. Camera follow
  CameraController.update(deltaTime);
  
  // 5. Zone detection
  ZoneManager.update(CharacterController.position);
  
  // 6. Interaction raycast
  InteractionManager.update(CameraController.camera);
  
  // 7. World systems
  World.update(deltaTime);
  
  // 8. VFX/Particles
  ParticleManager.update(deltaTime);
  
  // 9. Audio listener
  AudioManager.updateListener(CameraController.camera);
  
  // 10. Render
  SceneManager.render();
  
  // 11. UI updates (RAF callback)
  UIOverlay.update();
}
```

### Event Bus Pattern

```typescript
// Typed event definitions
interface EventMap {
  'zone:enter': { zoneId: string; firstVisit: boolean };
  'zone:exit': { zoneId: string };
  'zone:loaded': { zoneId: string; assets: AssetBundle };
  'interaction:start': { targetId: string; type: string };
  'interaction:complete': { targetId: string; data: unknown };
  'panel:open': { panelId: string };
  'panel:close': { panelId: string };
  'portal:enter': { portalId: string; destination: string };
  'portal:exit': { portalId: string };
  'tour:start': void;
  'tour:pause': void;
  'tour:skip': void;
  'tour:complete': void;
  'quality:change': { tier: QualityTier };
  'audio:toggle': { enabled: boolean };
}

// Usage
EventBus.emit('zone:enter', { zoneId: 'z1', firstVisit: true });
EventBus.on('zone:enter', (data) => console.log(data.zoneId));
```

### Recommended Folder Structure

```
src/
├── main.ts                    # Entry point
├── App.ts                     # Application bootstrap
├── config/
│   ├── quality.config.ts      # Quality tier settings
│   ├── zones.config.ts        # Zone definitions
│   ├── portals.config.ts      # Portal network
│   └── controls.config.ts     # Input mappings
├── core/
│   ├── EventBus.ts            # Pub/sub
│   ├── SceneManager.ts        # Three.js setup
│   ├── AssetLoader.ts         # GLTF/Draco/KTX2
│   ├── InputManager.ts        # Unified input
│   ├── AudioManager.ts        # Howler wrapper
│   └── QualityManager.ts      # Performance tiers
├── world/
│   ├── World.ts               # Environment root
│   ├── Terrain.ts             # Ground mesh
│   ├── Skybox.ts              # Sky shader
│   ├── Lighting.ts            # Lights setup
│   ├── Fog.ts                 # Layered fog
│   ├── zones/
│   │   ├── ZoneManager.ts     # Zone detection
│   │   ├── Zone.ts            # Base zone class
│   │   ├── HubZone.ts         # Hub specifics
│   │   └── ...                # Zone implementations
│   ├── portals/
│   │   ├── PortalManager.ts   # Portal system
│   │   └── Portal.ts          # Portal entity
│   └── props/
│       ├── PropManager.ts     # Static props
│       └── Interactable.ts    # Interactive props
├── character/
│   ├── Robot.ts               # Robot entity
│   ├── CharacterController.ts # Movement logic
│   ├── CharacterPhysics.ts    # Rapier body
│   └── RobotAnimator.ts       # Animation states
├── camera/
│   ├── CameraController.ts    # Main controller
│   ├── FollowCamera.ts        # Follow mode
│   ├── OrbitCamera.ts         # Inspect mode
│   └── TourCamera.ts          # Guided tour
├── interaction/
│   ├── InteractionManager.ts  # Raycast system
│   ├── Highlighter.ts         # Outline effect
│   └── ActionHandler.ts       # Action dispatch
├── vfx/
│   ├── ParticleManager.ts     # Particle systems
│   ├── Fireflies.ts           # Firefly effect
│   ├── PortalEffect.ts        # Portal swirl
│   └── PostProcessing.ts      # Effect composer
├── ui/
│   ├── UIOverlay.ts           # UI root
│   ├── components/
│   │   ├── HUD.ts             # Compass, zone name
│   │   ├── ProjectPanel.ts    # Project showcase
│   │   ├── MiniMap.ts         # Zone map
│   │   ├── Chips.ts           # Tech tags
│   │   ├── ContactForm.ts     # Contact panel
│   │   └── LoadingScreen.ts   # Splash
│   └── styles/
│       ├── liquid-glass.css   # Glass effect
│       ├── panels.css         # Panel layouts
│       └── animations.css     # Transitions
├── data/
│   ├── portfolio.json         # Project data
│   └── copy.json              # UI text
├── utils/
│   ├── math.ts                # Math helpers
│   ├── dispose.ts             # Memory cleanup
│   └── debug.ts               # Debug tools
└── types/
    ├── index.d.ts             # Global types
    ├── portfolio.d.ts         # Data types
    └── three-extensions.d.ts  # Three.js augments
```

---

## B. Asset List & Requirements

### Environment Assets

| Asset | File | Triangles | Texture | LODs | Notes |
|-------|------|-----------|---------|------|-------|
| Terrain Base | terrain.glb | 8,000 | 2K atlas | 3 | Baked AO |
| Hub Zone | zone_hub.glb | 5,000 | 1K atlas | 2 | Modular pieces |
| Z1 CodeForge | zone_z1.glb | 6,000 | 1K atlas | 2 | Ruin pieces |
| Z2 Pixel Grove | zone_z2.glb | 5,500 | 1K atlas | 2 | Colorful |
| Z3 Neural Cavern | zone_z3.glb | 4,500 | 1K atlas | 2 | Crystal heavy |
| Z4 Lumina Falls | zone_z4.glb | 7,000 | 1K atlas | 2 | Water plane |
| Z5 Beacon Spire | zone_z5.glb | 5,000 | 1K atlas | 2 | Tall structure |
| Z6 Origin Tree | zone_z6.glb | 8,000 | 1K atlas | 2 | Organic |
| Z7 Echo Chamber | zone_z7.glb | 3,500 | 1K atlas | 2 | Minimal |
| Tree Small (instanced) | tree_small.glb | 150 | 512 atlas | 2 | 500 instances |
| Tree Medium (instanced) | tree_medium.glb | 300 | 512 atlas | 2 | 200 instances |
| Rock Set | rocks.glb | 100-400 | 512 shared | 1 | 8 variants |
| Grass Patch (instanced) | grass.glb | 50 | 256 alpha | 0 | 5000 instances |
| Mushroom Set | mushrooms.glb | 80-200 | 512 atlas | 1 | 6 variants, glow |
| Vine Set | vines.glb | 200 | 512 alpha | 1 | Decorative |
| Portal Frame | portal_frame.glb | 200 | 512 | 0 | Shader effect |

### Robot Assets

| Asset | File | Triangles | Texture | Animations | Notes |
|-------|------|-----------|---------|------------|-------|
| Robot Body | robot.glb | 1,500 | 1K PBR | — | Main mesh |
| Robot Rig | (in robot.glb) | — | — | 8 | Bones: 25 |
| Idle Animation | (embedded) | — | — | ✓ | 60 frames, loop |
| Walk Animation | (embedded) | — | — | ✓ | 30 frames, loop |
| Run Animation | (embedded) | — | — | ✓ | 20 frames, loop |
| Jump Animation | (embedded) | — | — | ✓ | 40 frames |
| Land Animation | (embedded) | — | — | ✓ | 20 frames |
| Interact Animation | (embedded) | — | — | ✓ | 30 frames |
| Wave Animation | (embedded) | — | — | ✓ | 45 frames |
| Look Around | (embedded) | — | — | ✓ | 60 frames, loop |

### Landmark Assets

| Landmark | Zone | Triangles | Texture | Special |
|----------|------|-----------|---------|---------|
| Compass Crystal | HUB | 400 | 512 emission | Rotation shader |
| Compiler Obelisk | Z1 | 600 | 1K emission | Code projection |
| Polygon Tree | Z2 | 1,200 | 512 colors | Cube leaf particles |
| Brain Core | Z3 | 800 | 1K emission | Pulse shader |
| Director's Throne | Z4 | 500 | 512 | — |
| Signal Tower | Z5 | 700 | 512 emission | Beacon rotation |
| Elder Tree | Z6 | 2,000 | 1K | Interior hollow |
| Contact Crystal | Z7 | 300 | 512 emission | Ring sound shader |

### Totem/Interactable Assets

| Totem Type | Count | Triangles (each) | Texture | Notes |
|------------|-------|------------------|---------|-------|
| Hologram Terminal | 6 | 200 | 256 | Screen shader |
| Arcade Cabinet | 2 | 350 | 512 | Retro CRT effect |
| Stone Tablet | 4 | 150 | 256 | Carved text |
| Crystal Cluster | 8 | 100 | 256 | Glow variations |
| Photo Frame | 3 | 50 | 256 | Dynamic texture |
| Billboard Vine | 3 | 180 | 256 | Ad rotation |
| Signpost | 7 | 80 | 256 | Zone icons |
| Treasure Chest | 1 | 200 | 512 | Easter egg |

### VFX Sprites/Textures

| Asset | Type | Size | Format | Notes |
|-------|------|------|--------|-------|
| Firefly | Sprite | 32×32 | PNG | Additive |
| Spark | Sprite | 64×64 | PNG | Additive, 4 variants |
| Smoke Puff | Flipbook | 256×256 (4×4) | PNG | 16 frames |
| Portal Swirl | Sprite | 128×128 | PNG | Radial gradient |
| Magic Rune | Sprite | 64×64 | PNG | 8 variants |
| Code Symbol | Sprite | 32×32 | PNG | Matrix rain |
| Leaf | Sprite | 32×32 | PNG | 4 variants |
| Dust Mote | Sprite | 16×16 | PNG | Soft gradient |
| Glow Orb | Sprite | 64×64 | PNG | Radial falloff |

### UI Assets

| Asset | Type | Size | Notes |
|-------|------|------|-------|
| Logo | SVG | Vector | TobaTech brand |
| Zone Icons (7) | SVG | Vector | Per zone |
| Control Icons | SVG | Vector | WASD, E, Mouse |
| Social Icons | SVG | Vector | LinkedIn, GitHub, Twitter, etc. |
| Loading Spinner | Lottie/SVG | 100×100 | Animated |
| Compass Rose | SVG | Vector | HUD element |

### Texture Strategy

**Atlas Approach:**
- Environment atlas: 2048×2048 (terrain, rocks, base props)
- Foliage atlas: 1024×1024 (trees, grass, vines)
- Zone-specific atlas: 1024×1024 per zone (unique props)
- Emission atlas: 512×512 (glowing objects)

**Compression:**
- All textures: KTX2 (Basis Universal)
- UASTC for high quality (albedo, emission)
- ETC1S for lower quality (AO, roughness)
- Fallback: Compressed PNG for non-WebGL2

---

## C. Code Scaffolding Outline

### Core Interfaces

```typescript
// === Scene Management ===

interface ISceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  
  init(container: HTMLElement): Promise<void>;
  update(deltaTime: number): void;
  render(): void;
  resize(): void;
  dispose(): void;
  
  add(object: THREE.Object3D): void;
  remove(object: THREE.Object3D): void;
  getQualitySettings(): QualitySettings;
}

// === Asset Loading ===

interface IAssetLoader {
  loadGLTF(url: string, onProgress?: ProgressCallback): Promise<THREE.Group>;
  loadTexture(url: string): Promise<THREE.Texture>;
  loadZonePack(zoneId: string): Promise<ZoneAssets>;
  preloadEssential(): Promise<void>;
  unload(assetId: string): void;
  getFromCache<T>(id: string): T | undefined;
  clearCache(): void;
}

interface ZoneAssets {
  meshes: Map<string, THREE.Mesh>;
  materials: Map<string, THREE.Material>;
  animations: Map<string, THREE.AnimationClip>;
}

// === Character Control ===

interface ICharacterController {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  isGrounded: boolean;
  state: CharacterState;
  
  init(spawnPoint: THREE.Vector3): void;
  update(deltaTime: number): void;
  move(direction: THREE.Vector2): void;
  jump(): void;
  interact(): void;
  teleport(position: THREE.Vector3, rotation?: THREE.Euler): void;
  setEnabled(enabled: boolean): void;
}

type CharacterState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'interacting';

// === Camera Control ===

interface ICameraController {
  camera: THREE.PerspectiveCamera;
  mode: CameraMode;
  
  init(camera: THREE.PerspectiveCamera): void;
  update(deltaTime: number): void;
  setTarget(target: THREE.Object3D): void;
  setMode(mode: CameraMode): void;
  applyZoneSettings(settings: ZoneCameraSettings): void;
  shake(intensity: number, duration: number): void;
  transitionTo(position: THREE.Vector3, lookAt: THREE.Vector3, duration: number): Promise<void>;
}

type CameraMode = 'follow' | 'orbit' | 'cinematic' | 'static';

interface ZoneCameraSettings {
  distance: number;
  heightOffset: number;
  fov: number;
  lookAtOffset: THREE.Vector3;
  damping: number;
}

// === Zone Management ===

interface IZoneManager {
  currentZone: string | null;
  visitedZones: Set<string>;
  
  init(zones: ZoneConfig[]): void;
  update(playerPosition: THREE.Vector3): void;
  getZone(zoneId: string): Zone | undefined;
  isInZone(position: THREE.Vector3, zoneId: string): boolean;
  getAllZoneIds(): string[];
  
  on(event: 'enter' | 'exit', callback: (zoneId: string) => void): void;
}

interface ZoneConfig {
  id: string;
  name: string;
  center: THREE.Vector3;
  radius: number;
  elevation: number;
  cameraSettings: ZoneCameraSettings;
  ambientColor: number;
  fogDensity: number;
}

// === Interaction System ===

interface IInteractionManager {
  hoveredTarget: Interactable | null;
  
  init(scene: THREE.Scene): void;
  update(camera: THREE.Camera): void;
  registerInteractable(config: InteractableConfig): Interactable;
  unregisterInteractable(id: string): void;
  registerZone(zoneId: string, interactables: InteractableConfig[]): void;
  unregisterZone(zoneId: string): void;
  
  on(event: 'hover' | 'unhover' | 'interact', callback: InteractionCallback): void;
}

interface InteractableConfig {
  id: string;
  zoneId: string;
  position: THREE.Vector3;
  triggerRadius: number;
  interactionType: 'press' | 'hold' | 'proximity';
  highlightColor: number;
  panelId: string;
  data: Record<string, unknown>;
}

// === UI Overlay ===

interface IUIOverlay {
  isVisible: boolean;
  activePanel: string | null;
  
  init(container: HTMLElement): void;
  update(): void;
  
  showHUD(): void;
  hideHUD(): void;
  setZoneName(name: string): void;
  setCompassDirection(angle: number): void;
  
  openPanel(config: PanelConfig): Promise<void>;
  closePanel(panelId?: string): Promise<void>;
  
  showToast(message: string, type: ToastType, duration?: number): void;
  showLoading(progress: number, message?: string): void;
  hideLoading(): void;
}

interface PanelConfig {
  id: string;
  type: 'project' | 'about' | 'contact' | 'settings';
  position: 'center' | 'right' | 'bottom';
  content: PanelContent;
  animation?: PanelAnimation;
}

// === Event Bus ===

interface IEventBus {
  on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): () => void;
  off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void;
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
  once<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void;
}

// === Audio Manager ===

interface IAudioManager {
  masterVolume: number;
  isMuted: boolean;
  
  init(): Promise<void>;
  setMasterVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  
  playAmbient(zoneId: string): void;
  stopAmbient(): void;
  crossfadeAmbient(toZoneId: string, duration: number): void;
  
  playSFX(id: string, options?: SFXOptions): void;
  play3D(id: string, position: THREE.Vector3, options?: SFXOptions): void;
  
  updateListener(camera: THREE.Camera): void;
}

// === Quality Manager ===

interface IQualityManager {
  currentTier: QualityTier;
  fps: number;
  
  init(): void;
  detectHardware(): QualityTier;
  setTier(tier: QualityTier): void;
  getSettings(): QualitySettings;
  startMonitoring(): void;
  stopMonitoring(): void;
  
  on(event: 'tierChange', callback: (tier: QualityTier) => void): void;
}

type QualityTier = 'ultra' | 'high' | 'medium' | 'low';

interface QualitySettings {
  shadowMapSize: number;
  shadowEnabled: boolean;
  antialias: 'smaa' | 'fxaa' | 'none';
  bloom: boolean;
  bloomIntensity: number;
  fogDensity: number;
  particleMultiplier: number;
  lodBias: number;
  maxDrawCalls: number;
  textureQuality: 'full' | 'half' | 'quarter';
}
```

### Pseudo-code Snippets

```typescript
// === Character Movement (simplified) ===

class CharacterController implements ICharacterController {
  private rigidBody: RAPIER.RigidBody;
  private collider: RAPIER.Collider;
  private moveSpeed = 5;
  private jumpForce = 8;
  
  update(deltaTime: number): void {
    // Get input
    const input = InputManager.getMovement(); // Vector2
    
    // Calculate move direction relative to camera
    const cameraForward = this.getCameraForward();
    const moveDir = new THREE.Vector3(
      input.x * cameraForward.z + input.y * cameraForward.x,
      0,
      input.x * -cameraForward.x + input.y * cameraForward.z
    ).normalize();
    
    // Apply velocity
    const velocity = this.rigidBody.linvel();
    this.rigidBody.setLinvel({
      x: moveDir.x * this.moveSpeed,
      y: velocity.y,
      z: moveDir.z * this.moveSpeed
    }, true);
    
    // Ground check
    this.isGrounded = this.castGroundRay();
    
    // Update state
    this.updateState(input, velocity);
    
    // Sync mesh to physics
    this.syncMeshToBody();
  }
  
  jump(): void {
    if (!this.isGrounded) return;
    
    const velocity = this.rigidBody.linvel();
    this.rigidBody.setLinvel({ 
      x: velocity.x, 
      y: this.jumpForce, 
      z: velocity.z 
    }, true);
    
    this.state = 'jumping';
    EventBus.emit('character:jump', undefined);
  }
}
```

```typescript
// === Zone Detection (simplified) ===

class ZoneManager implements IZoneManager {
  private zones: Map<string, Zone> = new Map();
  
  update(playerPosition: THREE.Vector3): void {
    let newZone: string | null = null;
    
    for (const [id, zone] of this.zones) {
      const distance = playerPosition.distanceTo(zone.center);
      
      if (distance <= zone.radius) {
        // Check elevation bounds
        const elevDiff = Math.abs(playerPosition.y - zone.elevation);
        if (elevDiff <= zone.elevationTolerance) {
          newZone = id;
          break;
        }
      }
    }
    
    if (newZone !== this.currentZone) {
      if (this.currentZone) {
        this.onZoneExit(this.currentZone);
      }
      if (newZone) {
        this.onZoneEnter(newZone);
      }
      this.currentZone = newZone;
    }
  }
  
  private onZoneEnter(zoneId: string): void {
    const firstVisit = !this.visitedZones.has(zoneId);
    this.visitedZones.add(zoneId);
    
    EventBus.emit('zone:enter', { zoneId, firstVisit });
    
    if (firstVisit) {
      AssetLoader.loadZonePack(zoneId);
    }
  }
}
```

```typescript
// === Liquid Glass Panel Animation (GSAP) ===

function openPanel(element: HTMLElement): gsap.core.Timeline {
  return gsap.timeline()
    .set(element, { 
      display: 'flex',
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    })
    .to(element, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.4,
      ease: 'power2.out'
    })
    .to(element.querySelectorAll('.panel-content > *'), {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.2');
}

function closePanel(element: HTMLElement): gsap.core.Timeline {
  return gsap.timeline()
    .to(element, {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
      duration: 0.3,
      ease: 'power2.in'
    })
    .set(element, { display: 'none' });
}
```

---

## D. Portfolio JSON Schema

### Schema Definition

```typescript
interface PortfolioData {
  version: string;
  lastUpdated: string;
  categories: Category[];
  projects: Project[];
}

interface Category {
  id: string;
  name: string;
  zoneId: string;
  icon: string;
  description: string;
  color: string; // Hex color for accent
}

interface Project {
  id: string;
  categoryId: string;
  title: string;
  tagline: string; // Short (max 100 chars)
  description: string; // Full description
  thumbnail: string; // URL
  images: string[]; // Gallery URLs
  video?: string; // Optional video URL
  tags: string[];
  tech: string[];
  client?: string;
  year: number;
  duration?: string; // e.g., "3 months"
  links: ProjectLinks;
  featured: boolean;
  order: number; // Display order within category
}

interface ProjectLinks {
  live?: string;
  github?: string;
  caseStudy?: string;
  demo?: string;
  appStore?: string;
  playStore?: string;
}
```

### Example Portfolio Data

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-11",
  "categories": [
    {
      "id": "it-services",
      "name": "IT Services",
      "zoneId": "z1",
      "icon": "code",
      "description": "Full-stack web & mobile development",
      "color": "#4A90D9"
    },
    {
      "id": "games",
      "name": "Game Development",
      "zoneId": "z2",
      "icon": "gamepad",
      "description": "Immersive gaming experiences",
      "color": "#9B59B6"
    },
    {
      "id": "ai",
      "name": "AI Automation",
      "zoneId": "z3",
      "icon": "brain",
      "description": "Intelligent automation solutions",
      "color": "#E91E63"
    },
    {
      "id": "media",
      "name": "Media Production",
      "zoneId": "z4",
      "icon": "film",
      "description": "Video, motion, and audio",
      "color": "#FF9800"
    },
    {
      "id": "marketing",
      "name": "Digital Marketing",
      "zoneId": "z5",
      "icon": "megaphone",
      "description": "Growth and brand strategy",
      "color": "#4CAF50"
    }
  ],
  "projects": [
    {
      "id": "ecommerce-platform",
      "categoryId": "it-services",
      "title": "Enterprise E-Commerce Platform",
      "tagline": "Scalable online marketplace handling 1M+ daily transactions",
      "description": "Built a complete e-commerce ecosystem with microservices architecture, real-time inventory management, AI-powered recommendations, and seamless payment integration across 40+ countries.",
      "thumbnail": "/assets/projects/ecommerce/thumb.webp",
      "images": [
        "/assets/projects/ecommerce/01.webp",
        "/assets/projects/ecommerce/02.webp",
        "/assets/projects/ecommerce/03.webp"
      ],
      "tags": ["E-Commerce", "Enterprise", "Microservices"],
      "tech": ["React", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker"],
      "client": "TechRetail Corp",
      "year": 2025,
      "duration": "8 months",
      "links": {
        "caseStudy": "/case-studies/ecommerce"
      },
      "featured": true,
      "order": 1
    },
    {
      "id": "fintech-mobile",
      "categoryId": "it-services",
      "title": "FinTech Mobile Banking App",
      "tagline": "Secure mobile banking for the next generation",
      "description": "Cross-platform banking application with biometric authentication, real-time transactions, investment tracking, and AI-driven spending insights. Achieved 4.8 star rating across app stores.",
      "thumbnail": "/assets/projects/fintech/thumb.webp",
      "images": [
        "/assets/projects/fintech/01.webp",
        "/assets/projects/fintech/02.webp"
      ],
      "tags": ["FinTech", "Mobile", "Security"],
      "tech": ["React Native", "TypeScript", "GraphQL", "AWS", "Plaid API"],
      "client": "NextBank",
      "year": 2025,
      "duration": "6 months",
      "links": {
        "appStore": "https://apps.apple.com/app/nextbank",
        "playStore": "https://play.google.com/store/apps/details?id=com.nextbank"
      },
      "featured": true,
      "order": 2
    },
    {
      "id": "vr-adventure",
      "categoryId": "games",
      "title": "Echoes of Eternity VR",
      "tagline": "Award-winning VR adventure with handcrafted worlds",
      "description": "Immersive VR adventure game featuring a 12-hour campaign, physics-based puzzles, and emotionally-driven narrative. Winner of 'Best VR Experience 2025' at GameDev Awards.",
      "thumbnail": "/assets/projects/echoes/thumb.webp",
      "images": [
        "/assets/projects/echoes/01.webp",
        "/assets/projects/echoes/02.webp",
        "/assets/projects/echoes/03.webp"
      ],
      "video": "https://youtube.com/embed/abc123",
      "tags": ["VR", "Adventure", "Puzzle"],
      "tech": ["Unreal Engine 5", "Meta Quest", "SteamVR", "Wwise"],
      "year": 2025,
      "duration": "18 months",
      "links": {
        "live": "https://store.steampowered.com/app/echoes",
        "demo": "https://store.steampowered.com/app/echoes-demo"
      },
      "featured": true,
      "order": 1
    },
    {
      "id": "mobile-puzzle",
      "categoryId": "games",
      "title": "Crystal Cascade",
      "tagline": "5M+ downloads puzzle game",
      "description": "Relaxing puzzle game with 500+ handcrafted levels, daily challenges, and competitive leagues. Optimized for devices from low-end to flagship.",
      "thumbnail": "/assets/projects/crystal/thumb.webp",
      "images": [
        "/assets/projects/crystal/01.webp",
        "/assets/projects/crystal/02.webp"
      ],
      "tags": ["Mobile", "Puzzle", "Casual"],
      "tech": ["Unity", "C#", "Firebase", "AdMob"],
      "year": 2024,
      "duration": "5 months",
      "links": {
        "appStore": "https://apps.apple.com/app/crystal-cascade",
        "playStore": "https://play.google.com/store/apps/details?id=com.crystal"
      },
      "featured": false,
      "order": 2
    },
    {
      "id": "customer-service-ai",
      "categoryId": "ai",
      "title": "AI Customer Service Agent",
      "tagline": "Reduced support tickets by 60%",
      "description": "Multi-lingual AI agent handling customer inquiries across email, chat, and voice. Fine-tuned on domain-specific data with seamless human handoff for complex issues.",
      "thumbnail": "/assets/projects/cs-ai/thumb.webp",
      "images": [
        "/assets/projects/cs-ai/01.webp",
        "/assets/projects/cs-ai/02.webp"
      ],
      "tags": ["Customer Service", "NLP", "Automation"],
      "tech": ["Python", "LangChain", "GPT-4", "Pinecone", "FastAPI"],
      "client": "ServicePro Inc",
      "year": 2025,
      "duration": "4 months",
      "links": {
        "caseStudy": "/case-studies/cs-ai"
      },
      "featured": true,
      "order": 1
    },
    {
      "id": "document-processor",
      "categoryId": "ai",
      "title": "Intelligent Document Processing",
      "tagline": "Process 10,000+ documents per hour",
      "description": "AI pipeline for extracting, classifying, and validating data from unstructured documents. OCR + NLP + custom ML models with 99.2% accuracy.",
      "thumbnail": "/assets/projects/idp/thumb.webp",
      "images": [
        "/assets/projects/idp/01.webp"
      ],
      "tags": ["Document AI", "OCR", "ML"],
      "tech": ["Python", "TensorFlow", "Azure Document Intelligence", "Kafka"],
      "client": "LegalTech Corp",
      "year": 2025,
      "duration": "5 months",
      "links": {},
      "featured": false,
      "order": 2
    },
    {
      "id": "brand-film",
      "categoryId": "media",
      "title": "TechStart Brand Film",
      "tagline": "15M views across platforms",
      "description": "Cinematic brand story combining live action and motion graphics. Shot on RED Komodo with custom VFX sequences. Full production from concept to color grade.",
      "thumbnail": "/assets/projects/techstart/thumb.webp",
      "images": [
        "/assets/projects/techstart/01.webp",
        "/assets/projects/techstart/02.webp"
      ],
      "video": "https://youtube.com/embed/xyz789",
      "tags": ["Brand Film", "VFX", "Motion"],
      "tech": ["DaVinci Resolve", "After Effects", "Cinema 4D", "RED Komodo"],
      "client": "TechStart",
      "year": 2025,
      "duration": "2 months",
      "links": {
        "live": "https://youtube.com/watch?v=xyz789"
      },
      "featured": true,
      "order": 1
    },
    {
      "id": "podcast-series",
      "categoryId": "media",
      "title": "Future Forward Podcast",
      "tagline": "Top 10 Tech Podcast 2025",
      "description": "Complete podcast production including recording, editing, mixing, mastering, and distribution. 50+ episodes with 2M total downloads.",
      "thumbnail": "/assets/projects/podcast/thumb.webp",
      "images": [
        "/assets/projects/podcast/01.webp"
      ],
      "tags": ["Podcast", "Audio", "Production"],
      "tech": ["Pro Tools", "Adobe Audition", "Izotope RX", "Spotify"],
      "year": 2025,
      "duration": "Ongoing",
      "links": {
        "live": "https://spotify.com/show/futureforward"
      },
      "featured": false,
      "order": 2
    },
    {
      "id": "saas-launch",
      "categoryId": "marketing",
      "title": "CloudSync SaaS Launch Campaign",
      "tagline": "0 to 50K users in 90 days",
      "description": "Full-funnel launch campaign including paid social, content marketing, influencer partnerships, and email automation. 4.2x ROAS with $150K ad spend.",
      "thumbnail": "/assets/projects/cloudsync/thumb.webp",
      "images": [
        "/assets/projects/cloudsync/01.webp",
        "/assets/projects/cloudsync/02.webp"
      ],
      "tags": ["SaaS", "Launch", "Growth"],
      "tech": ["Google Ads", "Meta Ads", "HubSpot", "Mixpanel"],
      "client": "CloudSync",
      "year": 2025,
      "duration": "4 months",
      "links": {
        "caseStudy": "/case-studies/cloudsync"
      },
      "featured": true,
      "order": 1
    },
    {
      "id": "seo-transformation",
      "categoryId": "marketing",
      "title": "E-Commerce SEO Transformation",
      "tagline": "300% organic traffic increase",
      "description": "Technical SEO overhaul, content strategy, and link building campaign for major e-commerce retailer. Achieved #1 rankings for 200+ high-intent keywords.",
      "thumbnail": "/assets/projects/seo/thumb.webp",
      "images": [
        "/assets/projects/seo/01.webp"
      ],
      "tags": ["SEO", "E-Commerce", "Content"],
      "tech": ["Ahrefs", "Screaming Frog", "Google Analytics", "Search Console"],
      "client": "RetailMax",
      "year": 2025,
      "duration": "12 months",
      "links": {
        "caseStudy": "/case-studies/retailmax-seo"
      },
      "featured": false,
      "order": 2
    }
  ]
}
```

---

## E. Optimization Strategy

### Draw Call Budgets

| Platform | Target FPS | Max Draw Calls | Notes |
|----------|------------|----------------|-------|
| Desktop Ultra | 60 | 300 | Full effects |
| Desktop High | 60 | 200 | Reduced particles |
| Desktop Medium | 60 | 150 | No shadows |
| Desktop Low | 60 | 100 | Minimal effects |
| Mobile High | 60 | 100 | Modern flagship |
| Mobile Medium | 30 | 75 | Mid-range |
| Mobile Low | 30 | 50 | Older devices |

### Triangle Budgets (Visible at Once)

| Tier | Total Triangles | Environment | Character | VFX | UI 3D |
|------|-----------------|-------------|-----------|-----|-------|
| Ultra | 500K | 400K | 10K | 40K | 50K |
| High | 300K | 240K | 8K | 20K | 32K |
| Medium | 150K | 120K | 6K | 10K | 14K |
| Low | 75K | 60K | 4K | 5K | 6K |

### Texture Memory Budgets

| Tier | Total VRAM | Environment | Character | VFX | UI |
|------|------------|-------------|-----------|-----|-----|
| Ultra | 512 MB | 300 MB | 50 MB | 80 MB | 82 MB |
| High | 256 MB | 150 MB | 40 MB | 40 MB | 26 MB |
| Medium | 128 MB | 75 MB | 25 MB | 15 MB | 13 MB |
| Low | 64 MB | 40 MB | 15 MB | 5 MB | 4 MB |

### Postprocessing Rules

| Effect | Ultra | High | Medium | Low |
|--------|-------|------|--------|-----|
| SMAA | 2x | 1x | — | — |
| FXAA | — | — | ✓ | ✓ |
| Bloom | 0.8 int | 0.4 int | 0.2 int | — |
| Fog | Volumetric | Height | Height | Simple |
| Color Grading | Full LUT | Simple | — | — |
| Vignette | ✓ | ✓ | — | — |
| Motion Blur | ✓ | — | — | — |

### Instancing Strategy

| Object Type | Instance Count | Batch Size | LOD Crossfade |
|-------------|----------------|------------|---------------|
| Trees (small) | 500 | 100 | Yes |
| Trees (medium) | 200 | 50 | Yes |
| Rocks | 400 | 100 | No |
| Grass patches | 5000 | 500 | Distance fade |
| Mushrooms | 150 | 50 | No |
| Fireflies | 200 | 200 | — |

### Loading Strategy

```
Phase 1: Critical (< 2s)
├── Logo SVG
├── Loading UI CSS
└── Minimal JS bundle

Phase 2: Playable (< 5s)
├── Core engine (Three.js + Rapier)
├── HUB zone (terrain LOD0, lighting)
├── Robot model + idle animation
└── Basic materials

Phase 3: Enhanced (async, < 15s total)
├── HUB zone (LOD1-2 detail)
├── Adjacent zone LOD0 (Z1, Z2, Z3)
├── Particle systems
└── Audio engine + ambient sound

Phase 4: On-Demand (per zone)
├── Zone-specific meshes
├── Zone-specific textures
├── Zone interactables
└── Zone audio
```

### Caching Strategy

```typescript
// Asset cache with LRU eviction
const CACHE_CONFIG = {
  maxMemoryMB: 256,
  evictionPolicy: 'lru',
  persistToDisk: false, // Use browser cache via ETags
  
  priorities: {
    'robot': 'permanent',      // Never evict
    'hub-zone': 'permanent',   // Never evict
    'current-zone': 'high',    // Keep loaded
    'adjacent-zones': 'medium',// Keep if space
    'distant-zones': 'low'     // Evict first
  }
};

// IndexedDB for large assets (optional offline)
const IDB_CONFIG = {
  dbName: 'tobatech-assets',
  stores: ['models', 'textures', 'audio'],
  maxSizeMB: 100
};
```

---

## F. Pipeline Checklist

### Blender Export Settings

```yaml
# glTF Export Settings
Format: glTF Binary (.glb)
Include:
  - Selected Objects: false (export all)
  - Visible Objects: true
  - Active Collection: false

Transform:
  - Y Up: true
  - Apply Modifiers: true

Data:
  - Mesh:
    - Apply Modifiers: true
    - UVs: true
    - Normals: true
    - Tangents: true (if normal maps)
    - Vertex Colors: true
    - Loose Edges: false
    - Loose Points: false
  
  - Material:
    - Materials: Export
    - Images: Automatic (or Manual for atlases)
  
  - Lighting:
    - Lights: Skip (baked)
  
  - Animation:
    - Animations: true
    - Shape Keys: true
    - Skinning: true
    - Bake All Actions: true
    - Limit to Playback Range: true
    - Sampling Rate: 30

Compression:
  - Compression: None (use gltf-transform later)
```

### Baking Steps

1. **Lightmap Baking**
   ```bash
   # In Blender
   1. Create UV2 channel for lightmaps
   2. Set up lighting (sun + ambient)
   3. Bake Type: Diffuse (Color only OFF, Direct + Indirect)
   4. Bake Size: 2048 for main, 1024 for props
   5. Apply to emission or dedicated lightmap
   ```

2. **AO Baking**
   ```bash
   1. Separate UV2 or atlas region
   2. Bake Type: Ambient Occlusion
   3. Samples: 128+
   4. Distance: 0.5-2.0 based on object scale
   5. Multiply on albedo or separate channel
   ```

3. **Normal Map Baking** (if high-poly source)
   ```bash
   1. Retopologized low-poly version
   2. High to low projection
   3. Cage adjustment for clean results
   4. Tangent space normals
   ```

### Compression Steps

```bash
# Install tools
npm install -g @gltf-transform/cli

# Full optimization pipeline
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 1024 \
  --simplify \
  --simplify-ratio 0.75 \
  --simplify-error 0.01

# Draco settings for geometry
gltf-transform draco input.glb output.glb \
  --method edgebreaker \
  --quantize-position 14 \
  --quantize-normal 10 \
  --quantize-texcoord 12 \
  --quantize-color 8

# KTX2/Basis for textures
gltf-transform ktx2 input.glb output.glb \
  --slots "baseColorTexture,emissiveTexture" \
  --codec uastc \
  --uastc-quality 3

# Alternative: ETC1S for smaller file size
gltf-transform ktx2 input.glb output.glb \
  --slots "occlusionTexture,metallicRoughnessTexture" \
  --codec etc1s \
  --quality 128
```

### Validation Steps

```bash
# Validate glTF
npx gltf-validator output.glb

# Check file size
ls -la *.glb

# Verify in viewer
npx gltf-viewer output.glb

# Check in Three.js (browser console)
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.setKTX2Loader(ktx2Loader);
loader.load('output.glb', (gltf) => {
  console.log('Scenes:', gltf.scenes.length);
  console.log('Meshes:', gltf.scenes[0].children.length);
  console.log('Animations:', gltf.animations.length);
});
```

### Pre-Commit Checklist

- [ ] All meshes triangulated
- [ ] UV channels present (UV1 main, UV2 lightmap)
- [ ] Materials use PBR workflow
- [ ] Textures power-of-2 dimensions
- [ ] No duplicate materials
- [ ] Armature applied (animations baked)
- [ ] Origin points consistent
- [ ] Naming convention followed
- [ ] glTF validation passes
- [ ] Target file size met
- [ ] Loads in test scene correctly

---

## G. Quality & Performance Checklist

### Profiling Tools

| Tool | Purpose | Platform |
|------|---------|----------|
| Chrome DevTools Performance | JS flame chart, FPS | Desktop |
| Spector.js | WebGL calls, draw analysis | Desktop |
| three.js Stats.js | Real-time FPS, memory | All |
| renderer.info | Draw calls, triangles | All |
| Safari WebGL Profiler | GPU analysis | macOS/iOS |
| Android GPU Inspector | Mobile GPU | Android |

### Metrics to Track

| Metric | Target (Desktop) | Target (Mobile) | Critical Threshold |
|--------|------------------|-----------------|-------------------|
| FPS | ≥60 | ≥30 | <24 = fix |
| Frame Time | <16.6ms | <33.3ms | >50ms = fix |
| Draw Calls | <200 | <100 | >300 desktop = fix |
| Triangles | <300K | <100K | >500K = fix |
| Texture Memory | <256MB | <128MB | >512MB = fix |
| JS Heap | <100MB | <75MB | >200MB = fix |
| TTI (Time to Interactive) | <5s | <8s | >10s = fix |
| LCP (Largest Contentful) | <2.5s | <4s | >6s = fix |

### Profiling Procedure

```typescript
// Built-in profiling helper
class Profiler {
  private samples: Map<string, number[]> = new Map();
  
  start(label: string): void {
    performance.mark(`${label}-start`);
  }
  
  end(label: string): void {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label, 'measure')[0];
    if (!this.samples.has(label)) {
      this.samples.set(label, []);
    }
    this.samples.get(label)!.push(measure.duration);
    performance.clearMeasures(label);
  }
  
  report(): void {
    for (const [label, samples] of this.samples) {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      const max = Math.max(...samples);
      console.log(`[${label}] avg: ${avg.toFixed(2)}ms, max: ${max.toFixed(2)}ms`);
    }
  }
}

// Usage in update loop
profiler.start('physics');
PhysicsWorld.step(deltaTime);
profiler.end('physics');

profiler.start('character');
CharacterController.update(deltaTime);
profiler.end('character');

// ... etc
```

### Regression Checklist (Per Build)

- [ ] FPS stable 60 desktop, 30+ mobile
- [ ] No frame spikes > 50ms
- [ ] Memory stable (no grow over 5 mins)
- [ ] Draw calls within budget
- [ ] TTI under target
- [ ] All zones load without stutter
- [ ] Portal transitions smooth
- [ ] Audio plays without crackling
- [ ] Touch controls responsive
- [ ] No console errors
- [ ] WebGL context preserved (no loss)
- [ ] Mobile battery draw acceptable
- [ ] All quality tiers functional

---

## H. UI Specification (Liquid Glass)

### CSS Implementation

```css
/* === Variables === */
:root {
  /* Glass effect base */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-bg-hover: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-border-strong: rgba(255, 255, 255, 0.25);
  --glass-blur: 24px;
  --glass-blur-heavy: 40px;
  
  /* Glow and specular */
  --glass-glow: rgba(255, 255, 255, 0.1);
  --glass-specular: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  
  /* Shadows */
  --glass-shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.15);
  --glass-shadow-elevated: 0 16px 48px rgba(0, 0, 0, 0.25);
  
  /* Animation */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Space Grotesk', var(--font-primary);
  
  /* Colors */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.65);
  --text-tertiary: rgba(255, 255, 255, 0.45);
  --accent-blue: #4A90D9;
  --accent-purple: #9B59B6;
  --accent-green: #4CAF50;
}

/* === Base Glass Panel === */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: 
    var(--glass-shadow-soft),
    inset 0 1px 0 var(--glass-glow);
  overflow: hidden;
  position: relative;
}

.glass-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-specular);
  pointer-events: none;
  border-radius: inherit;
}

/* === Fallback for no backdrop-filter === */
@supports not (backdrop-filter: blur(1px)) {
  .glass-panel {
    background: rgba(30, 30, 40, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* === Panel Variants === */
.glass-panel--elevated {
  box-shadow: var(--glass-shadow-elevated);
  backdrop-filter: blur(var(--glass-blur-heavy));
}

.glass-panel--solid {
  background: rgba(20, 20, 30, 0.85);
}

/* === Glass Buttons === */
.glass-button {
  background: var(--glass-bg-hover);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 24px;
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s var(--ease-smooth);
  position: relative;
  overflow: hidden;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: var(--glass-border-strong);
  transform: translateY(-1px);
}

.glass-button:active {
  transform: translateY(0) scale(0.98);
}

.glass-button--primary {
  background: linear-gradient(135deg, var(--accent-blue), #6B5CE7);
  border: none;
}

.glass-button--primary:hover {
  background: linear-gradient(135deg, #5BA0E9, #7B6CF7);
}

/* === Tech Chips === */
.glass-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.15s var(--ease-smooth);
}

.glass-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.glass-chip--active {
  background: rgba(74, 144, 217, 0.2);
  border-color: rgba(74, 144, 217, 0.4);
  color: var(--accent-blue);
}

/* === HUD Elements === */
.hud-container {
  position: fixed;
  z-index: 100;
  pointer-events: none;
}

.hud-zone-name {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  padding: 8px 20px;
  border-radius: 20px;
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-primary);
  pointer-events: auto;
}

.hud-compass {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  pointer-events: auto;
}

.hud-controls {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

/* === Panel Layouts === */
.project-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 800px);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.project-panel__header {
  padding: 24px;
  border-bottom: 1px solid var(--glass-border);
}

.project-panel__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.project-panel__tagline {
  font-size: 16px;
  color: var(--text-secondary);
}

.project-panel__content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.project-panel__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.project-panel__image {
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.project-panel__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.project-panel__description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.project-panel__links {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.project-panel__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === Contact Form === */
.contact-panel {
  width: min(90vw, 500px);
}

.contact-panel__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.glass-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px 18px;
  color: var(--text-primary);
  font-size: 15px;
  transition: border-color 0.2s;
}

.glass-input:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.glass-input::placeholder {
  color: var(--text-tertiary);
}

.glass-textarea {
  resize: vertical;
  min-height: 120px;
}

/* === Mini Map === */
.mini-map {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  pointer-events: auto;
}

.mini-map__canvas {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.mini-map__marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: var(--accent-blue);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px var(--accent-blue);
}

/* === Loading Screen === */
.loading-screen {
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, #0a0a12 0%, #141428 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-screen__logo {
  width: 120px;
  margin-bottom: 32px;
  animation: float 2s ease-in-out infinite;
}

.loading-screen__bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-screen__progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  border-radius: 2px;
  transition: width 0.3s var(--ease-smooth);
}

.loading-screen__text {
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-tertiary);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

### Motion Curves (GSAP)

```typescript
// Animation presets
const MOTION = {
  // Panel open/close
  panelOpen: {
    opacity: { from: 0, to: 1, duration: 0.4 },
    scale: { from: 0.92, to: 1, duration: 0.5 },
    filter: { from: 'blur(12px)', to: 'blur(0px)', duration: 0.4 },
    ease: 'power3.out'
  },
  
  panelClose: {
    opacity: { to: 0, duration: 0.25 },
    scale: { to: 0.95, duration: 0.25 },
    filter: { to: 'blur(8px)', duration: 0.25 },
    ease: 'power2.in'
  },
  
  // Content stagger
  contentEnter: {
    opacity: { from: 0, to: 1 },
    y: { from: 20, to: 0 },
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.out'
  },
  
  // Button hover
  buttonHover: {
    scale: 1.02,
    y: -2,
    duration: 0.15,
    ease: 'power2.out'
  },
  
  // Chip press
  chipPress: {
    scale: 0.96,
    duration: 0.1,
    ease: 'power2.in'
  },
  
  // Zone name transition
  zoneNameChange: {
    opacity: { to: 0, duration: 0.15 },
    y: { to: -10, duration: 0.15 },
    ease: 'power2.in',
    // Then reverse in
    enter: {
      y: { from: 10, to: 0 },
      opacity: { to: 1 },
      duration: 0.25,
      ease: 'power2.out'
    }
  },
  
  // Loading fade
  loadingExit: {
    opacity: { to: 0, duration: 0.6 },
    ease: 'power2.inOut'
  },
  
  // Spring preset for bouncy UI
  spring: 'elastic.out(1, 0.5)',
  
  // Smooth camera-like easing
  cinematic: 'power3.inOut'
};
```

### Accessibility Rules

| Requirement | Implementation | Test Method |
|-------------|----------------|-------------|
| Focus visible | 2px outline offset 2px, high contrast | Keyboard nav |
| Focus order | Logical tab sequence | Tab through UI |
| Color contrast | 4.5:1 minimum for text | Lighthouse audit |
| Touch targets | 44×44px minimum | Mobile testing |
| Screen reader | aria-labels on interactive elements | VoiceOver/NVDA |
| Reduced motion | Respect prefers-reduced-motion | System setting |
| Keyboard nav | All panels, buttons, forms keyboard accessible | No mouse test |
| Skip link | "Skip 3D, go to content" | Top of page |

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .loading-screen__logo {
    animation: none;
  }
}

/* Focus styles */
.glass-button:focus-visible,
.glass-chip:focus-visible,
.glass-input:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --glass-bg: rgba(0, 0, 0, 0.9);
    --glass-border: rgba(255, 255, 255, 0.5);
    --text-primary: #ffffff;
    --text-secondary: #e0e0e0;
  }
}
```

### Component Summary

| Component | File | Purpose | Interactions |
|-----------|------|---------|--------------|
| HUD | HUD.ts | Compass, zone name, control hints | Always visible, updates per zone |
| ProjectPanel | ProjectPanel.ts | Project details, gallery, links | Opens on totem interact |
| ContactForm | ContactForm.ts | Name, email, message, submit | Opens in Z7 |
| MiniMap | MiniMap.ts | World overview, zone markers | Click to fast travel |
| Chips | Chips.ts | Technology/tag pills | Click to filter |
| Toast | Toast.ts | Notifications | Auto-dismiss |
| Modal | Modal.ts | Confirmation dialogs | Block interaction |
| LoadingScreen | LoadingScreen.ts | Initial load, zone transitions | Cover during load |
| Settings | Settings.ts | Quality, audio, controls | Pause menu |

---

## Summary Checklist

- [x] Architecture blueprint with system diagrams
- [x] Data flow and update loop order
- [x] Event bus pattern with typed events
- [x] Complete folder structure
- [x] Asset list with polygon/texture budgets
- [x] TypeScript interfaces for all systems
- [x] Pseudo-code for critical systems
- [x] Portfolio JSON schema + 10 example projects
- [x] Draw call and triangle budgets per tier
- [x] Texture memory budgets per tier
- [x] Postprocessing rules per tier
- [x] Instancing strategy
- [x] Loading and caching strategy
- [x] Blender export settings
- [x] Baking workflow (lightmaps, AO)
- [x] DRACO/KTX2 compression pipeline
- [x] Validation checklist
- [x] Profiling tools and procedure
- [x] Performance metrics and thresholds
- [x] Regression testing checklist
- [x] Liquid Glass CSS implementation
- [x] GSAP motion curves
- [x] Accessibility rules and fallbacks
- [x] UI component inventory
