import * as THREE from "three";

const GUTTER = 0.03;
const c = 0.05; // corner inset
const i = 0.15; // inset
const it = 0.01; // inset top edge
const CHAMFER = 0.01; // chamfer amount for rounding edges
const CURVE_DEPTH = 0.01; // depth of top curve for realistic keycap

var computed_geometries = {};

// Apply chamfer to keycap edges for realism
const applyChamfer = (geometry, chamfer) => {
    const position = geometry.attributes.position.array;
    for (let j = 0; j < position.length; j += 3) {
        if (position[j + 1] > 0) {
            position[j + 1] -= chamfer;
        }
    }
    geometry.attributes.position.needsUpdate = true;
    return geometry;
};

// Apply curvature to the top surface
const applyTopCurve = (geometry, depth) => {
    const position = geometry.attributes.position.array;
    for (let j = 12; j < 24; j++) {
        position[j * 3 + 1] -= depth * Math.cos((j - 12) * Math.PI / 6);
    }
    geometry.attributes.position.needsUpdate = true;
    return geometry;
};

// Keycap geometry
export const keyGeometry = (opts) => {
    let key = `key${opts.w}${opts.h}${opts.row}`;
    if (computed_geometries[key]) {
        return computed_geometries[key].clone();
    }

    let w = (opts.w || 1) - GUTTER;
    let d = opts.h - GUTTER;
    let h = 0.5;

    const vertices = new Float32Array([
        // Bottom vertices
        0, 0, 0, w, 0, 0, w, 0, d, 0, 0, d,
        // Top vertices (curved and chamfered)
        i, h - CURVE_DEPTH, it + c,
        i + c, h - CURVE_DEPTH, it,
        w - i - c, h - CURVE_DEPTH, it,
        w - i, h - CURVE_DEPTH, it + c,
        w - i, h - CURVE_DEPTH, d - i - c,
        w - i - c, h - CURVE_DEPTH, d - i,
        i + c, h - CURVE_DEPTH, d - i,
        i, h - CURVE_DEPTH, d - i - c
    ]);

    const indices = [
        // Top faces
        4, 7, 5, 7, 6, 5, 9, 11, 10, 9, 8, 11, 4, 11, 7, 8, 7, 11,
        // Side faces
        0, 4, 5, 1, 6, 7, 2, 8, 9, 3, 10, 11, 0, 5, 1, 1, 5, 6, 2, 7, 8, 2, 1, 7, 0, 3, 11, 0, 11, 4, 3, 2, 9, 3, 9, 10
    ];

    const uv = new Float32Array([
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0.9, 0.1, 1, 0.9, 1, 1, 0.9,
        1, 0.1, 0.9, 0, 0.1, 0, 0, 0.1
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.computeVertexNormals();

    // Apply realistic effects
    applyChamfer(geometry, CHAMFER);
    applyTopCurve(geometry, CURVE_DEPTH);

    computed_geometries[key] = geometry;
    return geometry;
};

// Geometry for ISO Enter key
export const keyGeometryISOEnter = (opts) => {
    if (computed_geometries['isoent']) {
        return computed_geometries['isoent'].clone();
    }

    let w = (opts.w || 1) - GUTTER;
    let d = opts.h - GUTTER;
    let h = 0.4;

    // extra width of the top
    let o = 0.25;

    const vertices = [
        // bottom vertices
        -o, 0, 0,      // 0
        w, 0, 0,       // 1
        w, 0, d,       // 2
        0, 0, d,       // 3
        0, 0, 1,       // 4
        -o, 0, 1,      // 5
        // top vertices
        i - o, h, it + c,         // 6
        i + c - o, h, it,         // 7
        w - i - c, h, it,         // 8
        w - i, h, it + c,         // 9
        w - i, h, d - i - c,      // 10
        w - i - c, h, d - i,      // 11
        i + c, h, d - i,          // 12
        i, h, d - i - c,          // 13
        i, h, 1 - i,              // 14
        i - c, h, 1 - i,          // 15
        i + c - o, h, 1 - i,      // 16
        i - o, h, 1 - i - c       // 17
    ];

    const indices = [
        // top faces
        6, 9, 7, 7, 9, 8,
        6, 17, 15, 17, 16, 15,
        6, 15, 9, 15, 14, 9,
        14, 10, 9, 14, 13, 10,
        13, 11, 10, 13, 12, 11,
        // corners
        0, 6, 7, 1, 8, 9,
        2, 10, 11, 3, 12, 13,
        4, 14, 15, 5, 16, 17,
        // sides
        0, 7, 8, 0, 8, 1,
        9, 10, 2, 9, 2, 1,
        3, 2, 11, 3, 11, 12,
        4, 3, 13, 4, 13, 14,
        5, 4, 15, 5, 15, 16,
        0, 5, 17, 0, 17, 6
    ];

    // BufferGeometry setup
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingBox();

    // Get bounding box size and min
    const bbox = geometry.boundingBox;
    const size = bbox.max.clone().sub(bbox.min);  // Get the size of the bounding box
    const min = bbox.min;     // Get the minimum point of the bounding box

    // Create UV mapping based on bounding box
    const uvs = [];
    const positions = geometry.attributes.position.array;

    const UV_OFFSET_U = -.2; // U 방향으로 중앙으로 이동하기 위한 오프셋
    const UV_OFFSET_V = .1;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];

        // 기본 UV 좌표 계산
        const u = (x - min.x) / size.x;
        const v = (z - min.z) / size.z;

        // 스케일 및 오프셋을 적용하고, V 좌표를 반전하여 UV 좌표를 중앙으로 이동
        const uAdjusted = u + UV_OFFSET_U;  // U 값을 오프셋 적용
        const vAdjusted = (1 - v) + UV_OFFSET_V;  // V 값을 반전하고 오프셋 적용

        uvs.push(uAdjusted, vAdjusted);
    }
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    geometry.computeVertexNormals();

    computed_geometries['isoent'] = geometry;
    return geometry;
};
