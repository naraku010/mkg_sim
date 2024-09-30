import * as THREE from "three";
import LEGENDS from "../../config/legends/primary/primary";
import SUBS from "../../config/legends/subs/subs";
import KeyUtil from "../../util/keyboard";

const MIP_COUNT = 0;
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
//genertates a texture with canvas for top of key
export const keyTexture = (opts) => {
  let w = opts.w;
  let h = opts.h;
  let legend = opts.legend;
  let sublegend = opts.sub;
  let key = opts.code;
  var texture;
  let pxPerU = 128;
  let subColor = opts.subColor || opts.color;
  let fg = opts.color;
  let bg = opts.background;
  //iso enter add extra .25 for overhang
  let isIsoEnter = key === "KC_ENT" && h > 1;
  if (isIsoEnter) {
    w = w + 0.25;
  }

  let canvas = document.createElement("canvas");
  canvas.height = pxPerU * h;
  canvas.width = pxPerU * w;


  //let canvas = new OffscreenCanvas(pxPerU * w, pxPerU * h);

  let ctx = canvas.getContext("2d");
  //draw base color
  ctx.fillStyle = darkenColor(bg, 0.04);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let l = LEGENDS[legend];
  let mainChar = l?.chars[key] || "";

  // 1u bs and enter
  if (key === "KC_BSPC" && w <= 1) {
    mainChar = l?.chars["KC_BSISO"];
  }
  if ((key === "KC_ENT" && w <= 1) || isIsoEnter) {
    mainChar = l?.chars["KC_ENISO"];
  }

  let modWord = !l.encoded && mainChar.length > 1; //mods use multi chacter words instead of symbols (sa)
  let subChar = SUBS[sublegend]?.chars[key] || "";

  //convert to unicode value if encoded for custom fonts
  mainChar =
    l.encoded && mainChar.length > 1
      ? String.fromCharCode(parseInt(mainChar, 16))
      : mainChar;

  //font size
  let fontScaler = 1;
  if (mainChar["top"]) fontScaler = 1 / 2; //number keys 2 characters stacked
  if (!mainChar["top"] && modWord) fontScaler = 1 / 4; // keys with full words for modifer text i.e. "Enter", "Alt", "Home"
  let fontSize = l.fontsize * (fontScaler + 0.25);

  //set font style
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

  // //sub characters
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

  texture = new THREE.CanvasTexture(canvas);


  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  // texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};
