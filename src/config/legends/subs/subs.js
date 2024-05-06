import hiragana from "./hiragana.json";
import katakana from "./katakana.json";
import hangul from "./hangul.json";
import chinese from "./chinese.json";
import rune from "./rune.json";

const SUBS = {
  chinese: chinese,
  hangul: hangul,
  hiragana: hiragana,
  katakana: katakana,
  rune: rune,
};

export default SUBS;

export const subOptions = Object.keys(SUBS);
