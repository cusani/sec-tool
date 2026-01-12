// app/filings/[ticker]/page.js
import { getSecFilings } from "../../../lib/secUtils"; // 경로 주의 (상대경로)

// 1. 메타데이터 생성 부분
export async function generateMetadata({ params }) {
  // Next.js 15 대응: params를 await 해야 함
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker; // 폴더명이 [ticker]니까 여기서도 ticker로 받아야 함

  const data = await getSecFilings(ticker);
  const title = data
    ? `${data.companyName} (${ticker}) 공시`
    : `${ticker} 공시`;

  return {
    title: title,
    description: `${ticker}의 최신 SEC 공시 자료`,
  };
}

// 2. 페이지 컴포넌트
export default async function Page({ params }) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker;
  const data = await getSecFilings(ticker);

  if (!data) return <div>데이터 없음</div>;

  const { companyName, filings } = data;

  // [수정 포인트] 회사 이름에서 (티커) 부분 제거하기
  // 예: "Apple Inc. (AAPL)" -> "Apple Inc."
  const cleanCompanyName = companyName.replace(/\s*\([A-Z]+\)$/, "");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        {cleanCompanyName} ({ticker})
      </h1>
      <ul>
        {filings.map((doc) => (
          <li key={doc._id} className="border-b p-2">
            {doc._source.form} - {doc._source.file_date}
          </li>
        ))}
      </ul>
    </div>
  );
}
