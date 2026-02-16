# TobaTech Jungle — World Map Design Document

> A low-poly mystical jungle/forest hybrid world for an interactive 3D portfolio experience.

---

## 1. World Overview

**Official World Name:** TobaTech Jungle

**Theme:** Low-poly mystical jungle with bioluminescent flora, ancient tech ruins, floating particles, magical runes, and a friendly robot explorer.

**Scale:** 1 unit = 1 meter. Total world bounds: 200m × 200m. Playable area: ~180m × 180m with soft boundaries.

**Coordinate System:** Y-up, center at (0, 0, 0) which is the Central Hub.

---

## 2. ASCII World Map

```
                            N
                            ↑
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │        ╔═══════╗                      ╔═══════╗             │
    │        ║  Z6   ║←─Portal─→            ║  Z7   ║             │
    │        ║ ABOUT ║    Bridge            ║CONTACT║             │
    │        ╚═══╤═══╝                      ╚═══╤═══╝             │
    │            │                              │                 │
    │            │ Vine Path                    │ Crystal Path    │
    │            │                              │                 │
    │    ╔═══════╧═══════╗              ╔═══════╧═══════╗         │
    │    ║      Z4       ║←─Portal─→    ║      Z5       ║         │
    │    ║    MEDIA      ║   Tunnel     ║   MARKETING   ║         │
    │    ╚═══════╤═══════╝              ╚═══════╤═══════╝         │
    │            │                              │                 │
    │            │                              │                 │
    │     ═══════╧══════════════╦═══════════════╧═══════          │
    │                           ║                                 │
    │                     ╔═════╩═════╗                           │
    │      ╔═══════╗      ║    HUB    ║      ╔═══════╗            │
    │      ║  Z2   ║←─────║  CENTRAL  ║─────→║  Z3   ║            │
    │      ║ GAMES ║      ║  CLEARING ║      ║  A.I. ║            │
    │      ╚═══╤═══╝      ╚═════╦═════╝      ╚═══╤═══╝            │
    │          │                ║                │                │
    │          │                ║                │                │
    │          └────Portal──────╬────Portal──────┘                │
    │                           ║                                 │
    │                     ╔═════╩═════╗                           │
    │                     ║    Z1     ║                           │
    │                     ║    I.T.   ║                           │
    │                     ║ SERVICES  ║                           │
    │                     ╚═══════════╝                           │
    │                           │                                 │
    │                      [SPAWN]                                │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
                            ↓
                            S

Legend:
═══  Main Path (walkable road)
───  Secondary Path (vine bridge/stone path)
←→   Portal Connection
╔╗╚╝ Zone Boundary
```

---

## 3. Zone Definitions

| Zone ID | Zone Name | Service Category | Coordinates (center) | Radius | Elevation |
|---------|-----------|------------------|---------------------|--------|-----------|
| HUB | The Nexus Clearing | Central Hub | (0, 0, 0) | 15m | 0m |
| Z1 | CodeForge Ruins | IT Services | (0, 0, -40) | 20m | -2m |
| Z2 | Pixel Grove | Game Development | (-45, 0, 0) | 18m | +3m |
| Z3 | Neural Cavern | AI Automation | (45, 0, 0) | 18m | -5m |
| Z4 | Lumina Falls | Media Production | (-40, 0, 45) | 20m | +8m |
| Z5 | Beacon Spire | Digital Marketing | (40, 0, 45) | 18m | +5m |
| Z6 | Origin Tree | About / Team | (-35, 0, 70) | 15m | +12m |
| Z7 | Echo Chamber | Contact | (35, 0, 70) | 12m | +10m |

---

## 4. Detailed Zone Specifications

### HUB: The Nexus Clearing

**Description:** A mystical clearing at the world's center. Ancient stone circle with glowing runes. The robot spawns nearby and this serves as the navigation hub.

**Landmark:** Giant floating compass crystal (3m diameter) that slowly rotates and points to unvisited zones.

**Mood Lighting:**
- Warm golden ambient (0xFFF5E1)
- Soft volumetric god rays through canopy gaps
- Firefly particles (50 count)

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Compass Crystal | Main Totem | Press E | World overview, guided tour start |
| Zone Signposts (7x) | Direction Signs | Hover | Zone name + icon preview |
| Tutorial Stone | Info Tablet | Press E | Controls tutorial |
| Chest of Wonders | Easter Egg | Press E | Credits / special thanks |

**Ambient VFX:**
- Fireflies (particle system, 50 instances)
- Floating pollen (soft white particles)
- Ground fog (height-based, 0.5m thick)
- Rune glow pulse (shader, 2s cycle)

**Portfolio Panel Trigger:** Compass Crystal opens "Welcome" panel with site overview.

---

### Z1: CodeForge Ruins

**Description:** Ancient stone ruins overgrown with vines. Holographic screens flicker between pillars. Server-rack-like stone monoliths emit soft blue light.

**Landmark:** The Compiler Obelisk — a 6m tall cracked monolith with streaming code projections.

**Mood Lighting:**
- Cool blue-cyan ambient (0x4A90D9)
- Flickering hologram emissives
- Subtle electric particle arcs

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Compiler Obelisk | Main Totem | Press E | IT Services overview |
| Terminal Alpha | Hologram Screen | Press E | Web Dev projects |
| Terminal Beta | Hologram Screen | Press E | Mobile App projects |
| Terminal Gamma | Hologram Screen | Press E | Backend/Cloud projects |
| Debug Crystal | Collectible | Press E | Fun fact / quote |
| Keyboard Relic | Decoration | Hover | Easter egg text |

**Ambient VFX:**
- Code rain particles (matrix-style, 30 streams)
- Electric arcs between pillars (random 3s interval)
- Hologram static/glitch (shader effect)
- Mist pooling in low areas

**Portfolio Panel Trigger:** Each terminal opens project carousel for that subcategory.

---

### Z2: Pixel Grove

**Description:** Colorful low-poly forest where trees have cube-shaped leaves. Giant game controller fossils embedded in rocks. Retro arcade cabinets grow like mushrooms.

**Landmark:** The Polygon Tree — a massive tree (10m) with perfectly geometric branches, leaves are spinning cubes.

**Mood Lighting:**
- Vibrant multicolor (shifting hues)
- Neon accent glows from arcade cabinets
- Playful bouncing light orbs

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Polygon Tree | Main Totem | Press E | Game Dev overview |
| Arcade Cabinet 1 | Game Machine | Press E | Unity games showcase |
| Arcade Cabinet 2 | Game Machine | Press E | Unreal games showcase |
| Game Cartridge | Collectible | Press E | Mobile games |
| Trophy Pedestal | Display | Press E | Awards / achievements |
| Hidden Pipe | Secret | Press E | Classic game easter egg |

**Ambient VFX:**
- Bouncing pixel particles (8-bit style)
- Rainbow mist around arcade machines
- Floating coin particles (yellow, spinning)
- Leaf cubes gently rotating

**Portfolio Panel Trigger:** Arcade cabinets open game project details with playable demo links.

---

### Z3: Neural Cavern

**Description:** Deep crystalline cave with neural network patterns etched in walls. Glowing synaptic connections pulse between crystal formations. Data streams flow like underground rivers.

**Landmark:** The Brain Core — a massive crystalline brain structure (4m) with pulsing energy pathways.

**Mood Lighting:**
- Deep purple/magenta ambient (0x9B59B6)
- Pulsing synapse glows (cyan/pink)
- Bioluminescent crystal clusters

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Brain Core | Main Totem | Press E | AI Automation overview |
| Data Stream 1 | Flow Terminal | Press E | ML/AI projects |
| Data Stream 2 | Flow Terminal | Press E | Automation workflows |
| Neural Node | Cluster | Press E | Chatbot / NLP projects |
| Training Pod | Container | Press E | Computer vision work |

**Ambient VFX:**
- Synapse pulses (traveling light along paths)
- Data particle rivers (flowing downward)
- Crystal resonance (subtle vibration)
- Depth fog (purple tinted)

**Portfolio Panel Trigger:** Brain Core opens AI capabilities overview with live demo links.

---

### Z4: Lumina Falls

**Description:** Terraced waterfall zone with floating camera drones. Giant film reels serve as lily pads. Projection screens embedded in rock faces show video loops.

**Landmark:** The Director's Throne — an ornate stone chair facing a massive natural projection screen (waterfall curtain).

**Mood Lighting:**
- Cinematic warm/cool contrast
- Moving projector light beams
- Waterfall refraction sparkles

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Director's Throne | Main Totem | Press E | Media Production overview |
| Film Reel 1 | Floating Pad | Press E | Video production work |
| Film Reel 2 | Floating Pad | Press E | Motion graphics |
| Camera Drone | Flying Object | Press E | Photography portfolio |
| Sound Stone | Audio Crystal | Press E | Audio/podcast work |
| Clapperboard | Prop | Press E | Behind the scenes |

**Ambient VFX:**
- Waterfall mist and particles
- Floating film strip particles
- Lens flare from projector beams
- Audio visualizer waves (subtle)

**Portfolio Panel Trigger:** Opens media player panel with video thumbnails and play capability.

---

### Z5: Beacon Spire

**Description:** Elevated plateau with a lighthouse-like spire broadcasting holographic advertisements. Megaphone flowers and billboard vines create a marketing jungle.

**Landmark:** The Signal Tower — a 12m crystalline spire that broadcasts rotating holographic banners.

**Mood Lighting:**
- Energetic orange/yellow ambient
- Pulsing beacon sweeps
- Neon sign glows

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Signal Tower | Main Totem | Press E | Digital Marketing overview |
| Billboard Vine 1 | Display | Press E | Social media campaigns |
| Billboard Vine 2 | Display | Press E | SEO/SEM case studies |
| Megaphone Flower | Speaker | Press E | Brand strategy work |
| Analytics Crystal | Data Viz | Press E | Performance dashboards |
| Growth Pod | Plant | Press E | Growth hacking examples |

**Ambient VFX:**
- Rotating beacon light
- Floating emoji particles
- Holographic banner flickers
- Upward growth particles (green)

**Portfolio Panel Trigger:** Opens marketing dashboard panel with metrics and case study cards.

---

### Z6: Origin Tree

**Description:** Ancient massive tree (25m) with a hollow interior. Inside is a cozy space with photos, team totems, and company history carved into wood. Warm and personal.

**Landmark:** The Elder Tree — a giant wise tree with a glowing heart visible through bark cracks.

**Mood Lighting:**
- Warm amber/orange interior glow
- Soft dappled sunlight through leaves
- Cozy firefly clusters

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Elder Tree Heart | Main Totem | Press E | Company story / mission |
| Photo Gallery | Wall Display | Press E | Team photos |
| Timeline Rings | Tree Rings | Press E | Company history |
| Trophy Shelf | Display | Press E | Awards / certifications |
| Values Stone | Carved Rock | Press E | Core values / culture |

**Ambient VFX:**
- Fireflies inside tree hollow
- Dust motes in light beams
- Gentle leaf falling particles
- Warm glow pulse from heart

**Portfolio Panel Trigger:** Opens about panel with team carousel and expandable sections.

---

### Z7: Echo Chamber

**Description:** A mystical amphitheater formed by curved crystal walls. Sound waves visible as light ripples. Communication totems arranged in a circle.

**Landmark:** The Contact Crystal — a resonating crystal that "rings" when approached, inviting connection.

**Mood Lighting:**
- Soft teal/white ambient
- Rippling light waves on surfaces
- Gentle pulsing highlights

**Interactables:**
| Object | Type | Action | Panel Content |
|--------|------|--------|---------------|
| Contact Crystal | Main Totem | Press E | Contact form panel |
| Calendar Stone | Booking | Press E | Meeting scheduler embed |
| Social Pillars (4x) | Links | Press E | Social media links |
| Message Bird | Creature | Press E | Quick email action |

**Ambient VFX:**
- Sound wave ripples (expanding rings)
- Floating message scroll particles
- Crystal resonance glow
- Connecting line particles between pillars

**Portfolio Panel Trigger:** Opens liquid glass contact form with booking calendar.

---

## 5. Portal System

### Portal Design
Portals are mystical archways formed by intertwined vines and glowing crystals. Style: low-poly stone frame (200 tris) with particle swirl effect in center (shader-based, no geometry).

**Portal Behavior:**
1. **Inactive State:** Faint glow, slow particle drift
2. **Approach Detection:** Within 5m, portal activates (brighter glow, faster particles, sound cue)
3. **Enter Trigger:** Step into center (collision trigger, 1m radius)
4. **Transition:** 0.8s fade to black, teleport, 0.5s fade in at destination
5. **Cooldown:** 1s before next portal use

### Portal Network (12 Connections)

| Portal ID | From Zone | To Zone | Type | Notes |
|-----------|-----------|---------|------|-------|
| P01 | HUB | Z1 | Main | South gate, always visible |
| P02 | HUB | Z2 | Main | West gate, always visible |
| P03 | HUB | Z3 | Main | East gate, always visible |
| P04 | Z1 | Z2 | Shortcut | Hidden behind obelisk |
| P05 | Z1 | Z3 | Shortcut | Inside ruins alcove |
| P06 | Z2 | Z4 | Path | Elevated vine bridge entrance |
| P07 | Z3 | Z5 | Path | Cave exit to plateau |
| P08 | Z4 | Z5 | Tunnel | Underwater crystal tunnel |
| P09 | Z4 | Z6 | Path | Waterfall ascent |
| P10 | Z5 | Z7 | Path | Crystal path uphill |
| P11 | Z6 | Z7 | Bridge | Suspended vine bridge |
| P12 | Z7 | HUB | Express | Return-to-hub quick travel |

### Fast Travel System
Once a zone is visited, its portal appears in the HUB signpost. Player can quick-travel by interacting with the signpost and selecting destination (opens mini-map).

---

## 6. Navigation Design

### Path Types

| Path Type | Width | Material | Speed Modifier | Collision |
|-----------|-------|----------|----------------|-----------|
| Main Road | 3m | Stone/moss | 1.0x | None |
| Vine Bridge | 1.5m | Woven vines | 0.8x | Side rails |
| Crystal Path | 2m | Glowing crystal | 1.1x (boost) | None |
| Cave Tunnel | 2.5m | Stone/crystal | 0.9x | Walls |
| Stepping Stones | 1m per stone | Stone/water | 0.7x | Per stone |

### Robot Collision Constraints
- **Robot Capsule:** 0.4m radius, 1.5m height
- **Step Height:** Max 0.3m
- **Slope Limit:** 45 degrees
- **Water:** Cannot enter (bounces back)
- **Cliffs:** Invisible walls at edges
- **Zone Boundaries:** Soft fade + gentle push back

### Camera Behaviors Per Zone

| Zone | Camera Mode | Distance | Height Offset | Special |
|------|-------------|----------|---------------|---------|
| HUB | Follow | 8m | +3m | Wide FOV (75°) |
| Z1 | Follow | 6m | +2m | Slight dutch angle |
| Z2 | Follow | 7m | +2.5m | Playful shake on jump |
| Z3 | Follow | 5m | +1.5m | Closer in cave |
| Z4 | Follow | 8m | +4m | High angle for waterfall vista |
| Z5 | Follow | 7m | +3m | Dynamic FOV on beacon pulse |
| Z6 | Interior | 4m | +1m | Intimate, warm |
| Z7 | Follow | 6m | +2m | Centered framing |
| ANY | Inspect | Orbit 3-10m | Free | Right-click/two-finger drag |

---

## 7. Guided Tour Route

**Total Duration:** ~4 minutes (can skip any time)

### Tour Sequence

| Step | Zone | Duration | Camera Beat | Narration Hint |
|------|------|----------|-------------|----------------|
| 1 | HUB | 20s | Wide establishing shot → zoom to robot | "Welcome to TobaTech Jungle..." |
| 2 | Z1 | 30s | Follow robot, pause at obelisk | "Where code becomes reality..." |
| 3 | Z2 | 30s | Playful arc around Polygon Tree | "Games that captivate..." |
| 4 | Z3 | 30s | Descent into cavern, dramatic reveal | "Intelligence, automated..." |
| 5 | X | 10s | Transition through tunnel P08 | — |
| 6 | Z4 | 30s | Cinematic pan across waterfall | "Stories brought to life..." |
| 7 | Z5 | 25s | Ascend to beacon, wide view | "Signals that resonate..." |
| 8 | Z6 | 30s | Enter tree, intimate circling | "The heart of our team..." |
| 9 | Z7 | 25s | Final zone, center on Contact Crystal | "Let's connect..." |
| 10 | HUB | 20s | Return, compass highlight | "Explore freely." |

### Tour Controls
- **Skip:** Press ESC / tap Skip button
- **Pause:** Press Space / tap pause (camera holds)
- **Speed:** 2x button for fast tour

---

## 8. Integration Notes

### System Connections

```
┌─────────────────────────────────────────────────────────────────┐
│                        WORLD MAP                                │
└─────────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ZoneManager  │ │ Interaction  │ │  UIOverlay   │ │ AssetLoader  │
│              │ │   Manager    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### ZoneManager Integration

```typescript
// Zone loading triggers
ZoneManager.on('zone:enter', (zoneId: string) => {
  // Load zone-specific assets (LOD2+ details)
  AssetLoader.loadZonePack(zoneId);
  
  // Register zone interactables
  InteractionManager.registerZone(zoneId, ZONE_INTERACTABLES[zoneId]);
  
  // Update UI HUD
  UIOverlay.setCurrentZone(zoneId);
  
  // Apply zone camera settings
  CameraController.applyZoneSettings(ZONE_CAMERA_CONFIG[zoneId]);
});

ZoneManager.on('zone:exit', (zoneId: string) => {
  // Unload non-essential zone assets after delay
  setTimeout(() => AssetLoader.unloadZonePack(zoneId), 30000);
});
```

### InteractionManager Integration

```typescript
// Totem registration structure
interface InteractableConfig {
  id: string;
  zoneId: string;
  position: Vector3;
  triggerRadius: number;
  interactionType: 'press' | 'hover' | 'proximity';
  panelId: string;
  highlightColor: number;
}

// Raycast detection for interactions
InteractionManager.registerTotem({
  id: 'compiler-obelisk',
  zoneId: 'z1',
  position: new Vector3(0, 3, -40),
  triggerRadius: 2.5,
  interactionType: 'press',
  panelId: 'it-services-overview',
  highlightColor: 0x4A90D9
});
```

### UIOverlay Integration (Liquid Glass Panels)

```typescript
// Panel open trigger from interaction
UIOverlay.openPanel({
  id: 'it-services-overview',
  type: 'project-showcase',
  style: 'liquid-glass',
  position: 'center', // or 'right-slide'
  content: {
    title: 'IT Services',
    description: 'Full-stack development...',
    projects: PortfolioData.getByCategory('it-services'),
    tags: ['React', 'Node.js', 'AWS', 'TypeScript']
  },
  animation: {
    enter: 'scale-blur-in',
    exit: 'scale-blur-out',
    duration: 0.4
  }
});
```

### AssetLoader Strategy

| Load Phase | Assets | Trigger | Priority |
|------------|--------|---------|----------|
| Splash | Logo, loading bar | Immediate | Critical |
| Base World | HUB zone, terrain LOD0, robot | After splash | Critical |
| Nearby Zones | Adjacent zone LOD0 | HUB loaded | High |
| Full Zones | Zone LOD1-2, all interactables | Zone enter | Medium |
| VFX Packs | Particles, shaders | Zone enter | Low |
| Audio | Zone ambient, SFX | Zone enter | Low |

### Quality Tier Effects on World

| Setting | Ultra | High | Medium | Low |
|---------|-------|------|--------|-----|
| Fog Density | 0.015 | 0.02 | 0.025 | 0.03 |
| Bloom Intensity | 0.8 | 0.5 | 0.3 | 0 |
| Shadow Resolution | 2048 | 1024 | 512 | None |
| Particle Count | 100% | 75% | 50% | 25% |
| Firefly Count | 50 | 35 | 20 | 10 |
| Water Reflections | Planar | SSR | Fake | None |
| Grass Instances | 5000 | 3000 | 1500 | 500 |

---

## 9. Production Specifications

### Node Naming Conventions

```
Scene
├── World
│   ├── Terrain_LOD0
│   ├── Terrain_LOD1
│   ├── Terrain_LOD2
│   ├── Zone_HUB
│   │   ├── Landmark_CompassCrystal
│   │   ├── Prop_Signpost_Z1
│   │   ├── Prop_Signpost_Z2
│   │   ├── Interactable_TutorialStone
│   │   └── VFX_Fireflies
│   ├── Zone_Z1
│   │   ├── Landmark_CompilerObelisk
│   │   ├── Interactable_TerminalAlpha
│   │   └── ...
│   └── ...
├── Portals
│   ├── Portal_P01_HUB_Z1
│   └── ...
├── Paths
│   ├── Path_HUB_Z1_Main
│   └── ...
└── Lighting
    ├── Light_Sun_Main
    ├── Light_Ambient
    └── Light_Zone_Z1_Accent
```

### Coordinate Reference Points

| Reference | Position | Use |
|-----------|----------|-----|
| World Origin | (0, 0, 0) | HUB center |
| Spawn Point | (0, 0.5, 5) | Robot start |
| North Marker | (0, 0, 100) | Map orientation |
| Ground Plane | Y = 0 | Base elevation |
| Water Level | Y = -3 | Water surface |
| Sky Dome | Y = 80 | Sky sphere |

### Scale Reference

| Object | Real Scale | Game Scale | Notes |
|--------|------------|------------|-------|
| Robot | 1.5m tall | 1.5 units | Player character |
| Tree (small) | 4m | 4 units | Background foliage |
| Tree (large) | 15m | 15 units | Landmarks |
| Elder Tree | 25m | 25 units | Z6 centerpiece |
| Totem | 2m | 2 units | Interactive objects |
| Portal Arch | 3m | 3 units | Portal frames |
| Path Width | 3m | 3 units | Standard walkway |

### Test Checklist for Map Navigation

- [ ] Robot spawns correctly at (0, 0.5, 5)
- [ ] All 7 zones reachable by walking
- [ ] All 12 portals functional (bidirectional test)
- [ ] Zone boundaries prevent escape
- [ ] Collision prevents water entry
- [ ] All paths walkable without stuck points
- [ ] Camera transitions smooth between zones
- [ ] All interactables respond to E key
- [ ] HUD updates on zone change
- [ ] Guided tour completes without errors
- [ ] Fast travel unlocks after zone visit
- [ ] Mobile joystick reaches all areas
- [ ] Performance stable in each zone (>30 FPS mobile)
- [ ] Audio zones trigger correctly
- [ ] All totems open correct panels
