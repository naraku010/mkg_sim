import hiragana from "./hiragana.json";
import katakana from "./katakana.json";
import hangul from "./hangul.json";
import rune from "./rune.json";
import cyrillic from "./cyrillic.json";

const SUBS = {
  hangul: hangul,
  hiragana: hiragana,
  katakana: katakana,
  rune: rune,
  cyrillic: cyrillic
};

export default SUBS;

export const subOptions = Object.keys(SUBS);
