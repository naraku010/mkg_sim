import * as THREE from 'three';
import DMKDeicide from '../assets/mat/DMK_Deicide.webp';
import DMKUnicorn from '../assets/mat/DMK_Unicorn.webp';
import GMKEuler from '../assets/mat/GMK_Euler.webp';
import GMKFoundation from '../assets/mat/GMK_Foundation.webp';
import GMKMaestro from '../assets/mat/GMK_Maestro.webp';
import KNCKeysRunGo from '../assets/mat/KNC_Keys_Run_Go.webp';

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
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.imageUrl = null;
        this.mesh = null;
        this.makeGUI();
    }

    loadImageAndCreatePad() {
        const loader = new THREE.TextureLoader();
        loader.load(this.imageUrl, (texture) => {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            const image = texture.image;
            const scale = 30 / image.width * 1.5;  // 이미지 스케일 조정
            const width = image.width * scale;
            const height = image.height * scale;
            const geometry = new RoundedRectangleGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
                map: texture, // 기본 텍스처
                side: THREE.DoubleSide // 양면 모두 렌더링
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.z = 2;
            this.mesh.rotation.x = -Math.PI / 2;
            this.mesh.receiveShadow = true; // 그림자 수신 활성화
            this.mesh.castShadow = true; // 그림자 투사 활성화 (선택적)
            this.scene.add(this.mesh);
        });
    }
    makeGUI(imageUrl = this.imageUrl) {
        const target = this;
        const folder = this.gui.addFolder('장패드');
        const images = {
            'DMK Deicide': DMKDeicide,
            'DMK Unicorn': DMKUnicorn,
            'GMK Euler': GMKEuler,
            'GMK Foundation': GMKFoundation,
            'GMK Maestro Girl': GMKMaestro,
            'KNC Keys Run Go': KNCKeysRunGo
        };
        const params = {
            scale: 1.5,
            positionX: 0,
            positionY: 0,
            selectedImage: '',
            uploadImage: () => {
                // 파일 업로드를 위한 input 엘리먼트를 동적으로 생성하고 클릭
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/jpeg, image/png, image/webp';
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            target.destroy();// 기존 메쉬 제거
                            target.imageUrl = e.target.result;
                            target.loadImageAndCreatePad();
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            }
        };
        folder.add(params, 'selectedImage', Object.keys(images)).name('Swagkey Deskmat').onChange((value) => {
            this.imageUrl = images[value];
            target.destroy();
            this.loadImageAndCreatePad();
        });
        folder.add(params, 'scale', 0.1, 5).name('크기조절').onChange((value) => {
            if (this.mesh) {
                this.mesh.scale.set(value, value, 1.5); // 스케일 조정
            }
        });
        folder.add(params, 'positionX', -50, 50).name('좌우 위치').onChange((value) => {
            if (this.mesh) {
                this.mesh.position.x = value; // X 위치 조정
            }
        });
        folder.add(params, 'positionY', -50, 50).name('상하 위치').onChange((value) => {
            if (this.mesh) {
                this.mesh.position.z = value; // Z 위치 조정
            }
        });
        folder.add(params, 'uploadImage').name('장패드 이미지 업로드');
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
