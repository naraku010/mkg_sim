import * as THREE from "three";
import {subscribe} from "redux-subscriber";
import {initial_settings} from "../../store/startup";
import LAYOUTS from "../../config/layouts/layouts";
import Util from "../../util/math";
import case_1 from "./case_1";
import case_2 from "./case_2";
import case_3 from "./case_3";
// import badge from "./badge";
import ColorUtil from "../../util/color";
import {lightTexture} from "./lightTexture";

import {TextureLoader} from "three/src/loaders/TextureLoader.js";
import shadowPath from "../../assets/dist/shadow-key-noise.png";
import noisePath from "../../assets/dist/noise.png";
import brushedRoughness from "../../assets/dist/brushed-metal_roughness-512.png";
import brushedAlbedo from "../../assets/dist/brushed-metal_albedo-512.png";
import brushedAo from "../../assets/dist/brushed-metal_ao-512.png";

import shadow_path_100 from "../../assets/shadows/100.png";
import shadow_path_40 from "../../assets/shadows/40.png";
import shadow_path_60 from "../../assets/shadows/60.png";
import shadow_path_60hhkb from "../../assets/shadows/60hhkb.png";
import shadow_path_60iso from "../../assets/shadows/60iso.png";
import shadow_path_60wkl from "../../assets/shadows/60wkl.png";
import shadow_path_65 from "../../assets/shadows/65.png";
import shadow_path_75 from "../../assets/shadows/75.png";
import shadow_path_80 from "../../assets/shadows/80.png";
import shadow_path_95 from "../../assets/shadows/95.png";
import shadow_path_leftnum from "../../assets/shadows/leftnum.png";
import shadow_path_numpad from "../../assets/shadows/numpad.png";
import shadow_path_40ortho from "../../assets/shadows/40ortho.png";
import shadow_path_50ortho from "../../assets/shadows/50ortho.png";

import nx from "../../assets/dist/nx.jpg";
import ny from "../../assets/dist/ny.jpg";
import nz from "../../assets/dist/nz.jpg";
import px from "../../assets/dist/px.jpg";
import py from "../../assets/dist/py.jpg";
import pz from "../../assets/dist/pz.jpg";

import metal_ambientOcclusion from '../../assets/texture/metal/ambientOcclusion.jpg';
import metal_basecolor from '../../assets/texture/metal/basecolor.jpg';
import metal_normal from '../../assets/texture/metal/normal.jpg';
import metal_roughness from '../../assets/texture/metal/roughness.jpg';
import metal_metallic from '../../assets/texture/metal/metallic.jpg';
import metal_height from '../../assets/texture/metal/height.jpg';


const shadow_paths = {
    shadow_path_100,
    shadow_path_40,
    shadow_path_60,
    shadow_path_60hhkb,
    shadow_path_60iso,
    shadow_path_60wkl,
    shadow_path_65,
    shadow_path_75,
    shadow_path_80,
    shadow_path_95,
    shadow_path_leftnum,
    shadow_path_numpad,
    shadow_path_40ortho,
    shadow_path_50ortho,
};

const MATERIAL_OPTIONS = {
    tra: {
        metalness: 0.4,
        aoMapIntensity: 0.25,
        envMapIntensity: 0.1,
    },
    matte: {
        metalness: 0,
        roughness: 1,
        clearcoat: 0,
        aoMapIntensity: 0,
        clearcoatRoughness: 1,
        lightMapIntensity: 0.2,
    },
    brushed: {
        metalness: 0.4,
        aoMapIntensity: 0.25,
        envMapIntensity: 0.1,
    },
    glossy: {
        metalness: 1.0,  // 금속성 최대치
        roughness: 0.05, // 표면을 매끄럽게 설정
        reflectivity: 0.9, // 매우 높은 반사율
        clearcoat: 0.8, // 유광 효과를 위한 코팅
        clearcoatRoughness: 0.1, // 코팅의 거칠기를 낮게 설정
        envMapIntensity: 1.0, // 주변 반사 환경을 좀 더 강하게 설정
    },
};

// Manage the parts of the board: case, keys.
// dispatch updates and determine when they should be reinitialized
export default class CaseManager {
    constructor(opts) {
        this.scene = opts.scene;
        this.layoutName = initial_settings.case.layout;
        this.style = initial_settings.case.style;
        this.color = initial_settings.case.primaryColor;
        this.finish = initial_settings.case.material;
        this.layout = LAYOUTS[this.layoutName];
        this.metal = {};
        this.texScale = 0.1;
        this.bezel = 0.5;
        this.height = 1;
        this.angle = 6;
        this.r = 0.5;
        this.setup();
    }

    get width() {
        return this.layout.width + this.bezel * 2;
    }

    get depth() {
        return this.layout.height + this.bezel * 2;
    }

    get angleOffset() {
        return Math.sin(Util.toRad(this.angle)) * this.depth;
    }

    setup() {
        this.group = new THREE.Group();
        this.group.name = "CASE";
        this.loader = new TextureLoader();
        this.loadTextures();
        this.createEnvCubeMap();
        this.createCaseShadow();
        // this.createBadge();
        this.createPlate();
        this.createCase();
        //case global position (shadow is out side this.group)
        this.position();
        this.scene.add(this.group);

        subscribe("case.primaryColor", (state) => {
            this.color = state.case.primaryColor;
            this.updateCaseMaterial();
        });

        subscribe("case.material", (state) => {
            this.finish = state.case.material;
            this.updateCaseMaterial();
        });

        subscribe("case.style", (state) => {
            this.layout = LAYOUTS[state.case.layout];
            this.style = state.case.style;
            this.updateCaseGeometry();
        });

        subscribe("case.layout", (state) => {
            this.layoutName = state.case.layout;
            this.layout = LAYOUTS[state.case.layout];
            this.updateCaseGeometry();
            this.createCaseShadow();
            // this.createBadge();
            this.createPlate();
        });
        // subscribe("colorways.active", (state) => {
        //   const nc = ColorUtil.colorway;
        //   this.color = nc.swatches.base.background;
        //   this.updateCaseMaterial();
        // });
        subscribe("colorways.active", () => {
            this.updateLightMap();
        });
    }

    position() {
        this.group.rotation.x = Util.toRad(this.angle);
        this.group.position.x = -this.layout.width / 2;
        this.group.position.y = this.angleOffset + this.height;
    }

    loadTextures() {
        this.aoNoiseTexture = this.loader.load(noisePath);
        this.aoNoiseTexture.wrapS = THREE.RepeatWrapping;
        this.aoNoiseTexture.wrapT = THREE.RepeatWrapping;

        this.aoShadowTexture = this.loader.load(shadowPath);
        this.aoShadowTexture.wrapS = THREE.RepeatWrapping;
        this.aoShadowTexture.wrapT = THREE.RepeatWrapping;

        this.roughnessMap = this.loader.load(brushedRoughness);
        this.roughnessMap.wrapS = THREE.RepeatWrapping;
        this.roughnessMap.wrapT = THREE.RepeatWrapping;
        this.roughnessMap.repeat.x = this.texScale;
        this.roughnessMap.repeat.y = this.texScale;
        this.roughnessMap.rotation = Math.PI / 2;

        this.albedoMap = this.loader.load(brushedAlbedo);
        this.albedoMap.wrapS = THREE.RepeatWrapping;
        this.albedoMap.wrapT = THREE.RepeatWrapping;
        this.albedoMap.repeat.x = this.texScale;
        this.albedoMap.repeat.y = this.texScale;
        this.albedoMap.rotation = Math.PI / 2;

        this.ao = this.loader.load(brushedAo);
        this.ao.wrapS = THREE.RepeatWrapping;
        this.ao.wrapT = THREE.RepeatWrapping;
        this.ao.repeat.x = this.texScale;
        this.ao.repeat.y = this.texScale;
        this.ao.rotation = Math.PI / 2;
        this.lightTexture = lightTexture(ColorUtil.getAccent());

        this.metal.aoTexture = this.loader.load(metal_ambientOcclusion);
        this.metal.baseColorTexture = this.loader.load(metal_basecolor);
        this.metal.normalTexture = this.loader.load(metal_normal);
        this.metal.roughnessTexture = this.loader.load(metal_roughness);
        this.metal.metallicTexture = this.loader.load(metal_metallic);
        this.metal.displacementTexture = this.loader.load(metal_height);
    }

    createPlate() {
        if (this.plate) this.group.remove(this.plate);
        let geometry_plate = new THREE.PlaneGeometry(
            this.width - this.bezel * 2,
            this.depth - this.bezel * 2
        );
        let material_plate = new THREE.MeshLambertMaterial({
            color: "black",
        });
        this.plate = new THREE.Mesh(geometry_plate, material_plate);
        this.plate.rotateX(-Math.PI / 2);
        this.plate.name = "IGNORE";
        this.plate.layers.enable(1);
        this.plate.position.set(
            this.width / 2 - this.bezel,
            -0.5,
            this.depth / 2 - this.bezel
        );
        this.group.add(this.plate);
    }

    createEnvCubeMap() {
        this.cubemap = new THREE.CubeTextureLoader().load([py, ny, pz, nz, px, nx]);
    }

    createCaseShadow() {
        if (this.shadow) this.scene.remove(this.shadow);
        let sh_w = this.style === "CASE_1" ? 32.7 : 32;
        let sh_h = this.style === "CASE_1" ? 33 : 31.5;
        let sh_o = this.style === "CASE_1" ? 0 : -0.05;
        let shadowTex = this.loader.load(shadow_paths[`shadow_path_${this.layoutName}`], (texture) => {
            texture.anisotropy = 16;  // 텍스처 품질 향상
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        });

// 그림자 재질 설정
        let shadowMat = new THREE.MeshStandardMaterial({
            map: shadowTex,
            transparent: true,  // 투명도 지원
            opacity: 0.7,  // 그림자에 투명도를 적용하여 부드러운 효과
            side: THREE.DoubleSide,
        });

// 그림자 메쉬 생성
        this.shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(sh_w, sh_h),
            shadowMat
        );

// 그림자 위치 및 회전 설정
        this.shadow.position.z = this.depth / 2 - this.bezel + sh_o;
        this.shadow.position.y = 0.01;
        this.shadow.rotation.x = -Math.PI / 2;  // 바닥에 평행하게 놓기
        this.scene.add(this.shadow);
    }

    getCaseMesh(layout = this.layout, style = this.style) {
        let mesh;
        if (this.layoutName.indexOf('ergo') > -1) {
            mesh = case_3(layout, this.color);
        } else {
            if (style === "CASE_1") {
                mesh = case_1(layout, this.color);
            } else {
                mesh = case_2(layout, this.color);
            }
        }
        return mesh;
    }

    createCase() {
        this.case = this.getCaseMesh();
        this.updateCaseMaterial();
        this.group.add(this.case);
    }

    updateCaseGeometry() {
        let mesh = this.getCaseMesh();
        this.case.geometry = mesh.geometry;
        this.case.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
        this.position();
    }

    updateLightMap() {
        this.lightTexture = lightTexture(ColorUtil.getAccent());
        this.case.material[1].lightMap = this.lightTexture;
    }

    updateCaseMaterial(color = this.color, finish = this.finish) {
        let materials = [];
        let options = MATERIAL_OPTIONS[finish];
        options.lightMap = this.ao;
        if (finish !== "matte") {
            options.envMap = this.cubemap;
            // options.roughnessMap = this.roughnessMap;
            // options.map = this.albedoMap;
        }
        if (finish === "tra") {
            options.transparent = true;
            options.opacity = 0.93;
        }
        if (finish === 'glossy') {
            const c = this.metal;
            options = {
                ...options,
                // map: c.baseColorTexture,         // Base Color 맵 적용
                // aoMap: c.aoTexture,              // Ambient Occlusion 맵 적용
                // normalMap: c.normalTexture,      // 표면의 디테일을 표현하는 노멀 맵
                roughnessMap: c.roughnessTexture, // 거칠기 맵 적용
                metalnessMap: c.metallicTexture,  // 금속성 맵 적용
                // displacementMap: c.displacementTexture, // 표면 높이 맵 적용
                // displacementScale: 0.05,       // 높이 변형 정도
                metalness: 1,                // 금속성 설정
                roughness: 0.5,                // 거칠기 조정 (roughness 맵과 함께 사용)

            };
        }
        //create materials
        let materialPrimary = new THREE.MeshPhysicalMaterial({
            ...options,
            color: color,
        });
        //side material
        // options.lightMap = this.lightTexture;
        let materialSecondary = new THREE.MeshPhysicalMaterial({
            ...options,
            color: color,
        });
        materials.push(materialPrimary, materialSecondary);
        this.case.material = materials;
    }
}
