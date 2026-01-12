// lib/secUtils.js
import axios from "axios";

export async function getSecFilings(symbol, forms = null) {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const enddt = today.toISOString().split("T")[0];
  const startdt = oneYearAgo.toISOString().split("T")[0];

  // 기본 폼 양식 설정
  const selectedForms = forms || "10-K,10-Q,8-K,20-F,S-1,4,424B5,SC 13D,SC 13G";

  // SEC 차단 방지용 헤더 (사용자분이 주신 코드 그대로 적용)
  const headers = {
    authority: "www.sec.gov",
    accept: "application/json, text/plain, */*",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  };

  try {
    // 1. 심볼로 기업 정보(CIK) 찾기
    const selectionResponse = await axios.get(
      `https://efts.sec.gov/LATEST/search-index`,
      {
        params: { keysTyped: symbol },
        headers: headers,
      }
    );

    if (
      !selectionResponse.data.hits ||
      !selectionResponse.data.hits.hits ||
      selectionResponse.data.hits.hits.length === 0
    ) {
      console.log(`No company found for symbol: ${symbol}`);
      return null;
    }

    const firstHit = selectionResponse.data.hits.hits[0];
    const cik = firstHit._id;
    const entityName = firstHit._source.entity;
    const paddedCik = cik.padStart(10, "0");

    // 2. 해당 CIK로 공시 문서 검색
    const response = await axios.get(
      "https://efts.sec.gov/LATEST/search-index",
      {
        params: {
          dateRange: "custom",
          category: "custom",
          ciks: paddedCik,
          entityName: `${entityName} (CIK ${paddedCik})`,
          startdt: startdt,
          enddt: enddt,
          forms: selectedForms,
        },
        headers: headers,
      }
    );

    // UI에서 쓰기 좋게 기업 이름도 같이 반환
    return {
      companyName: entityName,
      filings: response.data.hits.hits,
    };
  } catch (error) {
    console.error("SEC Crawling Error:", error.message);
    return null;
  }
}
