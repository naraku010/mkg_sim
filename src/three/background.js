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
        // this.makeGUI();
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

        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambientLight);

        const primaryLight = new THREE.DirectionalLight(0xdddddd, .7);
        primaryLight.position.set(5, 10, 10);
        primaryLight.target.position.set(0, -10, -10);
        primaryLight.castShadow = true;  // 그림자 추가 가능
        this.scene.add(primaryLight);

        const shadowLight = new THREE.DirectionalLight(0xffffff, .2);
        shadowLight.position.set(-4, 3, -10);
        shadowLight.target.position.set(0, 0, 0);
        shadowLight.castShadow = true;  // 필요 시 그림자 활성화
        this.scene.add(shadowLight);

        this.lightFolder = this.gui.addFolder('조명');
        this.lightFolder.add(ambientLight, 'intensity', 0, 10, 0.1).name('Ambient 강도');
        this.lightFolder.add(ambientLight, 'intensity', 0, 10, 0.1).name('Primary 강도');
        
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
