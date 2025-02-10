const modules = import.meta.glob('./*.json', {eager: true});

const KC_ETC = {};

for (const path in modules) {
    const key = path.replace('./', '').replace('.json', ''); // 파일명만 추출
    KC_ETC[key] = modules[path];
}

export {KC_ETC};
