import React from "react";
import ScreenShot from "./ScreenShot";
import styles from "./action.module.scss";
import Permalink from "@components/quickActions/Permalink";

export default function QuickActions() {
  return (
    <div className={styles.actionBar}>
      <Permalink />
      <ScreenShot />
      {/*<a*/}
      {/*  className={styles.action}*/}
      {/*  href="https://github.com/crsnbrt/keysim"*/}
      {/*  aria-label="keyboard simulator on github"*/}
      {/*  target="_blank"*/}
      {/*>*/}
      {/*  <GithubIcon />*/}
      {/*</a>*/}
    </div>
  );
}
