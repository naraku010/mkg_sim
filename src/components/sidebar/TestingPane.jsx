import React from "react";

import styles from "./TestingPane.module.scss";
import ToggleField from "../elements/ToggleField";
import {useDispatch, useSelector} from "react-redux";
import * as settingsActions from "../../store/slices/settings";
import CollapsibleSection from "../containers/CollapsibleSection";

export default function TestingPane() {
    const dispatch = useDispatch();
    const testing = useSelector(settingsActions.selectTesting);
    return (
        <>
            <CollapsibleSection title="Key Tester" open={true}>
                <div className={styles.pane}>
                    <ToggleField
                        value={testing}
                        label={"Highlighting"}
                        help={
                            "Highlight pressed keys, note: not all keys can be detected by a browser"
                        }
                        handler={() => dispatch(settingsActions.toggleTestingMode())}
                    />
                </div>
            </CollapsibleSection>
        </>
    );
}
