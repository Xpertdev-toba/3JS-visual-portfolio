import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Experience } from './Experience.js'
import { ThirdPersonCamera } from './Utils/ThirdPersonCamera.js'

export class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
    this.setThirdPerson()
    // OrbitControls disabled by default - third person is active
    // this.setControls()
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      5000
    )
    this.instance.position.set(0, 30, 60)
    this.instance.lookAt(0, 0, 0)
    this.scene.add(this.instance)
  }

  setThirdPerson() {
    this.thirdPerson = new ThirdPersonCamera(this.instance, this.canvas, {
      distance: 30,
      height: 15,
      smoothing: 0.08,
      minPolarAngle: -0.3,
      maxPolarAngle: 1.4,
      minDistance: 8,
      maxDistance: 800
    })
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 5
    this.controls.maxDistance = 60
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05
    this.controls.target.set(0, 0, 0)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
    this.thirdPerson?.resize()
  }

  update() {
    // Third person camera is updated from Experience.js
    // this.controls?.update()
  }

  destroy() {
    this.thirdPerson?.destroy()
    this.controls?.dispose()
  }
}
