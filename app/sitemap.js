// 주요 종목 리스트 (나중에는 DB에서 가져오면 됨)
const tickers = ["AAPL", "TSLA", "MSFT", "NVDA", "GOOGL", "AMZN", "META"];

export default async function sitemap() {
  const routes = tickers.map((ticker) => ({
    url: `https://sec-tool-delta.vercel.app/filings/${ticker}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: "https://sec-tool-delta.vercel.app/",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...routes,
  ];
}
