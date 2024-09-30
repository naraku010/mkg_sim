import * as THREE from "three";
import PureSky from "../assets/hdr/puresky.hdr";
import Cloudy from "../assets/hdr/cloudy.hdr";
import HillSunrise from "../assets/hdr/hill_sunrise.hdr";
import Studio from "../assets/hdr/studio.hdr";
import GoldenBay from "../assets/hdr/golden_bay.hdr";
import { RGBELoader } from "three-stdlib";
import { DirectionalLightHelper } from "three";

export default class HDRBackgroundManager {
    constructor(scene, camera, renderer, gui) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.gui = gui;
        this.hdrUrl = null;
        this.currentTexture = null;
        this.lights = []; // 조명을 관리하는 배열
        this.lightFolder = null; // 조명 폴더 참조 변수
        this.makeGUI();
        this.setupLights();
    }

    loadHDRAndSetBackground() {
        const loader = new RGBELoader();
        loader.load(this.hdrUrl, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping; // 구형으로 매핑

            // 이전 텍스처 제거
            if (this.currentTexture) {
                this.currentTexture.dispose();
            }

            // 배경 및 환경맵 설정
            // this.scene.background = texture;
            this.scene.environment = texture;

            // 현재 텍스처 참조
            this.currentTexture = texture;

            // 장면 다시 렌더링
            this.renderer.render(this.scene, this.camera);
        });
    }

    clearBackground() {
        // 배경 및 환경맵 제거
        this.scene.background = null;
        this.scene.environment = null;

        // 현재 텍스처 제거
        if (this.currentTexture) {
            this.currentTexture.dispose();
            this.currentTexture = null;
        }

        // 조명 및 관련 GUI 삭제
        this.removeAllLights();

        // 장면 다시 렌더링
        this.renderer.render(this.scene, this.camera);
    }

    setupLights() {
        // 기존 조명을 모두 제거
        this.removeAllLights();

        // 새로운 조명 설정
        const primaryLight = new THREE.DirectionalLight("#ffffff", 3.5);
        primaryLight.position.set(0, 30, 0);
        primaryLight.target.position.set(0, 0, 0);
        primaryLight.target.updateMatrixWorld();
        this.scene.add(primaryLight, primaryLight.target);

        const primaryLightHelper = new DirectionalLightHelper(primaryLight, 5);  // Helper 크기 지정
        primaryLightHelper.visible = false;
        this.scene.add(primaryLightHelper);

        // 조명 배열에 추가
        this.lights.push(primaryLight, primaryLightHelper);

        // 조명 GUI 폴더 생성
        this.lightFolder = this.gui.addFolder('조명');
        this.lightFolder.add(primaryLight, 'intensity', 0, 10, 0.1).name('직접조명 강도');
        this.lightFolder.addColor({ color: primaryLight.color.getHex() }, 'color').name('조명색상').onChange((value) => {
            primaryLight.color.setHex(value);
        });

        this.lightFolder.add(primaryLight.position, 'x', -50, 50, 0.1).name('좌우');
        this.lightFolder.add(primaryLight.position, 'z', -50, 50, 0.1).name('위아래');
        this.lightFolder.add(primaryLight.position, 'y', -50, 50, 0.1).name('상하');

        let helperVisible = false; // 초기 가시성 상태
        const helperControls = {
            toggleHelper: function () {
                helperVisible = !helperVisible;
                primaryLightHelper.visible = helperVisible;
            }
        };
        // GUI에 토글 버튼 추가
        this.lightFolder.add(helperControls, 'toggleHelper').name('조명 가이드 보기');
    }

    makeGUI() {
        const target = this;
        const folder = this.gui.addFolder('HDR 조명');
        const hdrOptions = {
            'PureSky': PureSky,
            'Cloudy': Cloudy,
            'Studio': Studio,
            'HillSunrise': HillSunrise,
            'GoldenBay': GoldenBay,
        };

        const params = {
            selectedHDR: ''
        };

        // HDR 선택 GUI
        folder.add(params, 'selectedHDR', Object.keys(hdrOptions)).name('HDR 조명 선택').onChange((value) => {
            target.hdrUrl = hdrOptions[value];
            target.loadHDRAndSetBackground();
            target.removeAllLights();
        });

        // 배경 지우기 버튼 추가
        folder.add({
            clear: () => {
                target.clearBackground();
                target.setupLights(); // 새로운 조명과 GUI 생성
            }
        }, 'clear').name('HDR 조명 지우기');

        folder.open();
    }

    removeAllLights() {
        // lights 배열에서 조명 제거
        this.lights.forEach(light => {
            this.scene.remove(light);
            if (light.dispose) light.dispose();
        });
        this.lights = [];  // 조명 배열 초기화

        // GUI에서 조명 폴더 제거
        if (this.lightFolder) {
            this.lightFolder.destroy();  // lil-gui에서 폴더 삭제
            this.lightFolder = null; // 폴더 참조 해제
        }
    }

    destroy() {
        if (this.currentTexture) {
            this.currentTexture.dispose();
            this.currentTexture = null;
        }
    }
}
