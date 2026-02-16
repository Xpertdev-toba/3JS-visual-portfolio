# TobaTech Jungle — Visual World Map

> **Interactive 3D Portfolio World** | Low-poly mystical jungle with bioluminescent flora, ancient tech ruins, and a friendly robot explorer.

---

## 🗺️ World Map

Open the full interactive world map:

👉 **[world-map.html](world-map.html)** — Open in any browser for the complete rendered map

---

## 🌍 World Layout Overview

The TobaTech Jungle world is organized in a **hub-and-spoke design** with the Central Nexus at the heart. Eight themed zones surround it, connected by walkable paths, vine bridges, crystal trails, and portal fast-travel.

```
              ┌─ Z6: Origin Tree (About) ─── Bridge ─── Z7: Echo Chamber (Contact) ─┐
              │           ↑                                        ↑                  │
              │      Vine Path                              Crystal Path              │
              │           │                                        │                  │
              │   Z4: Lumina Falls (Media)              Z5: Beacon Spire (Marketing)  │
              │           ↑                                        ↑                  │
              │        NW Path                                NE Path                 │
              │           │                                        │                  │
              │   Z2: Pixel Grove ←──── THE NEXUS (HUB) ────→ Z3: Neural Cavern     │
              │      (Game Dev)         Central Hub              (AI Automation)       │
              │                              │                                        │
              │                          South Road                                   │
              │                              │                                        │
              │                    Z1: CodeForge Ruins                                │
              │                       (IT Services)                                   │
              │                              │                                        │
              └──────────────────── SPAWN POINT ──────────────────────────────────────┘
```

---

## 🎯 Zone Directory

| Zone | Name | Service | Color | Position | Landmark |
|------|------|---------|-------|----------|----------|
| **HUB** | The Nexus Clearing | Central Hub | 🟡 Gold | `(0, 0, 0)` | Floating Compass Crystal |
| **Z1** | CodeForge Ruins | IT Services | 🔵 Blue | `(0, 0, -18)` | Compiler Obelisk |
| **Z2** | Pixel Grove | Game Development | 🟣 Purple | `(-18, 0, 0)` | Polygon Tree |
| **Z3** | Neural Cavern | AI Automation | 🔴 Pink | `(18, 0, 0)` | Brain Core Crystal |
| **Z4** | Lumina Falls | Media Production | 🟠 Orange | `(-15, 0, 18)` | Bioluminescent Waterfall |
| **Z5** | Beacon Spire | Digital Marketing | 🟢 Green | `(15, 0, 18)` | Signal Tower |
| **Z6** | Origin Tree | About / Team | 🟤 Amber | `(-10, 0, 30)` | Giant Ancient Tree |
| **Z7** | Echo Chamber | Contact | 🔷 Cyan | `(10, 0, 30)` | Crystal Resonance Cave |

---

## 🚪 Portal Network

Portals provide instant fast-travel between the HUB and each zone.

| Portal | From → To | Color |
|--------|-----------|-------|
| **P1** | HUB → CodeForge Ruins (Z1) | 🔵 Blue |
| **P2** | HUB → Pixel Grove (Z2) | 🟣 Purple |
| **P3** | HUB → Neural Cavern (Z3) | 🔴 Pink |
| **P4** | HUB → Lumina Falls (Z4) | 🟠 Orange |
| **P5** | HUB → Beacon Spire (Z5) | 🟢 Green |

---

## 🛤️ Path Types

| Path Type | Description | Visual |
|-----------|-------------|--------|
| **Main Road** | Wide stone paths between major zones | Brown dashed, 8-unit wide |
| **Vine Path** | Organic jungle trails heading northwest | Green dashed, 4-unit wide |
| **Crystal Path** | Glowing mineral trails heading northeast | Cyan dashed, 4-unit wide |
| **Bridge** | Suspended crossing between Z6 ↔ Z7 | Wood planks with rope supports |

---

## 🎮 Player Journey

### Spawn → First Steps
1. Player spawns at `(0, 2, 5)` — south of Z1
2. Walk north along the main road to reach CodeForge Ruins
3. Continue north to discover the Central Nexus Hub
4. From the Hub, explore any direction:
   - **West** → Pixel Grove (Game Dev)
   - **East** → Neural Cavern (AI)
   - **Northwest** → Lumina Falls (Media)
   - **Northeast** → Beacon Spire (Marketing)

### Exploration Flow
```
SPAWN
  ↓
Z1: CodeForge Ruins ──→ Discover IT projects at terminal holograms
  ↓
HUB: The Nexus ──→ Central compass shows unvisited zones
  ├──→ Z2: Pixel Grove ──→ Arcade cabinets with game demos
  ├──→ Z3: Neural Cavern ──→ Brain Core shows AI projects
  ├──→ Z4: Lumina Falls ──→ Waterfall cinema for media work
  ├──→ Z5: Beacon Spire ──→ Signal tower with marketing cases
  ├──→ Z6: Origin Tree ──→ Team info and company story
  └──→ Z7: Echo Chamber ──→ Contact form in crystal cave
```

---

## 🌅 Time of Day Presets

The world supports 6 atmospheric presets:

| Preset | Sun Color | Mood | Best For |
|--------|-----------|------|----------|
| 🌅 Dawn | Warm rose | Mystical, fresh | First impressions |
| ☀️ Morning | Bright warm | Energetic, clear | Portfolio browsing |
| 🌞 Noon | White-bright | Professional | Default viewing |
| 🌇 Afternoon | Golden warm | Relaxed, warm | Extended exploration |
| 🌆 Dusk | Deep orange | Dramatic, moody | Screenshots |
| 🌙 Night | Cool blue | Mysterious | Bioluminescence showcase |

---

## 📐 Technical Coordinates

**World Scale:** 1 unit = 1 meter  
**Playable Area:** ~80m × 80m (auto-scaled from GLB)  
**Ground Plane:** y = 0  
**Player Spawn:** `(0, 2, 5)`  
**Camera Range:** 3m – 200m (F key for bird's-eye)  
**Physics:** cannon-es with bounding-box colliders from GLB meshes

### Zone Grid Coordinates (3D World Space)
```
Y (up)
│
│    Z6(-10,0,30) ────── Z7(10,0,30)
│         \                  /
│    Z4(-15,0,18)    Z5(15,0,18)
│           \          /
│    Z2(-18,0,0)  HUB(0,0,0)  Z3(18,0,0)
│                  │
│            Z1(0,0,-18)
│                  │
│            SPAWN(0,2,5)    ──── X (east)
│
Z (north) ────────→
```

---

## 🏗️ Environment Modes

| Mode | Description | Toggle |
|------|-------------|--------|
| **Test** | Block-based world with ramps, stairs, platforms | Default on startup |
| **Forest** | GLB forest model with zone markers & portals | Toggle via HUD button |

Switch between modes using the 🌳/🧪 toggle button in the top-center HUD bar.

---

## 🎮 Level Design Document

> **For Game Designers & 3D Artists** — Complete level design breakdown with pacing, metrics, sight lines, player guidance, and encounter flow.

---

### 1. Design Pillars

| Pillar | Description | Implementation |
|--------|-------------|----------------|
| **Discovery** | Reward curiosity — every direction has something to find | Zones visible from HUB, landmarks as "weenies" |
| **Flow** | Never let the player feel lost or stuck | Paths glow faintly, portals pulse, zone markers always visible |
| **Delight** | Micro-moments of wonder at every turn | Fireflies, particle effects, ambient sounds, easter eggs |
| **Showcase** | Every interaction leads to portfolio content | Interactables mapped 1:1 to project panels |

---

### 2. Player Pacing & Beat Chart

The world is designed around **90-second zone encounters** with transition beats between them.

```
TIME (seconds)    INTENSITY / ENGAGEMENT
  │
  │    ★ SPAWN                    ★ HUB WOW          ★ FIRST ZONE
  │    ↗                          ↗    ↘              ↗        ↘
5 │  ↗                          ↗      ↘            ↗          ↘
  │ ↗     (walk)              ↗ (look    ↘         ↗ (explore    ↘
4 │↗                         ↗  around)   ↘       ↗  interact)   ↘
  │        ↘               ↗              ↘     ↗                ↘
3 │         ↘             ↗                ↘   ↗    PORTAL         ↘
  │          ↘    Z1     ↗                  ↘ ↗    TRANSITION       ↘
2 │           ↘  tease  ↗                    ×                       ↘
  │            ↘      ↗                                               → NEXT
1 │             ↘   ↗
  │              ↘↗
  └──────────────────────────────────────────────────────────────────────→
  0s    15s    30s    45s    60s    75s    90s   105s   120s   150s
       ORIENT  WALK   ARRIVE  EXPLORE   INTERACT  TRANSITION  REPEAT
```

**Beat Breakdown:**

| Beat | Time | Player State | Design Intent |
|------|------|-------------|---------------|
| **Spawn** | 0–5s | Orienting, looking around | First impression — skybox, lighting, ground texture |
| **First Steps** | 5–15s | Learning controls | Tutorial stone nearby, flat ground, no threats |
| **Z1 Approach** | 15–30s | Walking north, seeing Z1 | Obelisk visible as magnet ("weenie"), path guides feet |
| **Z1 Arrival** | 30–45s | Entering CodeForge zone | Zone name toast, color change, ambient shift |
| **HUB Discovery** | 45–60s | Reaching central hub | Panoramic reveal — compass crystal, 5 paths visible |
| **Choice Moment** | 60–75s | Deciding which zone | All zone landmarks visible from HUB (sight lines clear) |
| **Zone Exploration** | 75–150s | In first chosen zone | Interact with 3-6 objects, read portfolio content |
| **Portal Use** | 150–160s | Using fast travel back | Smooth transition, return to HUB for next choice |

---

### 3. Sight Lines & Weenies

"Weenies" (Disney Imagineering term) are tall, visible landmarks that draw players toward zones.

```
                    BIRD'S-EYE SIGHT LINE MAP
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │     🌳 Origin Tree (12m)              🔷 Echo Crystal (8m)  │
    │       ↖ visible from Z4                ↗ visible from Z5    │
    │                                                             │
    │                                                             │
    │  💧 Lumina Falls (10m)            📡 Beacon Spire (12m)     │
    │    ↖ visible from HUB NW           ↗ visible from HUB NE   │
    │                                                             │
    │                                                             │
    │  🎮 Polygon Tree (10m)     💎      🧠 Brain Core (6m)      │
    │    ← visible from HUB W    HUB     → visible from HUB E    │
    │                          COMPASS                            │
    │                          (3m, glows)                        │
    │                             │                               │
    │                             │ clear line of sight           │
    │                             ↓                               │
    │                    🏛️ Compiler Obelisk (6m)                 │
    │                        ↓ visible from SPAWN                 │
    │                                                             │
    │                    🤖 SPAWN                                 │
    └─────────────────────────────────────────────────────────────┘

    RULE: Every zone landmark must be visible from at least ONE
    adjacent zone or the HUB. No blind navigation.
```

**Landmark Height Guide:**

| Landmark | Height | Visible From | Purpose |
|----------|--------|-------------|---------|
| Compass Crystal (HUB) | 3m + glow | Everywhere | North star — always find home |
| Compiler Obelisk (Z1) | 6m | Spawn, HUB | First "pull" target from spawn |
| Polygon Tree (Z2) | 10m | HUB, Z4 | Colorful, spinning cube leaves visible at distance |
| Brain Core (Z3) | 6m + pulse | HUB, Z5 | Pulsing glow catches peripheral vision |
| Lumina Falls (Z4) | 10m (waterfall) | HUB, Z2, Z6 | Moving water = strong visual magnet |
| Beacon Spire (Z5) | 12m | HUB, Z3, Z7 | Tallest spire, rotating light beam |
| Origin Tree (Z6) | 12m (canopy) | Z4, bridge | Massive canopy silhouette |
| Echo Crystal (Z7) | 8m | Z5, bridge | Expanding ring VFX visible from afar |

---

### 4. Zone Layout Metrics

```
ZONE SPACING & TRAVEL TIMES (at player speed = 15 units/s)

    Z6 ←─── 20m ───→ Z7          Travel: ~1.3s (bridge)
     ↑                 ↑
    12m               12m         Travel: ~0.8s each
     ↑                 ↑
    Z4 ←─── 40m ───→ Z5          Travel: ~2.7s (if direct path existed)
     ↑ \             / ↑
    18m  \    HUB   /  18m        Travel: ~1.2s each from HUB
     ↑    ↘   ↕   ↙    ↑
     ↑     18m ↕ 18m    ↑
    Z2 ←── 36m ──→ Z3              Travel: ~2.4s (through HUB)
                ↕
               18m                Travel: ~1.2s
                ↕
               Z1
                ↕
               23m                Travel: ~1.5s
                ↕
             SPAWN
```

**Critical Distances:**

| Metric | Value | Design Reason |
|--------|-------|---------------|
| Spawn → Z1 | 23m | ~1.5s walk — short intro, builds anticipation |
| Z1 → HUB | 18m | ~1.2s — quick reward after first zone |
| HUB → any adjacent zone | 18m | ~1.2s — consistent, fair for all directions |
| Zone radius | 5–8m | 10–15 seconds to fully explore perimeter |
| Interactable spacing (within zone) | 3–5m | Player encounters one every ~0.3s of walking |
| Portal activation range | 2.5m | Must be intentional, not accidental |
| Zone marker visibility | 50m+ | Landmarks always visible at max camera zoom |

---

### 5. Difficulty & Complexity Curve

This is a portfolio site, not a combat game — "difficulty" = navigational complexity and content density.

```
COMPLEXITY CURVE (zone order by discovery likelihood)

    COMPLEX │                                    Z6 ● Z7 ●
            │                              Z4 ●          
            │                        Z5 ●                
            │                  Z3 ●                      
            │            Z2 ●                            
            │      Z1 ●                                 
    SIMPLE  │  HUB ●                                     
            └───────────────────────────────────────────→
              1st      2nd      3rd      4th     5th+
                        DISCOVERY ORDER

    ● = content density increases with exploration depth
```

| Discovery Tier | Zones | Interactables | Content Depth | Player State |
|---------------|-------|---------------|---------------|-------------|
| **Tier 0 — Arrival** | HUB | 4 (compass, signs, tutorial, chest) | Overview only | Learning, orienting |
| **Tier 1 — Adjacent** | Z1, Z2, Z3 | 5-6 each | Full project panels | Confident, exploring |
| **Tier 2 — Intermediate** | Z4, Z5 | 6 each | Detailed showcases + media | Invested, seeking |
| **Tier 3 — Deep** | Z6, Z7 | 4-5 each | Personal + contact CTA | Engaged, ready to connect |

**Gating Strategy:** No hard gates. Soft guidance only:
- Z6/Z7 placed farthest → naturally discovered last → contact form after seeing work
- Bridge between Z6↔Z7 creates a "journey's end" feeling
- HUB compass crystal highlights unvisited zones (unvisited = brighter glow)

---

### 6. Encounter Design (Per Zone)

Each zone follows the **Arrive → Orient → Discover → Interact → Exit** loop:

```
    ┌─────────────────────────────────────────────────────────┐
    │                    ZONE ENCOUNTER LOOP                   │
    │                                                         │
    │   ┌──────────┐    ┌──────────┐    ┌──────────┐          │
    │   │  ARRIVE  │───→│  ORIENT  │───→│ DISCOVER │          │
    │   │          │    │          │    │          │          │
    │   │ • Zone   │    │ • See    │    │ • Walk   │          │
    │   │   toast  │    │   main   │    │   around │          │
    │   │ • Color  │    │   land-  │    │ • Find   │          │
    │   │   shift  │    │   mark   │    │   inter- │          │
    │   │ • Ambient│    │ • Hear   │    │   actables│         │
    │   │   change │    │   zone   │    │ • Collect │          │
    │   └──────────┘    │   audio  │    │   easter │          │
    │                   └──────────┘    │   eggs   │          │
    │                                   └─────┬────┘          │
    │                                         │               │
    │                                         ▼               │
    │                   ┌──────────┐    ┌──────────┐          │
    │                   │   EXIT   │←───│ INTERACT │          │
    │                   │          │    │          │          │
    │                   │ • Portal │    │ • Press E│          │
    │                   │   glow   │    │ • Read   │          │
    │                   │ • Path   │    │   panel  │          │
    │                   │   back   │    │ • Browse │          │
    │                   │ • Compass│    │   projects│         │
    │                   │   pull   │    │ • Close  │          │
    │                   └──────────┘    └──────────┘          │
    └─────────────────────────────────────────────────────────┘
```

**Zone Encounter Cards:**

#### Z1: CodeForge Ruins — IT Services
```
┌─────────────────────────────────────────────────┐
│ ZONE: CodeForge Ruins          TIER: 1          │
│ ROLE: First content zone       TIME: 60-90s     │
├─────────────────────────────────────────────────┤
│ ARRIVE CUE:    Blue fog, hologram flicker sound │
│ ORIENT WEENIE: Compiler Obelisk (6m, center)    │
│ PATROL PATH:   Circle around obelisk → terminals│
│                                                 │
│ INTERACTABLES:                                  │
│  [1] Compiler Obelisk ··· IT overview panel     │
│  [2] Terminal Alpha ······ Web dev projects     │
│  [3] Terminal Beta ······· Mobile app projects  │
│  [4] Terminal Gamma ······ Backend/cloud        │
│  [5] Debug Crystal ······· Fun fact collectible │
│  [6] Keyboard Relic ······ Easter egg           │
│                                                 │
│ EXIT PULLS:                                     │
│  • HUB compass glow visible to north            │
│  • Portal P01 at zone edge                      │
│  • Shortcut portals P04→Z2, P05→Z3              │
└─────────────────────────────────────────────────┘
```

#### Z2: Pixel Grove — Game Development
```
┌─────────────────────────────────────────────────┐
│ ZONE: Pixel Grove              TIER: 1          │
│ ROLE: Creative showcase        TIME: 60-90s     │
├─────────────────────────────────────────────────┤
│ ARRIVE CUE:    Rainbow mist, retro chiptune     │
│ ORIENT WEENIE: Polygon Tree (10m, spinning)     │
│ PATROL PATH:   Tree → arcades → trophy → pipe   │
│                                                 │
│ INTERACTABLES:                                  │
│  [1] Polygon Tree ······ Game dev overview      │
│  [2] Arcade Cabinet 1 ·· Unity games showcase   │
│  [3] Arcade Cabinet 2 ·· Unreal games showcase  │
│  [4] Game Cartridge ···· Mobile games           │
│  [5] Trophy Pedestal ··· Awards / achievements  │
│  [6] Hidden Pipe ······· Classic game easter egg│
│                                                 │
│ EXIT PULLS:                                     │
│  • Lumina Falls waterfall sound from NW         │
│  • Portal P06 → Z4 via vine bridge              │
│  • HUB compass glow to east                     │
└─────────────────────────────────────────────────┘
```

#### Z3: Neural Cavern — AI Automation
```
┌─────────────────────────────────────────────────┐
│ ZONE: Neural Cavern            TIER: 1          │
│ ROLE: Tech-forward impression  TIME: 60-90s     │
├─────────────────────────────────────────────────┤
│ ARRIVE CUE:    Purple fog, synapse pulse sound  │
│ ORIENT WEENIE: Brain Core crystal (6m, pulsing) │
│ PATROL PATH:   Core → data streams → nodes      │
│                                                 │
│ INTERACTABLES:                                  │
│  [1] Brain Core ········ AI overview panel      │
│  [2] Data Stream 1 ···· ML/AI projects          │
│  [3] Data Stream 2 ···· Automation workflows    │
│  [4] Neural Node ······· Chatbot/NLP projects   │
│  [5] Training Pod ····· Computer vision work    │
│                                                 │
│ EXIT PULLS:                                     │
│  • Beacon Spire light beam visible through cave │
│  • Portal P07 → Z5 via cave exit                │
│  • HUB compass glow to west                     │
└─────────────────────────────────────────────────┘
```

---

### 7. Player Guidance System

How the world silently tells the player where to go:

| Technique | Implementation | Psychological Effect |
|-----------|---------------|---------------------|
| **Light Breadcrumbs** | Glowing orbs along paths fade on/off in sequence toward next zone | Eyes follow movement → feet follow eyes |
| **Audio Gradient** | Zone ambient audio fades in as player approaches | Subconscious "something ahead" pull |
| **Color Temperature** | Paths subtly shift hue toward destination zone color | Emotional expectation building |
| **Landmark Height** | Taller landmarks = further zones (12m for Z5/Z6 vs 3m for HUB) | Taller = more important = must reach |
| **Compass Crystal** | Glow intensifies toward unvisited zones | FOMO / completionist motivation |
| **Portal Activation** | Portals pulse faster when player is within 10m | "Almost there" encouragement |
| **Camera Nudge** | Camera offset slightly biases toward nearest unvisited zone | Subtle directional suggestion |
| **Ground Texture** | Path material changes near zone entries (stone → zone-colored) | Transition awareness |

---

### 8. Elevation Design

```
SIDE-VIEW ELEVATION PROFILE (West → East cross-section at Z-midpoint)

    Height (m)
    14 │                                              ·  Beacon
    12 │  Origin                                     ╱ ╲ Spire
    10 │  Tree ·                                    ╱   ╲
     8 │  · · ╱╲             Lumina              ╱     ╲
     6 │     ╱  ╲            Falls ·           ╱       ╲
     4 │    ╱    ╲          ╱╲    ╲          ╱  HUB     ╲
     2 │   ╱ Z6   ╲       ╱  ╲ Z4 ╲    Z2 ╱  ┌───┐ Z3  ╲  Z5
     0 │──╱────────╲─────╱────╲────╲───╱──┤   ├───╲────╲─────
    -2 │            ╲   ╱      ╲    ╲ ╱   │Z1 │    ╲    ╲
    -4 │             ╲─╱        ╲    X    └───┘     ╲    ╲
    -5 │              cave       ╲                   cave
       └──────────────────────────────────────────────────────→
       -50m   -30m   -15m    0m    15m    30m    50m
                         X position

    KEY ELEVATIONS:
    Z1 (CodeForge): -2m (sunken ruins, atmospheric)
    Z2 (Pixel Grove): +3m (gentle hill, playful)
    Z3 (Neural Cavern): -5m (deep cave, mysterious)
    Z4 (Lumina Falls): +8m (waterfall cliff, dramatic)
    Z5 (Beacon Spire): +5m (elevated plateau, commanding)
    Z6 (Origin Tree): +12m (highest point, achievement)
    Z7 (Echo Chamber): +10m (near peak, intimate)
    HUB: 0m (ground level, accessible)
```

---

### 9. Zone Flow Diagram

```
                    PLAYER DECISION TREE

                        ┌──────────┐
                        │  SPAWN   │
                        └────┬─────┘
                             │
                        ┌────▼─────┐
                        │   Z1     │ ← First encounter (linear)
                        │CodeForge │
                        └────┬─────┘
                             │
                        ┌────▼─────┐
                        │   HUB    │ ← CHOICE POINT (5 directions)
                        │  Nexus   │
                        └──┬─┬─┬───┘
                     ┌─────┘ │ └─────┐
                     │       │       │
                ┌────▼──┐ ┌──▼──┐ ┌──▼────┐
                │  Z2   │ │ Z4  │ │  Z3   │
                │Pixel  │ │Falls│ │Neural │
                │Grove  │ │     │ │Cavern │
                └───┬───┘ └──┬──┘ └───┬───┘
                    │        │        │
                    │   ┌────▼──┐     │
                    │   │  Z5   │     │
                    │   │Beacon │     │
                    │   └───┬───┘     │
                    │       │         │
               ┌────▼──┐    │    ┌────▼──┐
               │  Z6   │←───┼───→│  Z7   │
               │Origin │  bridge │ Echo  │
               │ Tree  │←───────→│Chamber│
               └───────┘         └───────┘
                                      │
                              ┌───────▼───────┐
                              │  CONTACT CTA  │
                              │  (end goal)   │
                              └───────────────┘

    OPTIMAL FUNNEL: Spawn → Z1 → HUB → [explore] → Z6 → Z7 → CONTACT
    Average session: 4-8 minutes to reach contact form
```

---

### 10. Interactable Placement Rules

| Rule | Specification | Reason |
|------|--------------|--------|
| **Main Totem** | Center of zone, tallest object | First thing player sees on entry |
| **Secondary Objects** | Arranged in semicircle or ring, 3-5m from center | Natural patrol path |
| **Collectibles** | Slightly off main path, 1-2m tucked behind props | Reward exploration |
| **Easter Eggs** | Hidden behind landmarks, inside geometry, or requires jump | Delight completionists |
| **Portal Exit** | Edge of zone, facing next zone direction | Clear "where next" signal |
| **Min Spacing** | 2m between interactables | Prevent accidental multi-trigger |
| **Max Cluster** | 3 objects within 5m radius | Prevent choice paralysis |

**Interactable Visual Hierarchy:**

```
    ┌──────────────────────────────────────────────┐
    │              VISUAL PRIORITY                  │
    │                                              │
    │   🔺 MAIN TOTEM (tallest, glowing, animated) │
    │   ███████████████████████████████████████     │
    │                                              │
    │   🔹 INTERACTIVE (medium, hover highlight)   │
    │   ████████████████████████████                │
    │                                              │
    │   🔸 COLLECTIBLE (small, subtle pulse)       │
    │   █████████████████                          │
    │                                              │
    │   🔻 EASTER EGG (tiny, no pulse, hidden)     │
    │   ████████                                   │
    └──────────────────────────────────────────────┘
```

---

### 11. Camera Level Design

| Scenario | Camera Behavior | Purpose |
|----------|----------------|---------|
| **Spawn** | Starts behind player, facing north | Orient toward first zone |
| **Walking path** | Standard follow, 12m back, 5m up | Comfortable exploration view |
| **Entering zone** | Subtle dolly-in by 2m | "Focus" on new content |
| **Near interactable** | Slight orbit toward object | Draw attention to trigger |
| **Panel open** | Camera holds, slight blur depth on world | Focus user on content |
| **Portal transit** | Quick zoom to portal → fade → reset at destination | Cinematic travel feel |
| **F-key overview** | Bird's-eye, 120m up, near top-down | See whole world layout |
| **Idle 15s** | Slow orbit around player | "Screensaver" mode, shows world beauty |

---

### 12. Testing Checklist for Level Design

**Navigation Tests:**
- [ ] Player can reach every zone from HUB without getting stuck
- [ ] No "dead pockets" where player gets trapped in geometry
- [ ] All paths walkable without jumping (accessible)
- [ ] Camera doesn't clip through zone geometry
- [ ] Landmark of next zone visible before arriving at current zone
- [ ] Zone transition feels smooth (no jarring color/audio pops)

**Pacing Tests:**
- [ ] Spawn → Z1 takes 1-2 seconds (fast enough to not bore)
- [ ] Z1 → HUB discovery feels like a reward
- [ ] HUB choice moment gives player 3+ visible options
- [ ] Each zone explorable in 60-90 seconds
- [ ] Full world tour completable in 4-8 minutes
- [ ] Contact zone (Z7) naturally discovered in second half of visit

**Engagement Tests:**
- [ ] Each zone has at least one "wow" moment (VFX, reveal, surprise)
- [ ] Interactable spacing prevents "desert" stretches (>5s no content)
- [ ] Easter eggs reward exploring off main path
- [ ] Return to HUB doesn't feel like backtracking (compass updates)
- [ ] Second visit still has undiscovered content

**Performance Tests:**
- [ ] Max 2 zones fully rendered at any time (LOD system)
- [ ] Particle systems capped per zone (50 fireflies, 30 code streams)
- [ ] Portal transitions < 0.8s (no long loads)
- [ ] Stable 30+ FPS on mobile, 60+ FPS on desktop

---

*TobaTech Jungle World Map v1.0 — Designed for the interactive 3D portfolio experience*
