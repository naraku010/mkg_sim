import * as THREE from "three";
import LEGENDS from "../../config/legends/primary/primary";
import SUBS from "../../config/legends/subs/subs";
import KeyUtil from "../../util/keyboard";

const darkenColor = (color, amount) => {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  let num = parseInt(color, 16);
  let r = (num >> 16) - Math.round(255 * amount);
  let g = ((num >> 8) & 0x00FF) - Math.round(255 * amount);
  let b = (num & 0x0000FF) - Math.round(255 * amount);

  r = r < 0 ? 0 : r;
  g = g < 0 ? 0 : g;
  b = b < 0 ? 0 : b;

  return (usePound ? "#" : "") + (r.toString(16).padStart(2, "0")) + (g.toString(16).padStart(2, "0")) + (b.toString(16).padStart(2, "0"));
};
// 텍스처를 고해상도로 생성하고 그라데이션을 제거
export const keyTexture = (opts) => {
  let w = opts.w;
  let h = opts.h;
  let legend = opts.legend;
  let sublegend = opts.sub;
  let key = opts.code;
  let pxPerU = 128;
  const pixelRatio = window.devicePixelRatio || 1;  // 고해상도를 위한 픽셀 비율 사용
  let subColor = opts.subColor || opts.color;
  let fg = opts.color;

  // ISO Enter 키 처리
  let isIsoEnter = key === "KC_ENT" && h > 1;
  if (isIsoEnter) {
    w = w + 0.25;
  }

  // 캔버스 생성 및 해상도 조정
  let canvas = document.createElement("canvas");
  canvas.width = pxPerU * w * pixelRatio;  // 픽셀 비율 적용
  canvas.height = pxPerU * h * pixelRatio;  // 픽셀 비율 적용

  let ctx = canvas.getContext("2d");

  // 고해상도 스케일링 적용
  ctx.scale(pixelRatio, pixelRatio);

  // 배경색 그리기
  ctx.fillStyle = darkenColor(opts.background, .15);
  ctx.fillRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

  let l = LEGENDS[legend];
  let mainChar = l?.chars[key] || "";

  // 1u Backspace 및 Enter 처리
  if (key === "KC_BSPC" && w <= 1) {
    mainChar = l?.chars["KC_BSISO"];
  }
  if ((key === "KC_ENT" && w <= 1) || isIsoEnter) {
    mainChar = l?.chars["KC_ENISO"];
  }

  let modWord = !l.encoded && mainChar.length > 1;
  let subChar = SUBS[sublegend]?.chars[key] || "";

  // 유니코드 값 처리 (커스텀 폰트를 위한 인코딩)
  mainChar =
      l.encoded && mainChar.length > 1
          ? String.fromCharCode(parseInt(mainChar, 16))
          : mainChar;

  // 폰트 크기 설정
  let fontScaler = 1;
  if (mainChar["top"]) fontScaler = 1 / 2;  // 숫자 키 등 두 개의 문자
  if (!mainChar["top"] && modWord) fontScaler = 1 / 4;  // 텍스트가 있는 키
  let fontSize = l.fontsize * (fontScaler + 0.25);

  // 폰트 스타일 설정
  if (modWord) {
    ctx.font = `700 ${fontSize}px ${l.fontFamily}`;
  } else {
    ctx.font = `${fontSize}px ${l.fontFamily}`;
  }
  ctx.fillStyle = fg;

  if (l.centered) {
    ctx.textAlign = "center";
    l.offsetX = (w * pxPerU) / 2;
  } else {
    ctx.textAlign = "left";
  }

  let ent_off_x = 0;
  let ent_off_y = 0;
  if (isIsoEnter) {
    ent_off_x = 15;
    ent_off_y = 6;
  }

  // 텍스트 그리기
  if (mainChar["top"]) {
    ctx.fillText(mainChar.top, l.offsetX, l.offsetY + l.yOffsetTop);
    ctx.fillText(mainChar.bottom, l.offsetX, l.offsetY + l.yOffsetBottom);
  } else {
    ctx.fillText(
        mainChar,
        l.offsetX + ent_off_x,
        l.fontsize + (KeyUtil.isAlpha(key) ? l.offsetY : l.yOffsetMod) + ent_off_y
    );
  }

  // 서브 텍스트 그리기
  if (sublegend && subChar && l.subsSupported) {
    let sub = SUBS[sublegend];
    let multiplier = sub.fontSizeMultiplier * 0.35;
    ctx.fillStyle = subColor || fg;
    ctx.font = `bold ${pxPerU * multiplier}px ${sub.fontFamily}`;
    if (subChar?.top) {
      ctx.fillText(subChar.top, pxPerU * 0.55, pxPerU * 0.4);
      ctx.fillText(subChar.bottom, pxPerU * 0.55, pxPerU * 0.8);
    } else {
      ctx.fillText(subChar, pxPerU * 0.55, pxPerU * 0.8);
    }
  }

  // 고해상도 텍스처 생성
  let texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;  // 고해상도 축소 필터링
  texture.magFilter = THREE.LinearFilter;  // 고해상도 확대 필터링
  texture.generateMipmaps = true;  // Mipmap 생성
  texture.needsUpdate = true;

  return texture;
};
