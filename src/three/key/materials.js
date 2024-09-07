import * as THREE from "three";
import store from "../../store/store";
import {keyTexture} from "./texture";
import {initial_settings} from "../../store/startup";
import {TextureLoader} from "three/src/loaders/TextureLoader.js";
import ambiantOcclusionPath from "../../assets/dist/shadow-key-noise.png";
import lightMapPath from "../../assets/materials/white.png";
import absNormalMapPath from "../../assets/texture/normal/abs.jpg";
import pbtNormalMapPath from "../../assets/texture/normal/pbt.jpg";

const loader = new TextureLoader();
const absNormalMap = loader.load(absNormalMapPath);
const pbtNormalMap = loader.load(pbtNormalMapPath);

const ambiantOcclusionMap = loader.load(ambiantOcclusionPath);
ambiantOcclusionMap.wrapS = THREE.RepeatWrapping;
ambiantOcclusionMap.wrapT = THREE.RepeatWrapping;

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
    let options = currentState.keys.legendType === 'pbt' ? {
        roughness: 0.6,              // PBT는 더 높은 거칠기
        metalness: 0,                // 금속성 없음
        clearcoat: 0.5,              // 적당한 클리어코트 반짝임
        clearcoatRoughness: 0.4,     // 거칠기 반영
        reflectivity: 0.2,           // 적당한 반사도
        // envMapIntensity: 1.2,        // 환경 맵 반사 강도
    } : {
        roughness: 0.2,              // ABS는 더 낮은 거칠기
        metalness: 0,                // 금속성 없음
        clearcoat: 0.6,                // 강한 클리어코트로 반짝임 효과
        clearcoatRoughness: 0.05,    // 매끄러운 표면
        reflectivity: 0.3,           // 더 높은 반사도
        // envMapIntensity: 1.5,        // 더 강한 환경 맵 반사
    };
    let top = new THREE.MeshPhysicalMaterial({
        map: legendTexture,
        // color: opts.background,
        ...options
    });

    top.needsUpdate = true
    top.map.minFilter = THREE.LinearFilter;

    // if (computed_materials[key]) {
    //   return [computed_materials[key].clone(), top];
    // }
    let side = new THREE.MeshPhysicalMaterial({
        color: opts.background,
        ...options,
    });
    if( currentState.keys.legendType === 'trn') {
        top.transparent = side.transparent = true;
        top.opacity = side.opacity = 0.75;
    }
    // side.needsUpdate = true;
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
