import { getSecFilings } from "../../../lib/secUtils"; // 라이브러리 경로 (사용자님 환경에 맞춤)

// [유틸 함수] 회사 이름에서 "(AAPL)" 같은 중복 티커 제거
function getCleanCompanyName(rawName) {
  return rawName.replace(/\s*\([A-Z]+\)$/, "").trim();
}

/**
 * 1. 동적 메타데이터 생성 (SEO 핵심)
 * - 검색 엔진이 페이지의 제목과 설명을 가져가는 함수입니다.
 * - 가장 최근 공시 종류(예: 8-K)를 제목에 포함시켜 클릭률을 높입니다.
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();

  // 데이터를 가져와서 제목에 회사 이름을 넣음
  const data = await getSecFilings(ticker);

  if (!data) {
    return {
      title: `${ticker} 공시 정보 없음`,
      description: `현재 ${ticker}에 대한 SEC 공시 데이터를 찾을 수 없습니다.`,
    };
  }

  const companyName = getCleanCompanyName(data.companyName);

  // 전략: 가장 최신 공시가 무엇인지 제목에 명시 (예: "애플 (AAPL) 최신 8-K 공시 확인")
  const latestForm =
    data.filings.length > 0 ? data.filings[0]._source.form : "SEC 공시";

  const title = `${companyName} (${ticker}) ${latestForm} 및 주요 공시 모음`;
  const description = `${companyName} (${ticker})의 10-K, 10-Q, 8-K 등 최신 미국 주식 공시 원문과 재무 보고서를 실시간으로 확인하세요.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "article",
    },
  };
}

/**
 * 2. 페이지 컴포넌트 (UI + 구조화된 데이터)
 */
export default async function Page({ params }) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();

  const data = await getSecFilings(ticker);

  // 데이터가 없을 때 표시할 화면
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <h1 className="text-2xl font-bold text-red-500 mb-2">검색 결과 없음</h1>
        <p className="text-gray-600">
          '{ticker}'에 해당하는 기업을 찾을 수 없거나 SEC 서버 응답이 지연되고
          있습니다.
        </p>
      </div>
    );
  }

  const { companyName, filings } = data;
  const cleanName = getCleanCompanyName(companyName);

  // [SEO 전략] 구조화된 데이터 (JSON-LD) 생성
  // 구글에게 "이 페이지는 금융 보고서 모음이다"라고 알려주는 코드
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: `${cleanName} SEC Filings`,
    about: {
      "@type": "Corporation",
      name: cleanName,
      tickerSymbol: ticker,
    },
    description: `Official SEC filings for ${cleanName}`,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 구조화된 데이터 삽입 (화면엔 안 보임) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 헤더 섹션 */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          {cleanName} <span className="text-blue-600">({ticker})</span>
        </h1>
        <p className="text-gray-600">
          최근 1년간 제출된 주요 공시 리스트입니다. (총 {filings.length}건)
        </p>
      </header>

      {/* 공시 리스트 섹션 */}
      <ul className="space-y-4">
        {filings.map((item) => {
          const doc = item._source;
          // SEC 원문 링크 생성 로직
          const adsh = doc.adsh.replace(/-/g, "");
          const fileUrl = `https://www.sec.gov/Archives/edgar/data/${doc.ciks[0]}/${adsh}/${doc.file_num}`;

          return (
            <li
              key={item._id}
              className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                    {doc.form}
                  </span>
                  <span className="text-gray-500 text-sm">{doc.file_date}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="font-medium text-lg text-gray-800 leading-snug">
                  {doc.display_names ? doc.display_names[0] : doc.root_form}
                </p>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {doc.file_description || "상세 설명 없음"}
                </p>
              </div>

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                원문 보기 (SEC.gov) &rarr;
              </a>
            </li>
          );
        })}
      </ul>

      {filings.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg mt-4">
          <p>최근 1년 내 검색된 공시 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
