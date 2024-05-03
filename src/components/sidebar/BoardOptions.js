import React from "react";
import styles from "./BoardOptions.module.scss";
import { useSelector, useDispatch } from "react-redux";

import RadioField from "../elements/RadioField";
import SelectField from "../elements/SelectField";
import ColorPicker from "../elements/ColorPicker";
import CollapsibleSection from "../containers/CollapsibleSection";

import icon10 from "../../assets/icons/icon-10.png";
import icon40 from "../../assets/icons/icon-40.png";
import icon45 from "../../assets/icons/icon-45.png";
import icon60 from "../../assets/icons/icon-60.png";
import icon65 from "../../assets/icons/icon-65.png";
import icon75 from "../../assets/icons/icon-75.png";
import icon80 from "../../assets/icons/icon-80.png";
import icon95 from "../../assets/icons/icon-95.png";
import icon100 from "../../assets/icons/icon-100.png";
import icon60wkl from "../../assets/icons/icon-60-wkl.png";
import icon60hhkb from "../../assets/icons/icon-60-hhkb.png";

import * as caseActions from "../../store/slices/case";
import * as settingsActions from "../../store/slices/settings";
import * as keyActions from "../../store/slices/keys";

export default function BoardOptions() {
  const dispatch = useDispatch();

  const layout = useSelector(caseActions.selectLayout);
  const legendPrimaryStyle = useSelector(keyActions.selectLegendPrimaryStyle);
  const legendSecondaryStyle = useSelector(
    keyActions.selectLegendSecondaryStyle
  );
  const primaryColor = useSelector(caseActions.selectPrimaryColor);
  const style = useSelector(caseActions.selectStyle);
  const material = useSelector(caseActions.selectMaterial);
  const sceneColor = useSelector(settingsActions.selectSceneColor);

  return (
    <>
      <CollapsibleSection title="기본설정" open={true}>
        <SelectField
          label="하우징"
          selected={layout}
          options={[
            { label: "10% numpad", value: "numpad", img: icon10 },
            { label: "40%", value: "40", img: icon40 },
            { label: "40% ortho", value: "40ortho", img: icon40 },
            { label: "50%", value: "leftnum", img: icon45 },
            { label: "50% ortho", value: "50ortho", img: icon40 },
            { label: "60%", value: "60", img: icon60 },
            { label: "60% ISO", value: "60iso", img: icon60 },
            { label: "60% WKL", value: "60wkl", img: icon60wkl },
            { label: "60% HHKB", value: "60hhkb", img: icon60hhkb },
            { label: "60% TSANGAN", value: "60tsangan", img: icon60 },
            { label: "65%", value: "65", img: icon65 },
            { label: "70%", value: "70", img: icon75 },
            { label: "75%", value: "75", img: icon75 },
            { label: "80% TKL", value: "80", img: icon80 },
            { label: "95%", value: "95", img: icon95 },
            { label: "100%", value: "100", img: icon100 },
          ]}
          handler={(val) => {
            dispatch(caseActions.setLayout(val));
          }}
        />

        <SelectField
          label="키캡"
          selected={legendPrimaryStyle}
          options={[
            { label: "체리", value: "cherry" },
            { label: "SA", value: "sa", secondaryLabel: "(no subs)" },
          ]}
          handler={(val) => {
            dispatch(keyActions.setLegendPrimaryStyle(val));
          }}
        />

        <SelectField
          label="언어"
          selected={legendSecondaryStyle}
          options={[
            { label: "기본", value: "" },
            { label: "쭝꾺어", value: "chinese" },
            { label: "한글", value: "hangul" },
            { label: "히라가나", value: "hiragana" },
            { label: "가타카나", value: "katakana" },
          ]}
          handler={(val) => {
            dispatch(keyActions.setLegendSecondaryStyle(val));
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection title="하우징 옵션">
        <RadioField
          name="case_style"
          label="하우징 스따일!"
          selected={style}
          options={[
            { label: "둥근놈", value: "CASE_1" },
            { label: "각진놈", value: "CASE_2" },
          ]}
          handler={(val) => {
            dispatch(caseActions.setStyle(val));
          }}
        />

        <RadioField
          name="case_finish"
          label="하우징 재질"
          selected={material}
          options={[
            { label: "전기영동", value: "matte" },
            { label: "무광", value: "brushed" },
            { label: "유광", value: "glossy" },
          ]}
          handler={(val) => {
            dispatch(caseActions.setMaterial(val));
          }}
        />

        <div className={styles.row}>
          <div className={styles.fieldColor}>
            <label>하우징 색상</label>
            <ColorPicker
              color={primaryColor}
              handler={(color) => {
                dispatch(caseActions.setPrimaryColor(color.hex));
                dispatch(caseActions.setAutoColor(false));
              }}
            />
          </div>

          <div className={styles.fieldColor}>
            <label>배경 색상</label>
            <ColorPicker
              color={sceneColor}
              handler={(color) => {
                dispatch(settingsActions.setSceneColor(color.hex));
                dispatch(settingsActions.setSceneAutoColor(false));
              }}
            />
          </div>
        </div>
      </CollapsibleSection>
    </>
  );
}
