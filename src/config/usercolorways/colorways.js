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
import mkg_m19 from "./colorway_mkg_symbiote.json";
import mkg_m20 from "./colorway_mkg_nachtarbeit.json";
import mkg_m21 from "./colorway_mkg_dark_olivia.json";

import mkg_a1  from "./colorway_mkg_arctic.json";
import mkg_a2  from "./colorway_mkg_birch.json";
import mkg_a3  from "./colorway_mkg_cinder.json";
import mkg_a4  from "./colorway_mkg_coral.json";
import mkg_a5  from "./colorway_mkg_fleuriste.json";
import mkg_a6  from "./colorway_mkg_frost_witch.json";
import mkg_a7  from "./colorway_mkg_galaxy.json";
import mkg_a8  from "./colorway_mkg_grand_prix.json";
import mkg_a9  from "./colorway_mkg_maroon.json";
import mkg_a10 from "./colorway_mkg_matsu.json";
import mkg_a11 from "./colorway_mkg_regal.json";
import mkg_a12 from "./colorway_mkg_soyamilk.json";
import mkg_a13 from "./colorway_mkg_tenshi.json";
import mkg_a14 from "./colorway_mkg_vamp.json";
import mkg_a15 from "./colorway_mkg_alhambra.json";
import mkg_a16 from "./colorway_mkg_british_racing_green_b.json"
import mkg_a17 from "./colorway_mkg_british_racing_green_r.json"

import mkg_b1 from "./colorway_mkg_rome.json"
import mkg_b2 from "./colorway_mkg_hanok.json"
import mkg_b3 from "./colorway_mkg_barista.json"
import mkg_b4 from "./colorway_mkg_apollo.json"
import mkg_b5 from "./colorway_mkg_camping_burgundy.json"
import mkg_b6 from "./colorway_mkg_first_love.json"
import mkg_b7 from "./colorway_mkg_fishing.json"
import mkg_b8 from "./colorway_mkg_Illusion.json"
import mkg_b9 from "./colorway_mkg_manhattan_cafe.json"
import mkg_b10 from "./colorway_mkg_marmoreal.json"

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
  mkg_dualshot: mkg_m18,
  mkg_symbiote: mkg_m19,
  mkg_nachtarbeit: mkg_m20,
  mkg_dark_olivia: mkg_m21,

  mkg_arctic	  : mkg_a1,
  mkg_birch       : mkg_a2,
  mkg_cinder      : mkg_a3,
  mkg_coral       : mkg_a4,
  mkg_fleuriste   : mkg_a5,
  mkg_frost_witch : mkg_a6,
  mkg_galaxy      : mkg_a7,
  mkg_grand_prix  : mkg_a8,
  mkg_maroon      : mkg_a9,
  mkg_matsu       : mkg_a10,
  mkg_regal       : mkg_a11,
  mkg_soyamilk    : mkg_a12,
  mkg_tenshi      : mkg_a13,
  mkg_vamp        : mkg_a14,
  mkg_alhambra    : mkg_a15,
  mkg_british_racing_green_b : mkg_a16,
  mkg_british_racing_green_r : mkg_a17,

  mkg_rome: mkg_b1,
  mkg_hanok: mkg_b2,
  mkg_barista: mkg_b3,
  mkg_apollo: mkg_b4,
  mkg_camping_burgundy: mkg_b5,
  mkg_first_love: mkg_b6,
  mkg_fishing: mkg_b7,
  mkg_illusion: mkg_b8,
  mkg_manhattan_cafe: mkg_b9,
  mkg_marmoreal: mkg_b10,
};

export default USERCOLORWAYS;

export const userColorwayOptions = Object.keys(USERCOLORWAYS);
