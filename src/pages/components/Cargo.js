import React, { useEffect, useRef, useState } from "react";

import styles from "./Cargo.scss";
import { Buffer } from 'buffer';
import axios from "axios";
import xml2js from "xml2js";

export default function Cargo() {
    const [data, setData] = useState(null);
    const [cargoNo, setCargoNo] = useState(577772288296);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo?crkyCn=l250r284p015y273b040c040r0&hblNo=${cargoNo}&blYy=2024`,
                    {
                        headers: {
                            'Content-Type': 'application/xml; charset=utf-8'
                        },
                        responseType: 'text'
                    }
                );
                // XML 데이터를 JSON으로 파싱
                xml2js.parseString(response.data, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    setData(result.cargCsclPrgsInfoQryRtnVo);
                });
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cargoNo]);

    return (
        <div>
        {data && (
            <div className={styles.cargoInfo}>
                <h2>운송장 번호: {data.cargCsclPrgsInfoQryVo[0].hblNo}</h2>
                <div className={styles.details}>
                    <h3>일반 정보</h3>
                    <p>상태: {data.cargCsclPrgsInfoQryVo[0].csclPrgsStts}</p>
                    <p>제품명: {data.cargCsclPrgsInfoQryVo[0].prnm}</p>
                    <p>무게: {data.cargCsclPrgsInfoQryVo[0].ttwg} {data.cargCsclPrgsInfoQryVo[0].wghtUt}</p>
                    <p>발송 위치: {data.cargCsclPrgsInfoQryVo[0].dsprNm}</p>
                    <p>도착 날짜: {data.cargCsclPrgsInfoQryVo[0].etprDt}</p>
                </div>
                <div className={styles.details}>
                    <h3>세부 정보</h3>
                    {data.cargCsclPrgsInfoDtlQryVo.map((detail, index) => (
                        <div key={index} className={styles.detail}>
                            <p>처리 날짜: {detail.prcsDttm}</p>
                            <p>신고 번호: {detail.dclrNo}</p>
                            <p>상태: {detail.cargTrcnRelaBsopTpcd}</p>
                            <p>무게: {detail.wght} {detail.wghtUt}</p>
                            <p>패키지 수: {detail.pckGcnt}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
        </div>
    );
}
