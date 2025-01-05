import * as THREE from "three";
import store from "../../store/store";
import holes from "./holes";

export default (layout, color) => {
  // 기본값 설정
  color = color || "#cccccc";
  let cornerRadius = 0.3; // 코너 반경을 아주 작게 설정
  let bevel = 0.015;
  let bezel = 0.2;
  let height = 1;
  let width = layout.width + bezel * 2;
  let depth = layout.height + bezel * 2;
  let size = store.getState().case.layout;

  // Shape 생성
  let shape = new THREE.Shape();

  // 약간의 곡선 추가
  shape.moveTo(cornerRadius, 0);
  shape.lineTo(width - cornerRadius, 0);
  shape.quadraticCurveTo(width, 0, width, cornerRadius);
  shape.lineTo(width, depth - cornerRadius);
  shape.quadraticCurveTo(width, depth, width - cornerRadius, depth);
  shape.lineTo(cornerRadius, depth);
  shape.quadraticCurveTo(0, depth, 0, depth - cornerRadius);
  shape.lineTo(0, cornerRadius);
  shape.quadraticCurveTo(0, 0, cornerRadius, 0);

  // 홀 추가
  shape.holes = holes(size, layout, bezel);

  // Extrude 옵션
  let extrudeOptions = {
    depth: height,
    steps: 1,
    bevelSegments: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
  };

  // Geometry 생성
  let geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

  // 그룹화 처리
  function groupGeometry(geometry) {
    // geometry.index가 없을 경우 처리
    if (!geometry.index) {
      console.warn("geometry.index is null, converting to non-indexed geometry...");
      geometry = geometry.toNonIndexed();
    }

    geometry.clearGroups(); // 기존 그룹 제거

    const faceCount = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3; // 전체 face 수
    const capFaces = faceCount / 2; // 상판/하판의 face 개수

    // 상판 그룹 추가
    geometry.addGroup(0, capFaces * 3, 0); // 첫 번째 재질 그룹 (상판/하판)
    // 측면 그룹 추가
    geometry.addGroup(capFaces * 3, (faceCount - capFaces) * 3, 1); // 두 번째 재질 그룹 (측면)
  }

  // UV 매핑 생성 함수 - 상판/하판
  function generateUVsForCaps(geometry) {
    const positionAttribute = geometry.getAttribute("position");
    const uvAttribute = [];

    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;

    const min = boundingBox.min;
    const max = boundingBox.max;

    const range = new THREE.Vector3();
    range.subVectors(max, min);

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);

      const u = (x - min.x) / range.x; // U 좌표
      const v = (y - min.y) / range.y; // V 좌표

      uvAttribute.push(u, v);
    }

    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvAttribute, 2));
  }

  // UV 매핑 생성 함수 - 측면
  function generateUVsForSides(geometry) {
    const positionAttribute = geometry.getAttribute("position");
    const uvAttribute = [];

    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;

    const min = boundingBox.min;
    const max = boundingBox.max;

    const range = new THREE.Vector3();
    range.subVectors(max, min);

    for (let i = 0; i < positionAttribute.count; i++) {
      const z = positionAttribute.getZ(i);
      const y = positionAttribute.getY(i);

      const u = (z - min.z) / range.z; // U 좌표
      const v = (y - min.y) / range.y; // V 좌표

      uvAttribute.push(u, v);
    }

    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvAttribute, 2));
  }

  // 그룹화
  groupGeometry(geometry);

  // UV 매핑 생성
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  // 상판/하판 UV 매핑
  generateUVsForCaps(geometry);

  // 측면 UV 매핑
  generateUVsForSides(geometry);

  // 법선 계산
  geometry.computeVertexNormals();

  // 재질 생성
  const materials = [
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.1 }), // 상판/하판
    new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.5, metalness: 0.1 }) // 측면
  ];

  // Mesh 생성
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.name = "CASE";
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(-bezel, 0, -bezel);

  return mesh;
};
