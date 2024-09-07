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

  //create geometry
  let shape = new THREE.Shape();

  //basic outline
  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width, depth);
  shape.lineTo(width * 0.7, depth);
  shape.lineTo(width * 0.5, depth + 0.7);
  shape.lineTo(width * 0.3, depth);
  shape.lineTo(0, depth);
  shape.lineTo(0, 0);

  shape.holes = holes(size, layout, bezel);

  let extrudeOptions = {
    depth: height,
    steps: 1,
    bevelSegments: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
  };

  let geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

  let positionAttribute = geometry.getAttribute("position");

  // Update the vertices based on the new geometry format
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

  geometry.computeVertexNormals(); // To ensure normals are updated after modifying vertices

  // Materials for the case
  let materials = [
    new THREE.MeshBasicMaterial({ color: color }), // Top/bottom
    new THREE.MeshBasicMaterial({ color: 0x000000 }), // Sides
  ];

  // Create mesh
  let mesh = new THREE.Mesh(geometry, materials);
  mesh.name = "CASE";
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(-bezel, 0, -bezel);

  return mesh;
};
