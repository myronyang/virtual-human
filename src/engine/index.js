import * as THREE from "./utils/three.module";
import Sence from "./sence";
import Robot from "./robot";

class Engine extends Sence {
  constructor(params) {
    super(params);

    this.keyStates = {};
    

    this.getlights();
    this.loadScene().then((gltf) => {
      this.scene.add(gltf.scene);
    });


	this.robot = new Robot(this)
    
  }

  
}

export default Engine;
