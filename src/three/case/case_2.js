import * as THREE from "three";
import { mergeBufferGeometries } from "three-stdlib";
import store from "../../store/store";
import holes from "./holes";

const case_2 = (layout, color) => {
  color = color || "#cccccc";
  const cornerRadius = 0.3;
  const bevel = 0.015;
  const bezel = 0.2;
  const height = 1; // 케이스 두께
  const width = layout.width + bezel * 2;
  const depth = layout.height + bezel * 2;
  const size = store.getState().case.layout;

  // ── 메인 케이스 (홀 있음) ──
  const shape = new THREE.Shape();
  shape.moveTo(cornerRadius, 0);
  shape.lineTo(width - cornerRadius, 0);
  shape.quadraticCurveTo(width, 0, width, cornerRadius);
  shape.lineTo(width, depth - cornerRadius);
  shape.quadraticCurveTo(width, depth, width - cornerRadius, depth);
  shape.lineTo(cornerRadius, depth);
  shape.quadraticCurveTo(0, depth, 0, depth - cornerRadius);
  shape.lineTo(0, cornerRadius);
  shape.quadraticCurveTo(0, 0, cornerRadius, 0);
  shape.holes = holes(size, layout, bezel);

  const extrudeOptions = {
    depth: height,
    steps: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
  };

  let mainGeometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

  // ── 하부 (바텀 커버, 홀 없음) ──
  const bottomShape = new THREE.Shape();
  bottomShape.moveTo(cornerRadius, 0);
  bottomShape.lineTo(width - cornerRadius, 0);
  bottomShape.quadraticCurveTo(width, 0, width, cornerRadius);
  bottomShape.lineTo(width, depth - cornerRadius);
  bottomShape.quadraticCurveTo(width, depth, width - cornerRadius, depth);
  bottomShape.lineTo(cornerRadius, depth);
  bottomShape.quadraticCurveTo(0, depth, 0, depth - cornerRadius);
  bottomShape.lineTo(0, cornerRadius);
  bottomShape.quadraticCurveTo(0, 0, cornerRadius, 0);
  // 하부에는 홀 넣지 않음

  const bottomThickness = 0.1;
  const bottomExtrudeOptions = {
    depth: bottomThickness,
    steps: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
  };

  let bottomGeometry = new THREE.ExtrudeGeometry(bottomShape, bottomExtrudeOptions);

  // ── 그룹화, UV 생성 함수 ──
  function groupGeometry(geom) {
    geom.clearGroups();
    const faceCount = geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
    const capFaces = faceCount / 2;
    // 그룹 0: 캡 (상판/하판)
    geom.addGroup(0, capFaces * 3, 0);
    // 그룹 1: 측면
    geom.addGroup(capFaces * 3, (faceCount - capFaces) * 3, 1);
  }

  function generateUVsForCaps(geom) {
    const posAttr = geom.getAttribute("position");
    const uvArray = [];
    geom.computeBoundingBox();
    const bb = geom.boundingBox;
    const min = bb.min;
    const max = bb.max;
    const range = new THREE.Vector3().subVectors(max, min);
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const u = (x - min.x) / range.x;
      const v = (y - min.y) / range.y;
      uvArray.push(u, v);
    }
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvArray, 2));
  }

  function generateUVsForSides(geom) {
    const posAttr = geom.getAttribute("position");
    const uvArray = [];
    geom.computeBoundingBox();
    const bb = geom.boundingBox;
    const min = bb.min;
    const max = bb.max;
    const range = new THREE.Vector3().subVectors(max, min);
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i);
      const y = posAttr.getY(i);
      const u = (z - min.z) / range.z;
      const v = (y - min.y) / range.y;
      uvArray.push(u, v);
    }
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvArray, 2));
  }

  // 그룹과 UV 생성 (메인/하부 각각)
  groupGeometry(mainGeometry);
  mainGeometry.computeBoundingBox();
  mainGeometry.computeBoundingSphere();
  generateUVsForCaps(mainGeometry);
  generateUVsForSides(mainGeometry);
  mainGeometry.computeVertexNormals();

  groupGeometry(bottomGeometry);
  bottomGeometry.computeBoundingBox();
  bottomGeometry.computeBoundingSphere();
  generateUVsForCaps(bottomGeometry);
  generateUVsForSides(bottomGeometry);
  bottomGeometry.computeVertexNormals();

  // ── 메인, 하부 각각 변환 (원래 mesh 설정과 동일)
  // 메인 케이스: x축 90도 회전, (-bezel, 0, -bezel) 위치
  const mainMatrix = new THREE.Matrix4().compose(
      new THREE.Vector3(-bezel, 0, -bezel),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
      new THREE.Vector3(1, 1, 1)
  );
  mainGeometry.applyMatrix4(mainMatrix);

  // 하부: x축 90도 회전, (-bezel, -height, -bezel) 위치
  const bottomMatrix = new THREE.Matrix4().compose(
      new THREE.Vector3(-bezel, -height, -bezel),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
      new THREE.Vector3(1, 1, 1)
  );
  bottomGeometry.applyMatrix4(bottomMatrix);

  // ── 두 지오메트리를 병합 ──
  const mergedGeometry = mergeBufferGeometries([mainGeometry, bottomGeometry], true);

  // 재질 생성 (캡, 측면)
  const materials = [
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.5, metalness: 0.1 }),
  ];

  const mesh = new THREE.Mesh(mergedGeometry, materials);
  mesh.name = "CASE";

  return mesh;
};
export default case_2;
