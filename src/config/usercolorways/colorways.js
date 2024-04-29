//기키갤
import mkg_ntd from "./colorway_mkg_ntd.json";
import mkg_m1 from "./colorway_mkg_masterpiece.json";
import mkg_m2 from "./colorway_mkg_kaiju.json";
import mkg_m3 from "./colorway_mkg_sang.json";
import mkg_m4 from "./colorway_mkg_maestro.json";
import mkg_m6 from "./colorway_mkg_handa.json";
import mkg_m7 from "./colorway_mkg_taiga.json";
import mkg_m8 from "./colorway_mkg_bingsu.json";
import mkg_m9 from "./colorway_mkg_dracula.json";
import mkg_m10 from "./colorway_mkg_js.json";
import mkg_m11 from "./colorway_mkg_beta.json";
import mkg_m12 from "./colorway_mkg_beloved.json";

const USERCOLORWAYS = {
  //APPEND
  mkg_ntd: mkg_ntd,
  mkg_masterpiece: mkg_m1,
  mkg_kaiju: mkg_m2,
  mkg_sang: mkg_m3,
  mkg_maestro: mkg_m4,
  mkg_handa: mkg_m6,
  mkg_taiga: mkg_m7,
  mkg_bingsu: mkg_m8,
  mkg_dracula: mkg_m9,
  mkg_js: mkg_m10,
  mkg_beta: mkg_m11,
  mkg_beloved: mkg_m12,
};

export default USERCOLORWAYS;

export const userColorwayOptions = Object.keys(USERCOLORWAYS);
