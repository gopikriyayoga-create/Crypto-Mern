import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// ✅ GET /api/news
router.get("/", async (req, res) => {
  try {
    // 🔐 Validate API key
    if (!process.env.NEWS_API_KEY) {
      throw new Error("Missing NEWS_API_KEY");
    }

    // 🔵 Try NewsAPI
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=cryptocurrency&sortBy=publishedAt&language=en&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`,
    );

    // ❗ Check HTTP status
    if (!newsRes.ok) {
      throw new Error(`NewsAPI failed with status ${newsRes.status}`);
    }

    const newsData = await newsRes.json();

    if (Array.isArray(newsData.articles) && newsData.articles.length > 0) {
      const formatted = newsData.articles.map((item, index) => ({
        id: index,
        title: item.title || "No Title",
        body: item.description || "No description available",
        imageurl: item.urlToImage || "",
        url: item.url,
        published_on: item.publishedAt
          ? Math.floor(new Date(item.publishedAt).getTime() / 1000)
          : Math.floor(Date.now() / 1000),
        source_info: { name: item.source?.name || "News" },
        categories: "Crypto|Market",
      }));

      return res.json(formatted);
    }

    throw new Error("NewsAPI returned empty");
  } catch (err) {
    console.warn("⚠️ NewsAPI failed → fallback to CryptoCompare");
    console.warn("Reason:", err.message);

    try {
      // 🟡 Fallback → CryptoCompare
      const fallbackRes = await fetch(
        "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
      );

      if (!fallbackRes.ok) {
        throw new Error(`CryptoCompare failed: ${fallbackRes.status}`);
      }

      const fallbackData = await fallbackRes.json();

      if (Array.isArray(fallbackData?.Data)) {
        const formatted = fallbackData.Data.slice(0, 12).map((item, index) => ({
          id: index,
          title: item.title || "No Title",
          body: item.body || "No description available",
          imageurl: item.imageurl || "",
          url: item.url,
          published_on: item.published_on || Math.floor(Date.now() / 1000),
          source_info: { name: item.source_info?.name || "News" },
          categories: item.categories || "Crypto",
        }));

        return res.json(formatted);
      }

      throw new Error("Fallback returned invalid data");
    } catch (error) {
      console.error("❌ All APIs failed:", error.message);

      return res.status(500).json({
        message: "Unable to fetch news",
      });
    }
  }
});

export default router;
