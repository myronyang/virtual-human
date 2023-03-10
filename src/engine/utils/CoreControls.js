import {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
} from "./three.module.js";

class CoreControls extends EventDispatcher {
  constructor(object, domElement) {
    super();

    this.object = object;
    this.domElement = domElement;

    this.mouseDragOn = false;
    this.focusOutDistance = 5;
    this.moveSpeed = 500;

    this.spherical = new Spherical();

    function handleMousemove(event) {
      if (
        event.clientX >=
        this.domElement.clientWidth - this.focusOutDistance
      ) {
        this.mouseDragOn = false;
      }
      if (this.mouseDragOn) {
        this.object.rotation.y -= event.movementX / this.moveSpeed;
        this.object.rotation.x -= event.movementY / this.moveSpeed;
      }
    }

    function handleWheel() {
      // this.object.zoom =+ 0.01
      // this.object.updateProjectionMatrix();
      // this.update()
    }

    domElement.addEventListener("mousedown", () => {
      this.mouseDragOn = true;
    });
    domElement.addEventListener("mousemove", handleMousemove.bind(this));
    domElement.addEventListener("mouseleave", () => {
      this.mouseDragOn = false;
    });
    domElement.addEventListener("mouseup", () => {
      this.mouseDragOn = false;
    });
    domElement.addEventListener("wheel", handleWheel.bind(this));
  }

  update() {
    const offset = new Vector3();

    const quat = new Quaternion().setFromUnitVectors(
      this.object.up,
      new Vector3(0, 1, 0)
    );
    const position = this.object.position;

    offset.copy(position).sub(this.target);

    offset.applyQuaternion(quat);

    this.spherical.setFromVector3(offset);

    console.log(this.spherical);
  }
}

export { CoreControls };
