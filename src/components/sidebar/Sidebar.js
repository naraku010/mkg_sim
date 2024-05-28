import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import TestingPane from "./TestingPane";
import OptionsPane from "./OptionsPane";
import styles from "./Sidebar.module.scss";
import ColorwayEditor from "../colorway/ColorwayEditor";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import { ReactComponent as Name } from "../../assets/logo_text.svg";
import "./tabs.scss";

export default function Sidebar({tabIndex, setTabIndex}) {
  // const [tabIndex, setTabIndex] = useState(0);

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
          <Tab tabIndex="1">커스텀</Tab>
          <Tab tabIndex="2">테스트</Tab>
          {/*<Tab tabIndex="3">송장확인</Tab>*/}
        </TabList>
        <TabPanel>
          <OptionsPane setTab={setTabIndex} />
        </TabPanel>
        <TabPanel>
          <ColorwayEditor />
        </TabPanel>
        <TabPanel>
          <TestingPane />
        </TabPanel>
        <TabPanel>
          <TestingPane />
        </TabPanel>
      </Tabs>
    </div>
  );
}
