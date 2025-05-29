import * as THREE from "three";
import Collection from "./collection";
import {subscribe} from "redux-subscriber";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {disableHighlight, enableHighlight} from "./key/materials";
import ThreeUtil from "../util/three";
import GUI from "lil-gui";
import RoundedMatPad from "./mat";
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

export default class SceneManager extends Collection {
    constructor(options) {
        super();
        this.takeScreenshot = false;
        this.options = options || {};
        this.editing = false;
        this.scale = options.scale || 1;
        this.el = options.el || document.body;
        this.showRectLightHelper = false;
        this.lightParams = {
            speed: 0.02,
            radius: 15,
            height: 10,
            animate: true,
        };
        this.theta = 0;
        this.ambientLight = null;
        this.init();
    }

    init() {
        RectAreaLightUniformsLib.init();
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });

        // 렌더러 설정
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 5;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.localClippingEnabled = true;

        this.el.appendChild(this.renderer.domElement);

        //main setup
        this.setupGUI();
        this.addLights();
        this.setupCamera();
        this.setupControls();
        this.setupMat();
        this.resize();

        //mouse and raycaster
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(1);

        //bind global events
        window.addEventListener("resize", (e) => this.resize(e), false);
        this.el.addEventListener("mousemove", (e) => this.move(e), false);
        this.el.addEventListener("click", (e) => this.mouseClick(e), false);
        this.el.addEventListener(
            "touchstart",
            (e) => {
                this.move(e);
                this.mouseClick(e);
            },
            false
        );
        document.addEventListener(
            "screenshot",
            () => {
                this.takeScreenshot = true;
            },
            false
        );

        //some helpers for reading and setting orbit controls position / taking screenshots
        document.addEventListener("keydown", (e) => {
            if (e.key === "F1") {
                console.log("Camera Position:");
                console.log(this.camera.position);
                console.log("Controls Target:");
                console.log(this.controls.target);
            }
            if (e.key === "F2") {
                this.camera.position.set(-7, 8, 9);
                this.controls.target.set(-3, -2, 1);
            }
            if (e.key === "F3") {
                this.takeScreenshot = true;
            }
        });
        subscribe("colorways.editing", (state) => {
            this.editing = state.colorways.editing;
        });
    }

    get w() {
        return this.el.offsetWidth;
    }

    get h() {
        return this.el.offsetHeight;
    }

    get sidebarWidth() {
        let sb = document.getElementById("sidebar");
        return sb ? sb.offsetWidth : 0;
    }

    resize() {
        this.camera.aspect = this.w / this.h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.w, this.h);
    }

    addLights() {
        // 주변광 - 전체적인 부드러운 조명
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        this.scene.add(this.ambientLight);

        // 메인 조명 - 키보드의 주요 조명
        this.rectLight = new THREE.RectAreaLight(0xf5f5f5, 0.5, 40, 40);
        this.rectLight.position.set(0, 25, 0);
        this.rectLight.lookAt(0, 0, 0);
        this.scene.add(this.rectLight);

        // 보조 조명 - 키보드 측면의 디테일을 강조
        const fillLight = new THREE.RectAreaLight(0xffffff, 0.2, 20, 20);
        fillLight.position.set(-15, 10, -15);
        fillLight.lookAt(0, 0, 0);
        this.scene.add(fillLight);

        // 후면 보조광 - 키보드 후면의 디테일을 강조
        const backLight = new THREE.RectAreaLight(0xffffff, 0.15, 20, 20);
        backLight.position.set(0, 10, -20);
        backLight.lookAt(0, 0, 0);
        this.scene.add(backLight);

        // 헬퍼 설정
        this.rectLightHelper = new RectAreaLightHelper(this.rectLight);
        this.setupLightGUI();
    }

    setupLightGUI() {
        const rectFolder = this.gui.addFolder('조명 설정');
        rectFolder.close();

        // 메인 조명 설정
        const mainLightFolder = rectFolder.addFolder('메인 조명');
        mainLightFolder.add(this.rectLight.position, 'x', -30, 30, 0.1).name('위치 X');
        mainLightFolder.add(this.rectLight.position, 'y', 5, 40, 0.1).name('위치 Y');
        mainLightFolder.add(this.rectLight.position, 'z', -30, 30, 0.1).name('위치 Z');
        mainLightFolder.add(this.rectLight, 'intensity', 0, 2, 0.1).name('강도');
        mainLightFolder.add(this.rectLight, 'width', 10, 60, 1).name('너비');
        mainLightFolder.add(this.rectLight, 'height', 10, 60, 1).name('높이');

        // 조명 색상 설정
        const colorParams = {
            mainColor: this.rectLight.color.getHex(),
            ambientIntensity: this.ambientLight.intensity
        };
        
        mainLightFolder.addColor(colorParams, 'mainColor').name('메인 조명 색상')
            .onChange((value) => {
                this.rectLight.color.set(value);
            });
            
        mainLightFolder.add(colorParams, 'ambientIntensity', 0, 1, 0.1).name('주변광 강도')
            .onChange((value) => {
                this.ambientLight.intensity = value;
            });

        // 헬퍼 표시 설정
        rectFolder.add(this, 'showRectLightHelper').name('조명 범위 표시')
            .onChange((val) => {
                if (val) {
                    if (!this.rectLightHelper) {
                        this.rectLightHelper = new RectAreaLightHelper(this.rectLight);
                    }
                    this.scene.add(this.rectLightHelper);
                } else {
                    if (this.rectLightHelper) {
                        this.scene.remove(this.rectLightHelper);
                    }
                }
            });
    }

    setupMat() {
        this.mat = new RoundedMatPad(this.scene, this.gui);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(55, this.w / this.h, 1, 1000);
        this.camera.position.y = 15;
        this.camera.position.z = 15;
        this.camera.position.x = 0;
        const params = {
            resetCamera: () => {
                this.camera.position.set(0, 15, 25); // 초기 위치로 설정
                this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // (0, 0, 0)을 바라보도록 설정
                this.camera.rotation.set(0, 0, 0); // 카메라의 회전값을 초기화
                this.controls.target.set(0, 0, 0); // 컨트롤이 바라보는 대상 초기화
                this.controls.update(); // 컨트롤 업데이트
            }
        };
        this.gui.add(params, 'resetCamera').name('카메라 원점');

    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.maxPolarAngle = (Math.PI / 20) * 9.7;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableKeys = false;
        this.controls.maxDistance = 40;
        this.controls.target = new THREE.Vector3(0, 0, 0);
    }

    setupGUI() {
        this.gui = new GUI();
    }

    mouseClick(e) {
        if (!this.editing) return;
        if (this.intersectedObj) {
            let event = new CustomEvent("key_painted", {
                detail: this.intersectedObj.name,
            });
            document.dispatchEvent(event);
        }
    }

    move(e) {
        e.preventDefault();
        let isTouch = e.type === "touchstart";
        let l = (isTouch ? e.touches[0].clientX : e.clientX) - this.sidebarWidth;
        let t = (isTouch ? e.touches[0].clientY : e.clientY) - 0;
        this.mouse.x = (l / this.w) * 2 - 1;
        this.mouse.y = -(t / this.h) * 2 + 1;

    }

    deactivateIntersection() {
        if (!this.intersectedObj) return;
        disableHighlight(this.intersectedObj);
        this.intersectedObj = undefined;
    }

    activateIntersection(obj) {
        document.body.classList.add("intersecting-key");
        this.isIntersecting = true;
        this.intersectedObj = obj;
        if (this.editing) enableHighlight(obj);
    }

    checkIntersections() {
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        //no intersections
        if (!intersects.length) {
            this.isIntersecting = false;
            this.deactivateIntersection();
            document.body.classList.remove("intersecting-key");
            return;
        }
        //same obj dont do anything
        if (this.intersectedObj === intersects[0].object) return;
        //reset old object
        this.deactivateIntersection();
        //not a valid obj
        let ignored = intersects[0]?.object.name === "IGNORE";
        if (ignored) return;
        //activate new obj
        this.activateIntersection(intersects[0].object);
    }

    render() {
        this.update();
        this.controls.update();
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.checkIntersections();
        this.renderer.render(this.scene, this.camera);
    }

    async tick() {
        this.render();

        if (this.takeScreenshot) {
            await ThreeUtil.getHighResScreenshot(this.renderer, this.scene, this.camera);
            this.takeScreenshot = false;
        }
        requestAnimationFrame(this.tick.bind(this));
    }
}
