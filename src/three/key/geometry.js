import * as THREE from "three";

const GUTTER = 0.05;
const c = 0.05; // corner inset
const i = 0.15; // inset
const it = 0.05; // inset top edge

// stores geometry for each possible size
var computed_geometries = {};

const lowerCapFace = (geometry, dist, distFront, offset) => {
  distFront = distFront || dist;
  offset = offset || 0;
  const position = geometry.attributes.position.array;

  position[12 * 3 + 1] -= dist; // vertices[4]
  position[13 * 3 + 1] -= dist + offset; // vertices[5]
  position[14 * 3 + 1] -= dist + offset; // vertices[6]
  position[15 * 3 + 1] -= dist; // vertices[7]
  position[16 * 3 + 1] -= distFront; // vertices[8]
  position[17 * 3 + 1] -= distFront - offset; // vertices[9]
  position[18 * 3 + 1] -= distFront - offset; // vertices[10]
  position[19 * 3 + 1] -= distFront; // vertices[11]

  geometry.attributes.position.needsUpdate = true;
  return geometry;
};

// geometry for rectangle key
export const keyGeometry = (opts) => {
  let key = `test${opts.w}${opts.h}${opts.row}`;
  if (computed_geometries[key]) {
    return computed_geometries[key].clone();
  }

  let w = (opts.w || 1) - GUTTER;
  let d = opts.h - GUTTER;
  let h = 0.5;

  const vertices = new Float32Array([
    // Bottom vertices
    0, 0, 0,  // 0
    w, 0, 0,  // 1
    w, 0, d,  // 2
    0, 0, d,  // 3
    // Top vertices
    i, h, it + c,  // 4
    i + c, h, it,  // 5
    w - i - c, h, it,  // 6
    w - i, h, it + c,  // 7
    w - i, h, d - i - c,  // 8
    w - i - c, h, d - i,  // 9
    i + c, h, d - i,  // 10
    i, h, d - i - c  // 11
  ]);

  const indices = [
    // Top faces
    4, 7, 5, 7, 6, 5, 9, 11, 10, 9, 8, 11, 4, 11, 7, 8, 7, 11,
    // Corner faces
    0, 4, 5, 1, 6, 7, 2, 8, 9, 3, 10, 11,
    // Side faces
    0, 5, 1, 1, 5, 6, 2, 7, 8, 2, 1, 7, 0, 3, 11, 0, 11, 4, 3, 2, 9, 3, 9, 10
  ];

  const uv = new Float32Array([
    // UVs for bottom and top vertices
    0, 0,   // 0
    1, 0,   // 1
    1, 1,   // 2
    0, 1,   // 3
    0, 0.9, // 4
    0.1, 1, // 5
    0.9, 1, // 6
    1, 0.9, // 7
    1, 0.1, // 8
    0.9, 0, // 9
    0.1, 0, // 10
    0, 0.1  // 11
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.computeVertexNormals();

  // Optional transformations based on row and height
  if (opts.h === 2 && opts.w < 1.25) {
    lowerCapFace(geometry, 0.1);
  }
  if (opts.row === 1) {
    lowerCapFace(geometry, -0.05);
  }
  if (opts.row === 2 && opts.h !== 2) {
    lowerCapFace(geometry, 0.1);
  }
  if (opts.row === 3 && opts.h !== 2) {
    lowerCapFace(geometry, 0.1);
    geometry.rotateX(-0.1);
    geometry.translate(0, -0.1, 0);
  }
  if (opts.row === 4 && opts.h !== 2) {
    geometry.rotateX(-0.2);
    geometry.translate(0, -0.19, 0);
  }

  computed_geometries[key] = geometry;
  return geometry;
};

// Geometry for ISO Enter key
export const keyGeometryISOEnter = (opts) => {
  if (computed_geometries["isoent"]) {
    return computed_geometries["isoent"].clone();
  }

  let w = (opts.w || 1) - GUTTER;
  let d = opts.h - GUTTER;
  let h = 0.4;
  let o = 0.25; // extra width for top

  const vertices = new Float32Array([
    // Bottom vertices
    -o, 0, 0,  // 0
    w, 0, 0,  // 1
    w, 0, d,  // 2
    0, 0, d,  // 3
    0, 0, 1,  // 4
    -o, 0, 1,  // 5
    // Top vertices
    i - o, h, it + c,  // 6
    i + c - o, h, it,  // 7
    w - i - c, h, it,  // 8
    w - i, h, it + c,  // 9
    w - i, h, d - i - c,  // 10
    w - i - c, h, d - i,  // 11
    i + c, h, d - i,  // 12
    i, h, d - i - c,  // 13
    i, h, 1 - i,  // 14
    i - c, h, 1 - i,  // 15
    i + c - o, h, 1 - i,  // 16
    i - o, h, 1 - i - c  // 17
  ]);

  const indices = [
    // Top faces
    6, 9, 7, 9, 8, 7, 17, 15, 16, 17, 14, 15, 6, 17, 9, 15, 9, 14,
    // Corner faces
    0, 6, 7, 1, 8, 9, 2, 10, 11, 3, 12, 13, 4, 14, 15, 5, 16, 17,
    // Side faces
    0, 7, 8, 0, 8, 1, 9, 10, 2, 9, 2, 1, 3, 2, 11, 3, 11, 12, 4, 3, 13, 4, 13, 14
  ];

  const uv = new Float32Array([
    // UVs for bottom and top vertices
    0, 0,   // 0
    1, 0,   // 1
    1, 1,   // 2
    0, 1,   // 3
    0, 0.9, // 4
    0.1, 1, // 5
    0.9, 1, // 6
    1, 0.9, // 7
    1, 0.1, // 8
    0.9, 0, // 9
    0.1, 0, // 10
    0, 0.1  // 11
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.computeVertexNormals();

  computed_geometries["isoent"] = geometry;
  return geometry;
};
