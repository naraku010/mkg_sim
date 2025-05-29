import * as THREE from "three";
import store from "../../store/store";
import {keyTexture} from "./texture";
import {initial_settings} from "@store/startup";
import {TextureLoader} from "three/src/loaders/TextureLoader.js";
import ambiantOcclusionPath from "@assets/dist/shadow-key-noise.png";
import lightMapPath from "@assets/materials/white.png";
import pbtMapPath from "@assets/texture/normal/abs.jpg";
const loader = new TextureLoader();

const ambiantOcclusionMap = loader.load(ambiantOcclusionPath);
ambiantOcclusionMap.wrapS = THREE.RepeatWrapping;
ambiantOcclusionMap.wrapT = THREE.RepeatWrapping;

const pbtMap = loader.load(pbtMapPath);
pbtMap.wrapS = THREE.RepeatWrapping;
pbtMap.wrapT = THREE.RepeatWrapping;


const lightMap = loader.load(lightMapPath);
lightMap.wrapS = THREE.RepeatWrapping;
lightMap.wrapT = THREE.RepeatWrapping;

let computed_materials = {};

export const KEY_MATERIAL_STATES = {
    DEFAULT: 0,
    ACTIVE: 1,
    HIGHLIGHTED: 2,
};

export const setKeyMaterialState = (mesh, state, isoent) => {
    if (state === KEY_MATERIAL_STATES.DEFAULT) {
        setMaterialIndexes(mesh, 2, 3, isoent);
    } else if (state === KEY_MATERIAL_STATES.ACTIVE || state === KEY_MATERIAL_STATES.HIGHLIGHTED) {
        setMaterialIndexes(mesh, 0, 1, isoent);
    }
};
const setMaterialIndexes = (mesh, side, top, isoent) => {
    mesh.geometry.clearGroups();
    let threshold = isoent ? 30 : 18;
    const sideIndicesCount = mesh.geometry.index.count - threshold;
    mesh.geometry.addGroup(threshold, sideIndicesCount, side);
    mesh.geometry.addGroup(0, threshold, top);
    mesh.geometry.groupsNeedUpdate = true;
};

// Generate top and side materials for a single color set
const getMaterialSet = (opts) => {
    let currentState = store.getState();
    let key = `mat${opts.background}`;
    let legendTexture = keyTexture(opts);
    let top = new THREE.MeshPhysicalMaterial({
        map: legendTexture,
        normalMap: pbtMap,
        normalScale: new THREE.Vector2(0.4, 0.4),  // 노말맵 강도 조절
        aoMap: lightMap,
        aoMapIntensity: 0.7,  // 주변광 차폐 강화
        metalness: 0.05,  // 미세한 금속성 반사
        roughness: 0.85,  // PBT 특유의 거칠기
        transmission: 0.0,
        thickness: 0.0,
        clearcoat: 0.3,  // 약간의 코팅 효과
        clearcoatRoughness: 0.4,  // 코팅의 거칠기
        sheen: 0.15,  // 미세한 광택
        sheenColor: new THREE.Color(0xffffff),
        sheenRoughness: 0.6,  // 광택의 거칠기
        envMapIntensity: 0.4,  // 환경 반사 강도
        ior: 1.5,  // 굴절률 (플라스틱 특성)
    });
    top.map.minFilter = top.map.magFilter = THREE.LinearFilter;
    top.needsUpdate = true;
    let side = new THREE.MeshPhysicalMaterial({
        color: opts.background,
        normalMap: pbtMap,
        normalScale: new THREE.Vector2(0.3, 0.3),  // 측면은 노말맵 강도 약화
        aoMap: lightMap,
        aoMapIntensity: 0.8,  // 측면의 주변광 차폐 강화
        metalness: 0.05,
        roughness: 0.9,  // 측면은 더 거칠게
        transmission: 0.0,
        thickness: 0.0,
        clearcoat: 0.2,  // 측면은 코팅 효과 감소
        clearcoatRoughness: 0.5,
        sheen: 0.1,
        sheenColor: new THREE.Color(0xffffff),
        sheenRoughness: 0.7,
        envMapIntensity: 0.3,
        ior: 1.5,
    });
    if( currentState.keys.legendType === 'trn') {
        top.blending = side.blending = THREE.NormalBlending;
        top.transparent = side.transparent = true;
        top.opacity = side.opacity = 0.55;
    }
    computed_materials[key] = side;
    return [side, top];
};

export const keyMaterials = (opts) => {
    const base = getMaterialSet(opts);
    opts.color = initial_settings.keys.activeColor;
    opts.background = initial_settings.keys.activeBackground;
    const active = getMaterialSet(opts);
    return [...active, ...base];
};

export const updateMaterials = (mesh, opts) => {
    const base = getMaterialSet(opts);
    mesh.material[2] = base[0];
    mesh.material[3] = base[1];
    setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

export const updateActiveMaterials = (mesh, opts) => {
    opts.color = initial_settings.keys.activeColor;
    opts.background = initial_settings.keys.activeBackground;
    const active = getMaterialSet(opts);
    mesh.material[0] = active[0];
    mesh.material[1] = active[1];
    setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

// Simulate highlighting by toggling lightmap intensity
export const enableHighlight = (key_mesh) => {
    key_mesh.material.forEach((m) => (m.lightMapIntensity = 0.2));
};
export const disableHighlight = (key_mesh) => {
    key_mesh.material.forEach((m) => (m.lightMapIntensity = 0));
};
