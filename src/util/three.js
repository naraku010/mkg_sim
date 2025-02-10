import * as THREE from "three";
import {TextureLoader} from "three/src/loaders/TextureLoader.js";

export default class ThreeUtil {
    //get place with texture applied
    static getTexturedPlane(tex) {
        let loader = new TextureLoader();
        let texture = loader.load(tex);
        let material = new THREE.MeshBasicMaterial({
            color: "#ffffff",
            map: texture,
            transparent: true,
        });
        let plane = new THREE.Mesh(new THREE.PlaneGeometry(130, 50), material);
        plane.material.side = THREE.DoubleSide;
        return plane;
    }

    //merge geometries of meshes
    static mergeMeshes(meshes) {
        let material = meshes[0].material;
        let combined = new THREE.BufferGeometry();
        for (var i = 0; i < meshes.length; i++) {
            meshes[i].updateMatrix();
            combined.merge(meshes[i].geometry, meshes[i].matrix);
        }
        let mesh = new THREE.Mesh(combined, material);
        mesh.receiveShadow = meshes[i].receiveShadow;
        mesh.castShadow = meshes[i].castShadow;
        return mesh;
    }

    //create a box mesh with a geometry and material
    static createBox(w, h, l, x, y, z, color) {
        var material = new THREE.MeshLambertMaterial({
            color: color || "#666666",
            fog: false,
        });
        var geom = new THREE.BoxGeometry(w || 10, h || 10, l || 10);
        var mesh = new THREE.Mesh(geom, material);
        mesh.position.set(x || 0, y || 0, z || 0);
        mesh.receiveShadow = false;
        mesh.castShadow = false;
        return mesh;
    }

    //creater box from object
    static createBoxOpts(options) {
        return this.createBox(
            options.w,
            options.h,
            options.l,
            options.x,
            options.y,
            options.z,
            options.color
        );
    }

    static getHighResScreenshot(renderer, scene, camera, scale = 3) {
        const width = renderer.domElement.width * scale;
        const height = renderer.domElement.height * scale;

        // 기존 렌더러의 설정을 유지하면서 새 렌더러 생성
        const tempRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, // 투명 배경 유지
            // preserveDrawingBuffer: true
        });

        tempRenderer.toneMapping = THREE.ACESFilmicToneMapping;  // or ACESFilmicToneMapping
        tempRenderer.toneMappingExposure = 5;
        tempRenderer.physicallyCorrectLights = true; // 물리적으로 정확한 조명 사용
        tempRenderer.outputColorSpace = THREE.SRGBColorSpace;
        tempRenderer.setSize(width, height);
        tempRenderer.setPixelRatio(window.devicePixelRatio);

        // 기존 조명 상태를 유지하도록 렌더러 상태 리셋
        renderer.state.reset();

        // 임시 카메라 (화면 비율 조정)
        const tempCamera = camera.clone();
        tempCamera.aspect = width / height;
        tempCamera.updateProjectionMatrix();

        // 기존 배경을 투명하게 만들기
        const prevBackground = scene.background;
        scene.background = null; // 배경 투명화

        // 캡처 렌더링
        tempRenderer.render(scene, tempCamera);
        const dataURL = tempRenderer.domElement.toDataURL("image/webp");

        // 배경 복구
        scene.background = prevBackground;

        // 이미지 표시
        let image = document.createElement("img");
        image.src = dataURL;
        let w = window.open("about:blank");
        w.document.write(image.outerHTML);
        w.document.close();
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "screenshot.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // 메모리 정리
        tempRenderer.dispose();
    }

}
