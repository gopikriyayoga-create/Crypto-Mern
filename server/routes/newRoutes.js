import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// ✅ GET /api/news
router.get("/", async (req, res) => {
  try {
    // 🔵 Try NewsAPI first
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=cryptocurrency&sortBy=publishedAt&language=en&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`,
    );

    const newsData = await newsRes.json();

    if (newsData.articles && newsData.articles.length > 0) {
      const formatted = newsData.articles.map((item, index) => ({
        id: index,
        title: item.title || "No Title",
        body: item.description || "No description available",
        imageurl: item.urlToImage || "",
        url: item.url,
        published_on: item.publishedAt
          ? new Date(item.publishedAt).getTime() / 1000
          : Date.now() / 1000,
        source_info: { name: item.source?.name || "News" },
        categories: "Crypto|Market",
      }));

      return res.json(formatted);
    }

    throw new Error("NewsAPI failed");
  } catch (err) {
    console.warn("⚠️ NewsAPI failed → fallback to CryptoCompare");

    try {
      // 🟡 Fallback → CryptoCompare
      const fallbackRes = await fetch(
        "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
      );

      const fallbackData = await fallbackRes.json();

      if (fallbackData?.Data && Array.isArray(fallbackData.Data)) {
        const formatted = fallbackData.Data.slice(0, 12).map((item, index) => ({
          id: index,
          title: item.title,
          body: item.body,
          imageurl: item.imageurl,
          url: item.url,
          published_on: item.published_on,
          source_info: { name: item.source_info?.name },
          categories: item.categories,
        }));

        return res.json(formatted);
      }

      throw new Error("Fallback failed");
    } catch (error) {
      console.error("❌ All APIs failed:", error);
      return res.status(500).json({
        message: "Unable to fetch news",
      });
    }
  }
});

export default router;
