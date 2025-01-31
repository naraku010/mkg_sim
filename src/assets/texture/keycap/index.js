import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import R1GLB from "./row_1.glb";
import R2GLB from "./row_2.glb";
import R3GLB from "./row_3.glb";
import R4GLB from "./row_4.glb";
const loader = new GLTFLoader();

// GLB 파일을 불러오는 함수 (비동기)
export const R1 = () =>
    new Promise((resolve, reject) => {
        loader.load(R1GLB, resolve, undefined, reject);
    });
export const R2 = () =>
    new Promise((resolve, reject) => {
        loader.load(R2GLB, resolve, undefined, reject);
    });

export const R3 = () =>
    new Promise((resolve, reject) => {
        loader.load(R3GLB, resolve, undefined, reject);
    });

export const R4 = () =>
    new Promise((resolve, reject) => {
        loader.load(R4GLB, resolve, undefined, reject);
    });

export function loadMaterialFromGLB() {
    return new Promise((resolve, reject) => {
        loader.load(
            R1GLB,
            (gltf) => {
                const materials = [];
                gltf.scene.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (!materials.includes(child.material)) {
                            materials.push(child.material);
                        }
                    }
                });
                resolve(materials);
            },
            undefined,
            reject
        );
    });
}

export function loadMeshFromGLB() {
    return new Promise((resolve, reject) => {

        loader.load(
            R1GLB,
            (gltf) => {
                const meshes = [];
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        meshes.push(child);
                    }
                });

                resolve(meshes);
            },
            undefined,
            (error) => {
                console.error("❌ GLB 로드 중 에러 발생:", error);
                reject(error);
            }
        );
    });
}
