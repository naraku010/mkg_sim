const modules = import.meta.glob('./*.json', {eager: true});

const KC_JTK = {};

for (const path in modules) {
  const key = path.replace('./', '').replace('.json', ''); // 파일명만 추출
  KC_JTK[key] = modules[path];
}

export {KC_JTK};
