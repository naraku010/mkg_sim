import * as THREE from "three";
import store from "../../store/store";
import holes from "./holes";

export default (layout, color) => {
    color = color || "#cccccc";
    let cornerRadius = 0.5;
    let bevel = 0.05;
    let bezel = 0.5;
    let height = 1;
    let width = layout.width + bezel * 2;
    let depth = layout.height + bezel * 2;
    let size = store.getState().case.layout;

    // create geometry
    let shape = new THREE.Shape();

    // basic outline
    shape.moveTo(0, cornerRadius);
    shape.quadraticCurveTo(0, 0, cornerRadius, 0);
    shape.lineTo(width - cornerRadius, 0);
    shape.quadraticCurveTo(width, 0, width, cornerRadius);
    shape.lineTo(width, depth - cornerRadius);
    shape.quadraticCurveTo(width, depth, width - cornerRadius, depth);
    shape.lineTo(cornerRadius, depth);
    shape.quadraticCurveTo(0, depth, 0, depth - cornerRadius);
    shape.lineTo(0, cornerRadius);

    shape.holes = holes(size, layout, bezel);

    // Extrude options
    let extrudeOptions = {
        depth: height,
        steps: 1,
        bevelSegments: 1,
        bevelEnabled: true,
        bevelSize: bevel,
        bevelThickness: bevel,
    };

    let geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

    // UV 매핑을 위해 bounding box를 계산
    geometry.computeBoundingBox();
    const max = geometry.boundingBox.max;
    const min = geometry.boundingBox.min;
    const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    const range = new THREE.Vector2(max.x - min.x, max.y - min.y);

    const uvAttribute = geometry.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
        const u = uvAttribute.getX(i);
        const v = uvAttribute.getY(i);
        uvAttribute.setXY(i, (u + offset.x) / range.x, (v + offset.y) / range.y);
    }
    uvAttribute.needsUpdate = true;

    // 메쉬 생성
    const material = new THREE.MeshStandardMaterial({
        color: color,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = "CASE";
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(-bezel, 0, -bezel);

    return mesh;
};
