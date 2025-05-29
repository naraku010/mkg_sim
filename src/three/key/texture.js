import * as THREE from "three";
import LEGENDS from "../../config/legends/primary/primary";
import SUBS from "../../config/legends/subs/subs";
import KeyUtil from "../../util/keyboard";

// 캔버스 텍스쳐를 생성하는 함수 (키 상단용)
export const keyTexture = (opts) => {
    let w = opts.w;
    let h = opts.h;
    let legend = opts.legend;
    let sublegend = opts.sub;
    let key = opts.code;
    let texture;
    // 기본 1U 당 픽셀 수 (옵션으로 덮어쓰기 가능)
    let pxPerU = opts.pxPerU || 256;
    let subColor = opts.subColor || opts.color;
    let fg = opts.color;
    let bg = opts.background;

    // isometric enter(엔터키)일 경우 오버행 보정
    let isIsoEnter = key === "KC_ENT" && h > 1;
    if (isIsoEnter) {
        w = w + 0.25;
    }

    // devicePixelRatio 적용 (고해상도 디스플레이 대응)
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = pxPerU * w * dpr;
    canvas.height = pxPerU * h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // 기본 배경 색 채우기
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, pxPerU * w, pxPerU * h);

    // 글자 정보 설정
    let l = LEGENDS[legend];
    let mainChar = l?.chars[key] || "";

    // 1U 백스페이스나 엔터 보정
    if (key === "KC_BSPC" && w <= 1) {
        mainChar = l?.chars["KC_BSISO"];
    }
    if ((key === "KC_ENT" && w <= 1) || isIsoEnter) {
        mainChar = l?.chars["KC_ENISO"];
    }

    let modWord = !l.encoded && mainChar.length > 1; // modifier 키는 기호 대신 전체 단어 사용
    let subChar = SUBS[sublegend]?.chars[key] || "";

    // 커스텀 폰트 사용 시 unicode 변환
    mainChar =
        l.encoded && mainChar.length > 1
            ? String.fromCharCode(parseInt(mainChar, 16))
            : mainChar;

    // 폰트 크기 결정
    let fontScaler = 1;
    if (mainChar.top) fontScaler = 1 / 2; // 예: 숫자키의 상/하단 텍스트
    if (!mainChar.top && modWord) fontScaler = 1 / 4; // 예: "Enter", "Alt" 등
    let fontSize = l.fontsize * (fontScaler + 0.25);

    // 폰트 스타일 설정
    if (modWord) {
        ctx.font = `700 ${fontSize}px ${l.fontFamily}`;
    } else {
        ctx.font = `${fontSize}px ${l.fontFamily}`;
    }
    ctx.fillStyle = fg;
    
    // 텍스트 렌더링 품질 향상
    ctx.textRenderingOptimization = 'optimizeQuality';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 텍스트 정렬 및 오프셋
    if (l.centered) {
        ctx.textAlign = "center";
        l.offsetX = (pxPerU * w) / 2;
    } else {
        ctx.textAlign = "left";
    }
    let ent_off_x = 0;
    let ent_off_y = 0;
    if (isIsoEnter) {
        ent_off_x = 15;
        ent_off_y = 6;
    }

    // 메인 글자 그리기
    if (mainChar.top) {
        ctx.fillText(mainChar.top, l.offsetX, l.offsetY + l.yOffsetTop);
        ctx.fillText(mainChar.bottom, l.offsetX, l.offsetY + l.yOffsetBottom);
    } else {
        ctx.fillText(
            mainChar,
            l.offsetX + ent_off_x,
            l.fontsize + (KeyUtil.isAlpha(key) ? l.offsetY : l.yOffsetMod) + ent_off_y
        );
    }

    // 서브 글자 (보조 레전드) 처리
    if (sublegend && subChar && l.subsSupported) {
        let sub = SUBS[sublegend];
        let multiplier = sub.fontSizeMultiplier * 0.35;
        ctx.fillStyle = subColor || fg;
        ctx.font = `bold ${pxPerU * multiplier}px ${sub.fontFamily}`;
        if (subChar.top) {
            ctx.fillText(subChar.top, pxPerU * 0.55, pxPerU * 0.4);
            ctx.fillText(subChar.bottom, pxPerU * 0.55, pxPerU * 0.8);
        } else {
            ctx.fillText(subChar, pxPerU * 0.55, pxPerU * 0.8);
        }
    }

    // 캔버스를 텍스쳐로 변환
    texture = new THREE.CanvasTexture(canvas);
    // texture.format = THREE.RGBAFormat;  // 알파 채널 유지
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter; // 블러 방지
    texture.magFilter = THREE.LinearFilter; // 자연스러운 필터링
    texture.generateMipmaps = true; // 미맵 생성으로 자연스러운 다운샘플링
    texture.anisotropy = opts.renderer
        ? Math.min(opts.renderer.capabilities.getMaxAnisotropy(), 8) // 최대값 제한
        : 8; // 기본값 8로 제한
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
};
