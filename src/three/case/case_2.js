import * as THREE from "three";
import store from "../../store/store";
import holes from "./holes";

export default (layout, color) => {
  color = color || "#cccccc";
  let cornerRadius = 0;
  let bevel = 0.04;
  let bezel = 0.25;
  let height = 1;
  let width = layout.width + bezel * 2;
  let depth = layout.height + bezel * 2;
  let size = store.getState().case.layout;

  // Create shape for extrusion
  let shape = new THREE.Shape();
  shape.moveTo(0, cornerRadius);
  shape.lineTo(width - cornerRadius, 0);
  shape.lineTo(width, depth - cornerRadius);
  shape.lineTo(cornerRadius, depth);
  shape.lineTo(0, cornerRadius);

  // Define holes in the shape
  shape.holes = holes(size, layout, bezel);

  // Extrude geometry options
  let extrudeOptions = {
    depth: height,
    steps: 1,
    bevelSegments: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
  };

  // Create extruded geometry using BufferGeometry
  let geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

  // Modify vertices if necessary
  const positionAttribute = geometry.getAttribute("position");
  for (let i = 0; i < positionAttribute.count; i++) {
    let z = positionAttribute.getZ(i);
    let y = positionAttribute.getY(i);

    if (z > 0.5 && y < 0.7) {
      if (depth > 6) {
        positionAttribute.setZ(i, z + 0.67);
      } else if (depth > 5) {
        positionAttribute.setZ(i, z + 0.55);
      } else {
        positionAttribute.setZ(i, z + 0.5);
      }
    }
  }

  geometry.computeVertexNormals();

  // Create a multi-material mesh
  const materials = [
    new THREE.MeshBasicMaterial({ color: color }), // Front/Back
    new THREE.MeshBasicMaterial({ color: 0x999999 }) // Sides
  ];

  const mesh = new THREE.Mesh(geometry, materials);
  mesh.name = "CASE";
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(-bezel, 0, -bezel);

  return mesh;
};
