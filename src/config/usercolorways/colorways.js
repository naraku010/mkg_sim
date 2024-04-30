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
import mkg_m13 from "./colorway_mkg_redalert.json";
import mkg_m14 from "./colorway_mkg_art.json";
import mkg_m15 from "./colorway_mkg_darling.json";
import mkg_m16 from "./colorway_mkg_evil_eye.json";
import mkg_m17 from "./colorway_mkg_foundation.json";
import mkg_m18 from "./colorway_mkg_dualshot.json";


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
  mkg_red_alert: mkg_m13,
  mkg_art: mkg_m14,
  mkg_darling: mkg_m15,
  mkg_evil_eye: mkg_m16,
  mkg_foundation: mkg_m17,
  mkg_dualshot: mkg_m18
};

export default USERCOLORWAYS;

export const userColorwayOptions = Object.keys(USERCOLORWAYS);
