import * as THREE from "three";
import store from "../../store/store";
import { keyTexture } from "./texture";
import { initial_settings } from "../../store/startup";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import ambiantOcclusionPath from "../../assets/dist/shadow-key-noise.png";
import lightMapPath from "../../assets/materials/white.png";
// import baseMap from "../../assets/texture/plastic/basecolor.jpg";
import absNormalMapPath from "../../assets/texture/normal/abs.jpg";
import pbtNormalMapPath from "../../assets/texture/normal/pbt.jpg";
import {Vector2} from "three/src/math/Vector2";
import {TangentSpaceNormalMap} from "three/src/constants";
// import heightMap from "../../assets/texture/plastic/height.png";
// import roughnessMap from "../../assets/texture/plastic/roughness.jpg";
// import ambientOcclusionMap from "../../assets/texture/plastic/ambientOcclusion.jpg";



const loader = new TextureLoader();
const absNormalMap = loader.load(absNormalMapPath);
const pbtNormalMap = loader.load(pbtNormalMapPath);

const ambiantOcclusionMap = loader.load(ambiantOcclusionPath);
ambiantOcclusionMap.wrapS = THREE.RepeatWrapping;
ambiantOcclusionMap.wrapT = THREE.RepeatWrapping;

const lightMap = loader.load(lightMapPath);
lightMap.wrapS = THREE.RepeatWrapping;
lightMap.wrapT = THREE.RepeatWrapping;

var computed_materials = {};

export const KEY_MATERIAL_STATES = {
  DEFAULT: 0,
  ACTIVE: 1,
  HIGHLIGHTED: 2,
};

export const setKeyMaterialState = (mesh, state, isoent) => {
  if (state === KEY_MATERIAL_STATES.DEFAULT) {
    setMaterialIndexes(mesh, 2, 3, isoent);
  }
  if (state === KEY_MATERIAL_STATES.ACTIVE) {
    setMaterialIndexes(mesh, 0, 1, isoent);
  }
  if (state === KEY_MATERIAL_STATES.HIGHLIGHTED) {
    setMaterialIndexes(mesh, 0, 1, isoent);
  }
};

const setMaterialIndexes = (mesh, side, top, isoent) => {
  let threshold = isoent ? 10 : 6;
  mesh.geometry.faces.forEach((f, i) => {
    let isTop = i < threshold || i === 8;
    f.materialIndex = isTop ? top : side;
  });
  mesh.geometry.groupsNeedUpdate = true;
};

//generate top and side materials for a single color set
const getMaterialSet = (opts, offset) => {
  let currentState = store.getState();
  let key = `mat${opts.background}`;
  let legendTexture = keyTexture(opts);
  let normalMap = currentState.keys.legendType === 'pbt' ? pbtNormalMap : absNormalMap;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

  let top = new THREE.MeshStandardMaterial({
    map: legendTexture,
    normalMap: normalMap,
    normalMapType: 1,
    aoMap: ambiantOcclusionMap,
    aoMapIntensity: .4,
    // lightMap: lightMap,
    // lightMapIntensity: 0,
  });

  top.needsUpdate = true
  top.map.minFilter = THREE.LinearFilter;

  // if (computed_materials[key]) {
  //   return [computed_materials[key].clone(), top];
  // }
  let side = new THREE.MeshStandardMaterial({
    normalMap: normalMap,
    normalMapType: 1,
    aoMap: ambiantOcclusionMap,
    aoMapIntensity: .4,
    // lightMap: lightMap,
    // lightMapIntensity: 0,
    color: opts.background
  });
  if( currentState.keys.legendType === 'trn') {
    top.transparent = side.transparent = true;
    top.opacity = side.opacity = 0.93;
  }
  // side.needsUpdate = true;
  computed_materials[key] = side;
  return [side, top];
};

export const keyMaterials = (opts) => {
  let base = getMaterialSet(opts);
  opts.color = initial_settings.keys.activeColor;
  opts.background = initial_settings.keys.activeBackground;
  let active = getMaterialSet(opts);
  let materials = [...active, ...base];
  return materials;
};

export const updateMaterials = (mesh, opts) => {
  let base = getMaterialSet(opts);
  mesh.material[2] = base[0];
  mesh.material[3] = base[1];
  setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

export const updateActiveMaterials = (mesh, opts) => {
  opts.color = initial_settings.keys.activeColor;
  opts.background = initial_settings.keys.activeBackground;
  let active = getMaterialSet(opts);
  mesh.material[0] = active[0];
  mesh.material[1] = active[1];
  setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

//simulate highlighting by toggling lightmap intensity
export const enableHighlight = (key_mesh, layer) => {
  key_mesh.material.forEach((m) => (m.lightMapIntensity = 0.2));
};
export const disableHighlight = (key_mesh, layer) => {
  key_mesh.material.forEach((m) => (m.lightMapIntensity = 0));
};
