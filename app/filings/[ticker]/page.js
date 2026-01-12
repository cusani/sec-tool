// app/filings/[ticker]/page.js

export default async function FilingPage({ params }) {
  // URL에서 ticker 값(예: AAPL)을 가져옵니다.
  // Next.js 15부터는 params가 Promise이므로 await가 필요할 수 있습니다.
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        📈 {ticker.toUpperCase()} 공시 정보
      </h1>
      <p style={{ marginTop: "20px", color: "#666" }}>
        여기는 <strong>{ticker.toUpperCase()}</strong>의 SEC 리포트가 표시될
        자리입니다.
      </p>

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>🚀 개발자 노트</h3>
        <p>이 페이지는 정적 페이지가 아닙니다.</p>
        <p>
          URL 뒤에 무엇을 입력하든 (/filings/SAMSUNG, /filings/GOOGLE) 자동으로
          생성됩니다.
        </p>
      </div>
    </div>
  );
}
