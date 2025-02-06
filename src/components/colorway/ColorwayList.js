import React, {useState} from "react";
import Colorway from "./Colorway";
import Button from "../elements/Button";
import styles from "./ColorwayList.module.scss";
import {useSelector, useDispatch} from "react-redux";
import COLORWAYS from "../../config/colorways/colorways";
import {USERCOLORWAYS, USERCOLORWAYS_NEW} from "../../config/colorwayList";
import CollapsibleSection from "../containers/CollapsibleSection";
import SearchField from "../elements/SearchField";
import ColorUtil from "../../util/color";
import {
    setColorway,
    selectColorways,
    addCustomColorway,
} from "../../store/slices/colorways";

import {ReactComponent as PlusIcon} from "../../assets/icons/icon_plus.svg";

export default function ColorwayList(props) {
    const dispatch = useDispatch();
    const customColorways = useSelector(selectColorways);
    const [filter, setFilter] = useState("");

    const filteredColorways = (obj) => {
        return Object.keys(obj)
            .sort()
            .filter((cw) => {
                return filter.length
                    ? cw.toLowerCase().includes(filter.toLowerCase())
                    : true;
            });
    };


    const customColorwayTiles = customColorways.map((s) => (
        <Colorway key={s.id} colorway={s} custom={true} setTab={props.setTab}/>
    ));

    const colorwayTiles = filteredColorways(COLORWAYS).map((s) => (
        <Colorway key={COLORWAYS[s]?.id} colorway={COLORWAYS[s]}/>
    ));

    const userColorwayTiles = filteredColorways(USERCOLORWAYS).map((s) => (
        <Colorway key={USERCOLORWAYS[s]?.id} colorway={USERCOLORWAYS[s]}/>
    ));

    const userNewColorwayTiles = filteredColorways(USERCOLORWAYS_NEW).map((s) => (
        <Colorway key={USERCOLORWAYS_NEW[s]?.id} colorway={USERCOLORWAYS_NEW[s]}/>
    ));


    const addColorway = (e) => {
        let cw = ColorUtil.getColorwayTemplate(customColorways?.length + 1 || 1);
        dispatch(addCustomColorway(cw));
        dispatch(setColorway(cw.id));
    };

    return (
        <CollapsibleSection title="하우징 색상" open={true}>
            <div>
                <div className={styles.group}>
                    <SearchField
                        filter={(val) => {
                            setFilter(val);
                        }}
                    />
                    <Button
                        title="Add"
                        icon={<PlusIcon/>}
                        className={styles.add}
                        handler={addColorway}
                        tabIndex="0"
                    >
                        <PlusIcon/>
                        <span>새 색상 추가</span>
                    </Button>
                </div>
                {customColorwayTiles.length ? (
                    <div aria-hidden="true" className={styles.listLabel}>
                        <span>나의 컬러</span>
                    </div>
                ) : null}
                <ul className={styles.list} aria-label="my custom colorways list">
                    {customColorwayTiles}
                </ul>
                <div aria-hidden="true" className={styles.newListLabel}>
                    <span>신상 색상</span>
                </div>
                <ul className={styles.list} aria-label="기키갤 제공 색상">
                    {userNewColorwayTiles}
                </ul>
                <div aria-hidden="true" className={styles.listLabel}>
                    <span>업로드 색상</span>
                </div>
                <ul className={styles.list} aria-label="기키갤 제공 색상">
                    {userColorwayTiles}
                </ul>
                {customColorwayTiles.length ? (
                    <div aria-hidden="true" className={styles.listLabel}>
                        <span>기존 색상</span>
                    </div>
                ) : null}
                {colorwayTiles.length ? (
                    <ul className={styles.list} aria-label="community colorways list">
                        {colorwayTiles}
                    </ul>
                ) : (
                    <p
                        style={{
                            fontSize: "16px",
                            padding: "1em",
                            margin: "0",
                            width: "100%",
                        }}
                    >
                        데이터 없음
                    </p>
                )}{" "}
            </div>
        </CollapsibleSection>
    );
}
