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
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';

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
            speed: 0.01, // 적당한 속도로 조정
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
            powerPreference: "high-performance",
        });

        // 진짜 사진같은 렌더러 설정
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.4; // 더 어둡게
        this.renderer.toneMappingWhitePoint = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.localClippingEnabled = true;
        
        // 진짜 사진같은 그림자 설정
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        this.renderer.shadowMap.bias = -0.0001; // 그림자 아티팩트 방지
        this.renderer.shadowMap.radius = 2.0; // 그림자 블러 강화

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
        // 주변광 - 완전히 어둡게
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
        this.scene.add(this.ambientLight);

        // 메인 조명 - 실제 스튜디오 조명
        this.rectLight = new THREE.RectAreaLight(0xffffff, 3.0, 100, 100);
        this.rectLight.position.set(0, 45, 0);
        this.rectLight.lookAt(0, 0, 0);
        this.rectLight.castShadow = true;
        this.scene.add(this.rectLight);

        // 측면 보조광 - 키보드 측면 디테일
        const fillLight = new THREE.RectAreaLight(0xffffff, 0.8, 50, 50);
        fillLight.position.set(-35, 30, -35);
        fillLight.lookAt(0, 0, 0);
        this.scene.add(fillLight);

        // 후면 보조광 - 키보드 후면 디테일
        const backLight = new THREE.RectAreaLight(0xffffff, 0.5, 50, 50);
        backLight.position.set(0, 30, -40);
        backLight.lookAt(0, 0, 0);
        this.scene.add(backLight);

        // 상단 보조광 - 키보드 상단 디테일
        const topLight = new THREE.RectAreaLight(0xffffff, 0.4, 55, 55);
        topLight.position.set(0, 50, 25);
        topLight.lookAt(0, 0, 0);
        this.scene.add(topLight);

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

        // 렌더링 품질 설정
        const renderFolder = rectFolder.addFolder('렌더링 품질');
        const renderParams = {
            exposure: this.renderer.toneMappingExposure,
            shadowQuality: 'PCFSoftShadowMap'
        };
        
        renderFolder.add(renderParams, 'exposure', 0.5, 3.0, 0.1).name('노출')
            .onChange((value) => {
                this.renderer.toneMappingExposure = value;
            });
            
        renderFolder.add(renderParams, 'shadowQuality', ['BasicShadowMap', 'PCFShadowMap', 'PCFSoftShadowMap']).name('그림자 품질')
            .onChange((value) => {
                this.renderer.shadowMap.type = THREE[value];
            });
            
        // 조명 애니메이션 설정
        const animationFolder = rectFolder.addFolder('조명 애니메이션');
        animationFolder.add(this.lightParams, 'animate').name('애니메이션 활성화');
        animationFolder.add(this.lightParams, 'speed', 0, 0.1, 0.001).name('애니메이션 속도');
        animationFolder.add(this.lightParams, 'radius', 5, 30, 1).name('회전 반지름');
        animationFolder.add(this.lightParams, 'height', 5, 40, 1).name('조명 높이');
    }

    setupMat() {
        this.mat = new RoundedMatPad(this.scene, this.gui);
        this.setupEnvironmentMap();
    }

    setupEnvironmentMap() {
        // 환경 맵 생성 (HDR 스타일)
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        // 간단한 환경 맵 생성
        const envMap = pmremGenerator.fromScene(new THREE.Scene()).texture;
        this.scene.environment = envMap;
        this.scene.background = null;
        
        pmremGenerator.dispose();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(35, this.w / this.h, 0.1, 1000); // 더 좁은 FOV로 사진같게
        this.camera.position.y = 10;
        this.camera.position.z = 20;
        this.camera.position.x = 0;
        const params = {
            resetCamera: () => {
                this.camera.position.set(0, 10, 20); // 사진 촬영 각도
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                this.camera.rotation.set(0, 0, 0);
                this.controls.target.set(0, 0, 0);
                this.controls.update();
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
        
        // 성능 최적화: 그림자 업데이트 제한
        if (this.renderer.shadowMap.autoUpdate) {
            this.renderer.shadowMap.autoUpdate = false;
        }
        
        this.renderer.render(this.scene, this.camera);
        
        // 다음 프레임에서 그림자 업데이트 허용
        requestAnimationFrame(() => {
            this.renderer.shadowMap.autoUpdate = true;
        });
    }

    async tick() {
        this.render();
        
        // 조명 애니메이션 (선택적)
        if (this.lightParams.animate) {
            this.theta += this.lightParams.speed;
            const radius = this.lightParams.radius;
            const height = this.lightParams.height;
            
            this.rectLight.position.x = Math.cos(this.theta) * radius;
            this.rectLight.position.z = Math.sin(this.theta) * radius;
            this.rectLight.position.y = height;
            this.rectLight.lookAt(0, 0, 0);
        }

        if (this.takeScreenshot) {
            await ThreeUtil.getHighResScreenshot(this.renderer, this.scene, this.camera);
            this.takeScreenshot = false;
        }
        requestAnimationFrame(this.tick.bind(this));
    }
}
