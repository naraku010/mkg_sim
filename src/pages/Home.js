import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import threeApp from "../three/index";
import QuickActions from "../components/quickActions/QuickActions";
import Cargo from "./components/Cargo";

export default function Home() {
    const rootEl = useRef(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        threeApp(rootEl.current);
    }, []);
    return (
        <>
            {showSidebar && <Sidebar tabIndex={tabIndex} setTabIndex={setTabIndex} />}
            {tabIndex === 3 ?
                <Cargo></Cargo> : null
            }
            <div
                id="canvas-wrapper"
                ref={rootEl}
                role="region"
                aria-label="3d scene of keyboard"
                style={{display: tabIndex < 3 ? 'block' : 'none' }}
            ></div>

            <QuickActions />
        </>
    );
}
