import { KC_DCS } from './DCS';
import { KC_DOMIKEY } from './Domikey';
import { KC_EPBT } from './ePBT';
import { KC_ETC } from './ETC';
import { KC_GMK } from './GMK';
import { KC_JTK } from './JTK';
import { KC_PBTFANS } from './PBTFans';
import { KC_TUT } from './TUT';
import { KC_KEYCOBO } from './Keycobo';

export const KC_COLORWAYS = {
  ...KC_DCS,
  ...KC_DOMIKEY,
  ...KC_EPBT,
  ...KC_ETC,
  ...KC_GMK,
  ...KC_JTK,
  ...KC_PBTFANS,
  ...KC_TUT,
  ...KC_KEYCOBO
};
