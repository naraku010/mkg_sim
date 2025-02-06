import React, {useState} from "react";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import TestingPane from "./TestingPane";
import OptionsPane from "./OptionsPane";
import styles from "./Sidebar.module.scss";
import ColorwayEditor from "../colorway/ColorwayEditor";
import {ReactComponent as Logo} from "../../assets/logo.svg";
import {ReactComponent as Name} from "../../assets/logo_text.svg";
import "./tabs.scss";
import GoogleAdvertise from "../google/GoogleAdvertise";

export default function Sidebar() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div id="sidebar" className={styles.sidebar}>
      <div className={styles.intro}>
        <div className={styles.logoWrapper}>
          <h1 aria-label="Keyboard Simulator">
            <Logo />
            <Name />
          </h1>
        </div>
      </div>
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          <Tab tabIndex="0">기본</Tab>
          <Tab tabIndex="0">커스텀</Tab>
          <Tab tabIndex="0">테스트</Tab>
        </TabList>
        <TabPanel>
          <OptionsPane setTab={setTabIndex}/>
        </TabPanel>
        <TabPanel>
          <ColorwayEditor/>
        </TabPanel>
        <TabPanel>
          <TestingPane />
        </TabPanel>
      </Tabs>
    </div>
  );
}
