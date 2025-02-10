const modules = import.meta.glob('./*.json', {eager: true});

const KC_PBTFANS = {};

for (const path in modules) {
  const key = path.replace('./', '').replace('.json', ''); // 파일명만 추출
  KC_PBTFANS[key] = modules[path];
}

export {KC_PBTFANS};
