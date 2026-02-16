# 🎮 Portfolio 3JS

An interactive 3D portfolio built with Three.js, inspired by [Bruno Simon's portfolio](https://bruno-simon.com/). Navigate through an immersive 3D world to explore projects, skills, and experience.

![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- 🌍 Immersive 3D environment
- 🚗 Interactive vehicle controls (coming soon)
- 🎨 Custom 3D models and textures
- 📱 Responsive design
- ⚡ Fast loading with Vite
- 🔧 Modular architecture

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Anisid930/portfolio-3js.git
cd portfolio-3js

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview the build locally
```

## 📁 Project Structure

```
portfolio-3js/
├── public/                    # Static assets (served as-is)
│   ├── draco/                 # Draco decoder for compressed models
│   ├── models/                # 3D models (.glb, .gltf)
│   ├── textures/              # Textures and images
│   └── sounds/                # Audio files
├── src/
│   ├── Experience/            # Three.js experience
│   │   ├── Utils/             # Utility classes
│   │   │   ├── EventEmitter.js
│   │   │   ├── Resources.js   # Asset loader
│   │   │   ├── Sizes.js       # Viewport handling
│   │   │   └── Time.js        # Animation loop
│   │   ├── World/             # 3D world components
│   │   │   ├── Environment.js # Lighting setup
│   │   │   ├── Floor.js       # Ground plane
│   │   │   └── World.js       # World manager
│   │   ├── Camera.js          # Camera & controls
│   │   ├── Experience.js      # Main experience class
│   │   ├── Renderer.js        # WebGL renderer
│   │   └── sources.js         # Asset definitions
│   ├── styles/
│   │   └── main.css           # Global styles
│   └── main.js                # Entry point
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
└── package.json
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Turn left |
| `D` / `→` | Turn right |
| Mouse | Look around |

## 🛠️ Development

### Adding 3D Models

1. Place your `.glb` or `.gltf` files in `public/models/`
2. Register them in `src/Experience/sources.js`:

```javascript
export const sources = [
  {
    name: 'myModel',
    type: 'gltfModel',
    path: 'models/my-model.glb'
  }
]
```

3. Access in your World components via `this.resources.items.myModel`

### Adding Textures

1. Place textures in `public/textures/`
2. Register in `sources.js` with type `'texture'`

## 🎨 Customization

- **Colors**: Modify `src/styles/main.css` and material settings
- **Lighting**: Adjust `src/Experience/World/Environment.js`
- **Camera**: Configure `src/Experience/Camera.js`

## 📦 Dependencies

- [Three.js](https://threejs.org/) - 3D library
- [Vite](https://vitejs.dev/) - Build tool

## 🚧 Roadmap

- [ ] Vehicle physics with Cannon.js/Rapier
- [ ] Interactive project showcases
- [ ] Custom 3D models
- [ ] Particle effects
- [ ] Sound effects
- [ ] Mobile touch controls
- [ ] Performance optimizations

## 📄 License

MIT License - feel free to use for your own portfolio!

## 🙏 Acknowledgments

- [Bruno Simon](https://bruno-simon.com/) - Inspiration
- [Three.js Journey](https://threejs-journey.com/) - Learning resource
