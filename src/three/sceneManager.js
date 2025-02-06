import * as THREE from "three";
import Collection from "./collection";
import {subscribe} from "redux-subscriber";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {disableHighlight, enableHighlight} from "./key/materials";
import ThreeUtil from "../util/three";
import GUI from "lil-gui";
import RoundedMatPad from "./mat";
import HDRBackgroundManager from "./background";
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";


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
            speed: 0.02, // 조명 이동 속도
            radius: 15,  // 조명 궤적 반지름 (궤도 크기)
            height: 10,  // 조명의 최대 높이
            animate: true, // 애니메이션 활성화 여부
        };
        this.theta = 0; // 각도 (0 ~ π)
        this.init();
    }

    init() {
        RectAreaLightUniformsLib.init();
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        // this.renderer.setPixelRatio(window.devicePixelRatio); // 디스플레이 품질 설정
        // this.renderer.setSize(window.innerWidth, window.innerHeight); // 캔버스 크기 설정
        // this.renderer.physicallyCorrectLights = true; // 물리적으로 정확한 조명 사용
        // this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // 사실적 톤 매핑
        // this.renderer.toneMappingExposure = 1.0; // 노출 값 조정
        // this.renderer.outputColorSpace = THREE.SRGBColorSpace; // sRGB 색 공간 사용
        // this.renderer.shadowMap.enabled = true; // 그림자 활성화
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 부드러운 그림자 설정

        // 클리핑 활성화 (필요 시 유지)
        // this.renderer.localClippingEnabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;  // or ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 5;
        this.renderer.physicallyCorrectLights = true; // 물리적으로 정확한 조명 사용
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.el.appendChild(this.renderer.domElement);

        this.renderer.localClippingEnabled = true;
        //main setup
        this.setupGUI();
        this.addLights();
        this.setupCamera();
        this.setupControls();
        // 시발 장패드
        this.setupMat();
        this.setupBackground();
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.w, this.h),
            0.5,   // 강도 (필요에 따라 조정)
            0.4,   // 반경
            0.85   // 스레숄드
        );
        this.composer.addPass(bloomPass);
        this.resize();
        // this.addLights();
        // const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        // pmremGenerator.compileEquirectangularShader();
        // loader.load(InDoorHDR, (hdrTexture) => {
        //     hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
        //     hdrTexture.colorSpace = THREE.SRGBColorSpace;
        //
        //     // 배경 및 환경맵 설정
        //     if (this.currentTexture) {
        //         this.currentTexture.dispose();
        //     }
        //
        //     this.scene.background = null; // 배경 비우기
        //     this.scene.environment = hdrTexture;
        //
        //     // 현재 텍스처 참조
        //     this.currentTexture = hdrTexture;
        //
        //     // 장면 다시 렌더링
        //     this.renderer.render(this.scene, this.camera);
        // });
        //mouse and raycaster
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(1);
        //


        // const renderPass = new RenderPass(this.scene, this.camera);
        // renderPass.clearColor = new THREE.Color('black');
        // renderPass.clearAlpha = 1;
        // this.composer.addPass(renderPass);
        // const unrealBloomPass = new UnrealBloomPass([this.w, this.h], 1.5, 0.4, 0.85);
        // this.composer.addPass(unrealBloomPass);

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
        // this.composer.setSize( this.w, this.h );
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // 부드러운 전체 조명 추가
        this.scene.add(ambientLight);
        // RectAreaLight(색상, 강도, 가로width, 세로height)
        // 면의 크기를 조절해서 원하는 크기의 형광등을 시뮬레이션
        this.rectLight = new THREE.RectAreaLight(0xf5f5f5, .5, 15, 15);
        this.rectLight.position.set(0, 15, 0);  // 천장 높이라고 가정
        // 아래 바라보도록 설정
        this.rectLight.lookAt(0, 0, 0);

        this.scene.add(this.rectLight);

        // 헬퍼(사각형 빛 범위 보여줌)
        this.rectLightHelper = new RectAreaLightHelper(this.rectLight);
        // this.scene.add(this.rectLightHelper);
        this.setupLightGUI();

    }

    setupLightGUI() {
        const rectFolder = this.gui.addFolder('조명');

        // 위치
        rectFolder.add(this.rectLight.position, 'x', -5, 80, 0.1).name('위치 X');
        rectFolder.add(this.rectLight.position, 'y', 0, 80, 0.1).name('위치 Y');
        rectFolder.add(this.rectLight.position, 'z', -5, 80, 0.1).name('위치 Z');

        rectFolder.add(this.rectLight, 'intensity', 0, 30, 0.1).name('밝기');
        // 면조명 폭, 높이
        rectFolder.add(this.rectLight, 'width', 0.1, 80, 0.1).name('폭');
        rectFolder.add(this.rectLight, 'height', 0.1, 80, 0.1).name('높이');

        // 색상
        const rectParams = {color: this.rectLight.color.getHex()};
        rectFolder
            .addColor(rectParams, 'color')
            .name('조명색상')
            .onChange((value) => {
                this.rectLight.color.set(value);
            });

        rectFolder
            .add(this, 'showRectLightHelper')
            .name('헬퍼 표시')
            .onChange((val) => {
                if (val) {
                    this.scene.add(this.rectLightHelper);
                } else {
                    this.scene.remove(this.rectLightHelper);
                }
            });
    }

    setupMat() {
        this.mat = new RoundedMatPad(this.scene, this.gui);
    }

    setupBackground() {
        this.background = new HDRBackgroundManager(this.scene, this.camera, this.renderer, this.gui);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(60, this.w / this.h, 1, 1000);
        this.camera.position.y = 15;
        this.camera.position.z = 15;
        this.camera.position.x = 0;
        const params = {
            resetCamera: () => {
                this.camera.position.set(0, 15, 15); // 초기 위치로 설정
                this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // (0, 0, 0)을 바라보도록 설정
                this.camera.rotation.set(0, 0, 0); // 카메라의 회전값을 초기화
                this.controls.target.set(0, 0, 0); // 컨트롤이 바라보는 대상 초기화
                this.controls.update(); // 컨트롤 업데이트
            }
        };
        this.gui.add(params, 'resetCamera').name('뷰 초기화');

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
        // let x = this.camera.position.x;
        // let y = this.camera.position.y;
        // let z = this.camera.position.z;
        //this.camera.position.multiplyScalar(this.scale);
        //this.cssRenderer.render(this.scene, this.camera);
        //this.camera.position.set(x, y, z);
    }

    tick() {
        this.render();

        if (this.takeScreenshot) {
            ThreeUtil.getSceneScreenshot(this.renderer);
            this.takeScreenshot = false;
        }
        requestAnimationFrame(this.tick.bind(this));
        this.composer.render();
    }
}
