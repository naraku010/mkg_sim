const modules = import.meta.glob('./*.json', {eager: true});

const KC_DCS = {};

for (const path in modules) {
  const key = path.replace('./', '').replace('.json', ''); // 파일명만 추출
  KC_DCS[key] = modules[path];
}

export {KC_DCS};
