import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ALLGLB from "./r1_100.glb";
const loader = new GLTFLoader();
let cachedKeycapMeshes = null;

function preloadKeycapMeshes() {
    return new Promise((resolve, reject) => {
        loader.load(
            ALLGLB,
            (gltf) => {
                const meshes = [];
                console.log(gltf);
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        meshes.push(child);
                    }
                });
                // 캐시에 저장
                cachedKeycapMeshes = meshes;
                console.log("모델 preload 완료");
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
preloadKeycapMeshes().catch((err) => {
    console.error("모델 preload 실패", err);
});
function cloneAndFilterMeshes(filterName) {
    // 캐시된 메쉬들을 클론, 스케일 50,50,50, x축 회전 90도(π/2) 적용
    const clones = cachedKeycapMeshes.map(mesh => {
        const clone = mesh.clone();
        clone.scale.set(50, 50, 50);
        clone.rotation.x = Math.PI / 2;
        // 디버그용으로 클론의 이름 출력
        return clone;
    });

    // filterName이 전달되었으면 문자열 또는 문자열 배열을 기준으로 필터링
    if (filterName) {
        if (Array.isArray(filterName)) {
            // 필터 배열에 해당하는 이름이 맞는지 확인
            const filtered = clones.filter(mesh => {
                const result = filterName.includes(mesh.name);
                return result;
            });
            return filtered;
        } else if (typeof filterName === 'string') {
            const filtered = clones.filter(mesh => mesh.name === filterName);
            return filtered;
        }
    }
    // filterName이 없으면 모든 클론 반환
    return clones;
}
export function loadMaterialFromGLB() {
    return new Promise((resolve, reject) => {
        loader.load(
            ALLGLB,
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
export function loadMeshFromGLB(filterName) {
    return new Promise((resolve, reject) => {
        if (!cachedKeycapMeshes) {
            preloadKeycapMeshes()
                .then(() => {
                    resolve(cloneAndFilterMeshes(filterName));
                })
                .catch(reject);
        } else {
            resolve(cloneAndFilterMeshes(filterName));
        }
    });
}


