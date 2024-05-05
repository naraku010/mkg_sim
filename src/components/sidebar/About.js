import React from "react";
import styles from "./About.module.scss";
import CollapsibleSection from "../containers/CollapsibleSection";
import { ReactComponent as GithubIcon } from "../../assets/icons/icon_github.svg";

export default function About() {
  return (
    <CollapsibleSection title="About" open={true}>
      <div className={styles.about}>
        <p>
          <a
              href="https://gall.dcinside.com/mgallery/board/lists/?id=mechanicalkeyboard"
              rel="noopener noreferrer"
              target="_blank"
              className={styles.github}
          >
            기계식 키보드 갤러리
          </a>
        </p>
        <p>
          참고 사이트:{" "}
          <a
              href="https://keyboardsimulator.xyz/"
              rel="noopener noreferrer"
              target="_blank"
          >
            https://keyboardsimulator.xyz
          </a>
        </p>
        <div className={styles.legal}>
          site design &copy;2020 keyboard simulator
        </div>
        <div className={styles.legal}>
          커스텀: 비글이
        </div>
        <div className={styles.legal}>
          문의: <a
            href="mailto:naraku010@gmail.com"
            rel="noopener noreferrer"
            target="_blank"
        >
          naraku010@gmail.com
        </a>
        </div>
      </div>
    </CollapsibleSection>
  );
}
