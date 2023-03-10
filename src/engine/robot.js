import * as THREE from "./utils/three.module";
import { GLTFLoader } from "./utils/GLTFLoader";

class Robot {
  constructor(engine) {
    this.engine = engine;
    setTimeout(() => {
      this.load();
      
    }, 3000);
  }

  load() {
    const loader = new GLTFLoader();
    loader.load("/public/RobotExpressive.glb", (gltf) => {
      // this.model = new THREE.Group();
      // gltf.scene.scale.set(0.3, 0.3, 0.3);
      // // gltf.scene.position.set(0, -1.8, 0);
      // gltf.scene.rotation.set(0, Math.PI, 0);
      // this.model.add(gltf.scene)
      // this.engine.scene.add(this.model);
    });
  }

  update() {
    if (this.model) {
      const _pot = this.engine.camera.position.clone();
      _pot.addScaledVector(this.engine.playerDirection, 2);
      this.model.position.copy(_pot);
    }
  }
}

export default Robot;
