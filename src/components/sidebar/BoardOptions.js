import React from "react";
import styles from "./BoardOptions.module.scss";
import {useSelector, useDispatch} from "react-redux";

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
import {selectPaintWithKeys, togglePaintWithKeys} from "../../store/slices/settings";
import ToggleField from "../elements/ToggleField";
import {
    toggleMat,
    selectMat
} from "../../store/slices/settings";
export default function BoardOptions() {
    const dispatch = useDispatch();

    const hasMat = useSelector(selectMat);
    const layout = useSelector(caseActions.selectLayout);
    const legendType = useSelector(keyActions.selectLegendType);
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
                    label="배열"
                    selected={layout}
                    options={[
                        {label: "10% numpad", value: "numpad", img: icon10},
                        {label: "40%", value: "40", img: icon40},
                        {label: "40% ortho", value: "40ortho", img: icon40},
                        {label: "50%", value: "leftnum", img: icon45},
                        {label: "50% ortho", value: "50ortho", img: icon40},
                        {label: "60%", value: "60", img: icon60},
                        {label: "60% ISO", value: "60iso", img: icon60},
                        {label: "60% WKL", value: "60wkl", img: icon60wkl},
                        {label: "60% HHKB", value: "60hhkb", img: icon60hhkb},
                        {label: "60% TSANGAN", value: "60tsangan", img: icon60},
                        {label: "65%", value: "65", img: icon65},
                        {label: "65% ERGO", value: "65ergo", img: icon75},
                        {label: "70%", value: "70", img: icon75},
                        {label: "70% WKL", value: "70wkl", img: icon75},
                        {label: "75%", value: "75", img: icon75},
                        {label: "80%", value: "80", img: icon80},
                        {label: "80% WKL", value: "80wkl", img: icon75},
                        {label: "95%", value: "95", img: icon95},
                        {label: "100%", value: "100", img: icon100},
                    ]}
                    handler={(val) => {
                        dispatch(caseActions.setLayout(val));
                    }}
                />
                <SelectField
                    label="키캡 종류"
                    selected={legendPrimaryStyle}
                    options={[
                        {label: "체리", value: "cherry"},
                        {label: "SA", value: "sa", secondaryLabel: "(no subs)"},
                    ]}
                    handler={(val) => {
                        dispatch(keyActions.setLegendPrimaryStyle(val));
                    }}
                />
                <SelectField
                    label="키캡 재질"
                    selected={legendType}
                    options={[
                        {label: "PBT", value: "pbt"},
                        {label: "ABS", value: "abs"},
                        {label: "투명", value: "trn"},
                    ]}
                    handler={(val) => {
                        dispatch(keyActions.setLegendType(val));
                    }}
                />
                <SelectField
                    label="옵션 언어"
                    selected={legendSecondaryStyle}
                    options={[
                        {label: "기본", value: ""},
                        {label: "한글", value: "hangul"},
                        {label: "키릴", value: "cyrillic"},
                        {label: "룬문자", value: "rune"},
                        {label: "히라가나", value: "hiragana"},
                        {label: "가타카나", value: "katakana"},
                        {label: "중국어", value: "chinese"},
                    ]}
                    handler={(val) => {
                        dispatch(keyActions.setLegendSecondaryStyle(val));
                    }}
                />
                {/*<ToggleField*/}
                {/*    value={hasMat}*/}
                {/*    label={"장패드 토글"}*/}
                {/*    handler={() => dispatch(toggleMat())}*/}
                {/*/>*/}
            </CollapsibleSection>

            <CollapsibleSection title="하우징 옵션" open={true}>
                <SelectField
                    name="case_type"
                    label="하우징 재질"
                    selected={material}
                    options={[
                        {label: "PC", value: "tra"},
                        {label: "매트", value: "matte"},
                        {label: "무광", value: "brushed"},
                        {label: "유광", value: "glossy"},
                    ]}
                    handler={(val) => {
                        dispatch(caseActions.setMaterial(val));
                    }}
                />
                <SelectField
                    name="case_texture"
                    label="하우징 마감"
                    selected={style}
                    options={[
                        {label: "둥근 형태", value: "CASE_1"},
                        {label: "각진 형태", value: "CASE_2"},
                    ]}
                    handler={(val) => {
                        dispatch(caseActions.setStyle(val));
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
