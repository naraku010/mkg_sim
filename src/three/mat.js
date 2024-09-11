import * as THREE from 'three';
// import FabricNormal from '../assets/texture/normal/fabric_normal.jpg'
class RoundedRectangleGeometry extends THREE.BufferGeometry {
    constructor(width, height, depth = 0.1) {
        super();

        const radius = Math.min(width, height) * 0.05;

        const shape = new THREE.Shape()
            .moveTo(-width / 2 + radius, -height / 2)
            .lineTo(width / 2 - radius, -height / 2)
            .quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius)
            .lineTo(width / 2, height / 2 - radius)
            .quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2)
            .lineTo(-width / 2 + radius, height / 2)
            .quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius)
            .lineTo(-width / 2, -height / 2 + radius)
            .quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

        const extrudeSettings = {
            depth: depth,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 2,
            curveSegments: 12
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.computeVertexNormals();

        const vertices = geometry.attributes.position.array;
        const uv = new THREE.Float32BufferAttribute(vertices.length / 3 * 2, 2);
        geometry.setAttribute('uv', uv);

        const uvAttribute = geometry.attributes.uv;

        for (let i = 0; i < vertices.length; i += 9) { // 각 면마다 3개의 버텍스가 있음
            const z1 = vertices[i + 2];
            const z2 = vertices[i + 5];
            const z3 = vertices[i + 8];

            if (z1 > 0.05 && z2 > 0.05 && z3 > 0.05) { // 윗면의 Z 값 기준
                const x1 = vertices[i], y1 = vertices[i + 1];
                const x2 = vertices[i + 3], y2 = vertices[i + 4];
                const x3 = vertices[i + 6], y3 = vertices[i + 7];

                // Y 좌표 반전
                uvAttribute.setXY(i / 3, 0.5 + (x1 / width), 0.5 + (y1 / height));
                uvAttribute.setXY(i / 3 + 1, 0.5 + (x2 / width), 0.5 + (y2 / height));
                uvAttribute.setXY(i / 3 + 2, 0.5 + (x3 / width), 0.5 + (y3 / height));
            }
        }
        uvAttribute.needsUpdate = true;

        this.copy(geometry);
    }
}


export default class RoundedMatPad {
    constructor(scene, imageUrl) {
        this.scene = scene;
        this.imageUrl = imageUrl;
        this.mesh = null;
        this.loadImageAndCreatePad();
    }

    loadImageAndCreatePad() {
        const loader = new THREE.TextureLoader();
        // const normalMap = loader.load(FabricNormal, (texture) => {
        //     // 노멀 맵의 반복을 조정하여 질감을 촘촘하게 만듭니다.
        //     texture.wrapS = THREE.RepeatWrapping;
        //     texture.wrapT = THREE.RepeatWrapping;
        //     texture.repeat.set(50, 50);  // 텍스처 반복 횟수를 높입니다.
        // });
        loader.load(this.imageUrl, (texture) => {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            const image = texture.image;
            const scale = 30 / image.width;  // 이미지 스케일 조정

            const width = image.width * scale;
            const height = image.height * scale;
            const geometry = new RoundedRectangleGeometry(width, height);
            const material = new THREE.MeshStandardMaterial({
                map: texture, // 기본 텍스처
                // normalMap: normalMap, // 노멀 맵
                roughness: 0.9, // 고무의 거칠기
                metalness: 0.1, // 금속성 없음
                side: THREE.DoubleSide
            });
            this.mesh = new THREE.Mesh(geometry, material);

            this.mesh.position.z = 2;
            this.mesh.rotation.x = -Math.PI / 2;
            this.scene.add(this.mesh);
        });
    }

    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}
