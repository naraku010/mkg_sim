const modules = import.meta.glob('./*.json', {eager: true});

const KC_KEYCOBO = {};

for (const path in modules) {
    const key = path.replace('./', '').replace('.json', ''); // 파일명만 추출
    KC_KEYCOBO[key] = modules[path];
}

export {KC_KEYCOBO};
