import { get_qs_values } from "./qs";
import { loadState } from "./localStorage";
import settings from "../config/settings_user_default.json";
import {KC_COLORWAYS} from "../config/organized/keycaps";

const starting_colorway_options = [
  "gmk_yeeti",
  "gmk_futurefunk",
  "gmk_delta",
];

const starting_layout_options = ["80wk7u"];

let randomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getInitialState = () => {
  let qs = get_qs_values();
  let saved_colorways = loadState();
  let initial = settings;
  if (saved_colorways) {
    initial.colorways.custom = saved_colorways.settings;
  }

  //set random initial values
  if (!qs) {
    initial.colorways.active = randomItem(starting_colorway_options);
    initial.case.layout = randomItem(starting_layout_options);
    initial.keys.legendSecondaryStyle = "";
  }

  if (saved_colorways && saved_colorways.active) {
    initial.colorways.active = saved_colorways.active;
  }

  if (qs && qs["debug"]) {
    initial.settings.debug = true;
  }
  //set initial values if in query string
  if (qs && qs["size"]) {
    initial.case.layout = qs["size"];
  }
  if (qs && qs["colorway"]) {
    if (typeof qs["colorway"] === "object") {
      if (!initial.colorways.custom.find((x) => x.id === qs["colorway"].id)) {
        initial.colorways.custom.push(qs["colorway"]);
      }
      initial.colorways.active = qs["colorway"].id;
    } else {
      initial.colorways.active = qs["colorway"];
    }
  }
  if (qs && qs["legend"]) {
    initial.keys.legendPrimaryStyle = qs["legend"];
  }
  if (qs && qs["sub"]) {
    initial.keys.legendSecondaryStyle = qs["sub"];
  }
  if (qs && qs["cc"]) {
    initial.case.primaryColor = `#${qs["cc"]}`;
    initial.case.autoColor = false;
  }
  if (qs && qs["cf"]) {
    initial.case.material = qs["cf"];
  }

  let accent = "";
  if (qs && typeof qs["colorway"] === "object") {
    accent = qs["colorway"].swatches.accent.background;
  } else {
    accent = KC_COLORWAYS[initial?.colorways?.active]?.swatches?.accent?.background;
  }
  initial.settings.sceneColor = accent;
  return initial;
};

export const initial_settings = getInitialState();
