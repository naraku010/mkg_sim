import cyrillic from "./cyrillic.json";
import hiragana from "./hiragana.json";
import katakana from "./katakana.json";
import hangul from "./hangul.json";
import arabic from "./arabic.json";
import greek from "./greek.json";
import hebrew from "./hebrew.json";
import chinese from "./chinese.json";
import devanagari from "./devanagari.json";
import czech from "./czech.json";

const SUBS = {
  chinese: chinese,
  hangul: hangul,
  hiragana: hiragana,
  katakana: katakana,
};

export default SUBS;

export const subOptions = Object.keys(SUBS);
