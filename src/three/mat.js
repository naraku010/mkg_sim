import * as THREE from "three";

export default class RoundedMatPad {
    constructor(scene, width, height, radius, imagePath) {
        this.scene = scene;  // 장면 객체를 받아옴
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.imagePath = imagePath;

        // 메쉬 생성
        this.mesh = this.createMatPad();

        // 장면에 추가
        this.addToScene();
    }

    createMatPad() {
        // 테두리가 둥근 직사각형 모양 정의
        const shape = new THREE.Shape();
        shape.moveTo(-this.width / 2 + this.radius, -this.height / 2);
        shape.lineTo(this.width / 2 - this.radius, -this.height / 2);
        shape.quadraticCurveTo(this.width / 2, -this.height / 2, this.width / 2, -this.height / 2 + this.radius);
        shape.lineTo(this.width / 2, this.height / 2 - this.radius);
        shape.quadraticCurveTo(this.width / 2, this.height / 2, this.width / 2 - this.radius, this.height / 2);
        shape.lineTo(-this.width / 2 + this.radius, this.height / 2);
        shape.quadraticCurveTo(-this.width / 2, this.height / 2, -this.width / 2, this.height / 2 - this.radius);
        shape.lineTo(-this.width / 2, -this.height / 2 + this.radius);
        shape.quadraticCurveTo(-this.width / 2, -this.height / 2, -this.width / 2 + this.radius, -this.height / 2);

        // ShapeGeometry 생성
        const geometry = new THREE.ShapeGeometry(shape);

        // 텍스처 로드
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(this.imagePath, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;  // 수평 방향 래핑
            texture.wrapT = THREE.RepeatWrapping;  // 수직 방향 래핑

            // 장패드 크기에 맞게 텍스처 반복 비율 설정
            texture.repeat.set(1, 1);  // 1은 한 번씩만 매핑되도록 설정, 필요 시 조정
        });

        // 재질 생성
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // 메쉬 생성
        const matPad = new THREE.Mesh(geometry, material);

        // 위치와 회전 설정 (필요 시)
        matPad.position.set(0, 0, -100);  // 예시 위치
        matPad.rotation.x = -Math.PI / 2;  // 필요 시 회전

        return matPad;
    }

    addToScene() {
        this.scene.add(this.mesh);  // 장면에 메쉬 추가
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.mesh.rotation.set(x, y, z);
    }
}