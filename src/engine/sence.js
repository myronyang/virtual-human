import * as THREE from "./utils/three.module";
import { CoreControls } from "./utils/CoreControls";
import { GLTFLoader } from "./utils/GLTFLoader";
import { Octree } from "./utils/Octree";
import { Capsule } from "./utils/Capsule";

const STEPS_PER_FRAME = 5;
const GRAVITY = 30;

class Scene {
  constructor({ container }) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.rotation.order = "YXZ";

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new CoreControls(this.camera, this.renderer.domElement);

    this.worldOctree = new Octree();

    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.playerOnFloor = false;
    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 1, 0),
      0.35
    );

    document.addEventListener("keydown", (event) => {
      this.keyStates[event.code] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.keyStates[event.code] = false;
    });

    this.animate();
  }

  loadScene() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load("/public/collision-world.glb", (gltf) => {
        this.worldOctree.fromGraphNode(gltf.scene);
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material.map) {
              child.material.map.anisotropy = 8;
            }
          }
        });
        resolve(gltf);
      });
    });
  }

  animate() {
    const deltaTime = Math.min(0.05, this.clock.getDelta()) / STEPS_PER_FRAME;
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      this.keyControls(deltaTime);
      this.updatePlayer(deltaTime);
    }
    if (this.robot) {
        this.robot.update(deltaTime)
    }

    // this.robot.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  updatePlayer(deltaTime) {
    if (this.playerOnFloor) {
      const damping = Math.exp(-3 * deltaTime) - 1;
      this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    } else {
      this.playerVelocity.y -= GRAVITY * deltaTime;
    }

    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(deltaPosition);

    this.playerCollitions();

    this.camera.position.copy(this.playerCollider.end);
  }

  playerCollitions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    this.playerOnFloor = false;

    if (result) {
      this.playerOnFloor = result.normal.y > 0;

      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.playerVelocity)
        );
      }

      this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  keyControls(deltaTime) {
    const speed = 25;
    const directionVector = this.getDirectionVector();

    if (this.playerOnFloor) {
      if (this.keyStates["KeyW"]) {
        this.playerVelocity.add(
          directionVector.forward().multiplyScalar(speed * deltaTime)
        );
      }
      if (this.keyStates["KeyS"]) {
        this.playerVelocity.add(
          directionVector.forward().multiplyScalar(-speed * deltaTime)
        );
      }
      if (this.keyStates["KeyA"]) {
        this.playerVelocity.add(
          directionVector.side().multiplyScalar(-speed * deltaTime)
        );
      }
      if (this.keyStates["KeyD"]) {
        this.playerVelocity.add(
          directionVector.side().multiplyScalar(speed * deltaTime)
        );
      }
      if (this.keyStates["Space"]) {
        this.playerVelocity.y = 15;
      }
    }
  }

  getDirectionVector() {
    this.camera.getWorldDirection(this.playerDirection);
    return {
      forward: () => {
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        return this.playerDirection;
      },
      side: () => {
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross(this.camera.up);
        return this.playerDirection;
      },
    };
  }

  getlights() {
    const ambientlight = new THREE.AmbientLight(0x6688cc);
    this.scene.add(ambientlight);

    const fillLight1 = new THREE.DirectionalLight(0xff9999, 0.5);
    fillLight1.position.set(-1, 1, 2);
    this.scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0x8888ff, 0.2);
    fillLight2.position.set(0, -1, 0);
    this.scene.add(fillLight2);
  }
}

export default Scene;
