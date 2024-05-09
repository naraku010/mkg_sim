import switch_model from "../../assets/models/switch.glb";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import KeyUtil from "../../util/keyboard";
import ColorUtil from "../../util/color";
import store from "../../store/store";
import {initial_settings} from "../../store/startup";
import {updateActiveMaterials, updateMaterials,} from "./materials";

export const SWITCHSTATE = {
  INITIAL: 0, // full height
  PRESSED: 1, // bottomed out
  MOVING_UP: 2, // resetting after press
  MOVING_DOWN: 3, // being pressed down
};
const loader = new GLTFLoader();
let SWITCH_MODEL = "";
loader.load(switch_model, function ( gltf ) {
  const d = gltf.scene;
  d.scale.set(.5,.5,.5);
  SWITCH_MODEL = d;
});

// A single key, all size and position values are in std key units unless otherwise specified
export class Switch {
  constructor(options) {
    let currentState = store.getState();
    this.options = options || {};
    this.code = this.options.code;
    this.state = SWITCHSTATE.INITIAL;
    this.colorway = ColorUtil.colorway;
    this.previousState = SWITCHSTATE.INITIAL;
    this.is_iso_enter = this.code === "KC_ENT" && this.options.isIso;
    this.direction = -1; // is key moving up or down
    this.gutter = 0.05; // space inbetween keys (this is subtracted from the key width not added after the key)
    this.start_y = -0.3; // initial y position and reset after releasing key
    this.dist_pressed = 0.25; // max vertical distance the key can be pressed down
    this.press_velocity = 0.1; // speed of press, smaller = smoother slower motion
    this.testing = initial_settings.settings.testing || false;
    this.setup();
  }

  setup() {
    this.geometryOptions = {
      row: this.row,
      w: this.w,
      h: this.h,
      x: 1,
      y: 1,
      angle: this.angle
    };
    this.cap = SWITCH_MODEL.clone();
    this.cap.name = this.options.code;
    KeyUtil.setKeyLayers(this.options.code, this.cap);
    if(this.cap.rotation._y === 0 && Math.abs(this.geometryOptions.angle) > 0) {
      this.cap.rotateY(this.geometryOptions.angle);
    }
    this.cap.castShadow = false;
    this.cap.receiveShadow = false;
    this.cap.position.y = this.start_y;
    this.cap.position.x = this.x + 0.45;
    this.cap.position.z = this.y + 0.45;
    this.options.container.add(this.cap);

    document.addEventListener("force_key_material_update", () => {
      this.updateColors();
    });
  }
  get h() {
    return this.options.dimensions.h || 1;
  }
  get w() {
    return this.options.dimensions.w || 1;
  }
  get x() {
    return this.options.dimensions.x || 0;
  }
  get y() {
    return this.options.dimensions.y || 0;
  }
  get row() {
    return this.options.dimensions.row || 1;
  }
  get angle() {
    return this.options.dimensions.a || 0;
  }
  get materialOptions() {
    return {
      w: this.w,
      h: this.h,
      isIsoEnt: this.is_iso_enter,
    };
  }
  destroy() {
    this.options.container.remove(this.cap);
  }
  move(dimensions) {
    this.options.dimensions = dimensions;
    this.cap.position.x = this.x;
    this.cap.position.z = this.y;
  }
  // set the state of the key and prevent chaning in wrong order
  setState(state) {
    // if keyup event fires before key is finished animating down, add up animating to the queue
    if (this.state === SWITCHSTATE.MOVING_DOWN && state === SWITCHSTATE.MOVING_UP) {
      this.queueRelease = true;
    }
    if (
        (this.state === SWITCHSTATE.INITIAL &&
            (state === SWITCHSTATE.PRESSED || state === SWITCHSTATE.MOVING_UP)) ||
        (this.state === SWITCHSTATE.PRESSED &&
            (state === SWITCHSTATE.INITIAL || state === SWITCHSTATE.MOVING_DOWN))
    ) {
      return;
    }
    this.state = state;
  }
  // reset key to stating position and update state
  reset() {
    this.cap.position.y = this.start_y;
    this.setState(SWITCHSTATE.INITIAL);
    this.direction = -1;
  }
  // set key to fully pressed position and update state
  bottomOut() {
    this.cap.position.y = this.start_y - this.dist_pressed;
    this.setState(SWITCHSTATE.PRESSED);
    this.direction = 1;
    if (this.queueRelease) {
      this.setState(SWITCHSTATE.MOVING_UP);
      this.queueRelease = false;
    }
  }
  // update key
  update() {
    // check if key needs to be updated
    if (this.state === SWITCHSTATE.INITIAL || this.state === SWITCHSTATE.PRESSED)
      return;
    // const target = this.cap.children[0].children[0];
    // target.position.y =  target.position.y - this.press_velocity - this.direction;
    this.cap.position.y = this.cap.position.y + this.press_velocity * this.direction;

    // key has reached max height
    if (this.cap.position.y >= this.start_y) {
      this.reset();
    }
    // key has bottomed out
    if (this.cap.position.y <= this.start_y - this.dist_pressed) {
      this.bottomOut();
    }
  }
}
