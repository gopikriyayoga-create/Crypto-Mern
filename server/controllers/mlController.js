import tf from "@tensorflow/tfjs";
import Sentiment from "sentiment";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const sentiment = new Sentiment();

export const predictTrend = async (req, res) => {
  const { coin } = req.params;
  const coinId = coin || "bitcoin";

  try {
    // 1. ML Prediction (using Coingecko historical data)
    const priceRes = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=14`
    );
    const prices = priceRes.data.prices.map((p) => p[1]);

    if (prices.length < 50) {
      return res.status(400).json({ message: "Not enough price data for robust analysis." });
    }

    const windowSize = 24;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const normalize = (val) => (val - minPrice) / (maxPrice - minPrice);
    const denormalize = (val) => val * (maxPrice - minPrice) + minPrice;

    const normalizedPrices = prices.map(normalize);
    const xs = [];
    const ys = [];

    for (let i = 0; i < normalizedPrices.length - windowSize; i++) {
        xs.push(normalizedPrices.slice(i, i + windowSize));
        ys.push(normalizedPrices[i + windowSize]);
    }

    const xsTensor = tf.tensor2d(xs);
    const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 32, activation: "relu", inputShape: [windowSize] }));
    model.add(tf.layers.dense({ units: 16, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: tf.train.adam(0.01), loss: "meanSquaredError" });

    await model.fit(xsTensor, ysTensor, { epochs: 25, batchSize: 32 });

    const lastWindow = normalizedPrices.slice(-windowSize);
    const inputTensor = tf.tensor2d([lastWindow]);
    const predictionTensor = model.predict(inputTensor);
    const predVal = predictionTensor.dataSync()[0];

    const predictedPrice = denormalize(predVal);
    const currentPrice = prices[prices.length - 1];

    const priceDiff = predictedPrice - currentPrice;
    const mlTrend = priceDiff >= 0 ? "bullish" : "bearish";
    const changePct = ((Math.abs(priceDiff) / currentPrice) * 100).toFixed(2);

    // Dispose tensors to free memory
    xsTensor.dispose();
    ysTensor.dispose();
    inputTensor.dispose();
    predictionTensor.dispose();
    model.dispose();

    // 2. Sentiment Analysis (using NewsAPI or fallback)
    const API_KEY = process.env.NEWS_API_KEY || "2daed5b6f7a64d13835c6616ebfc2f21";
    let articles = [];
    
    try {
      const newsRes = await axios.get(
        `https://newsapi.org/v2/everything?q=${coinId}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${API_KEY}`
      );
      articles = newsRes.data.articles || [];
    } catch (err) {
      console.warn("NewsAPI failed on backend, using fallback...");
      const fallback = await axios.get(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`);
      articles = (fallback.data?.Data || []).slice(0, 20).map(item => ({
        title: item.title,
        description: item.body
      }));
    }

    let totalSentimentScore = 0;
    let analyzedCount = 0;

    articles.forEach(article => {
      const textToAnalyze = `${article.title || ""} ${article.description || ""}`;
      if (textToAnalyze.trim()) {
        const result = sentiment.analyze(textToAnalyze);
        totalSentimentScore += result.comparative; // comparative logic balances per-word
        analyzedCount++;
      }
    });

    const averageSentiment = analyzedCount > 0 ? totalSentimentScore / analyzedCount : 0;
    
    // threshold slightly > 0 for bullish since news is often neutral/slight pos
    const sentimentTrend = averageSentiment > 0.05 ? "bullish" : averageSentiment < -0.05 ? "bearish" : "neutral";

    // 3. Combined Logic
    // If ML is bullish AND Sentiment is bullish -> bullish
    // If ML is bearish AND Sentiment is bearish -> bearish
    // Otherwise, defer to ML primarily but label "mixed"
    let overallTrend = mlTrend;
    if (mlTrend === "bullish" && sentimentTrend === "bearish") overallTrend = "mixed";
    if (mlTrend === "bearish" && sentimentTrend === "bullish") overallTrend = "mixed";

    res.json({
        success: true,
        data: {
            price: predictedPrice,
            current: currentPrice,
            changePct: changePct,
            mlTrend: mlTrend,
            sentimentScore: averageSentiment.toFixed(4),
            sentimentTrend: sentimentTrend,
            overallTrend: overallTrend
        }
    });

  } catch (error) {
    console.error("ML Prediction Error:", error);
    res.status(500).json({ success: false, message: "Error running prediction model." });
  }
};
