const modules = import.meta.glob('./*.json', {eager: true});

const KC_DOMIKEY = {};

for (const path in modules) {
  const key = path.replace('./', '').replace('.json', ''); // 파일명만 추출
  KC_DOMIKEY[key] = modules[path];
}

export {KC_DOMIKEY};
