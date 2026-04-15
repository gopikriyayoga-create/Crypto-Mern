import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize the Gemini AI client
// This expects process.env.GEMINI_API_KEY to be set
const ai = new GoogleGenAI({});

router.post("/analyze", async (req, res) => {
  try {
    const { gainers, losers } = req.body;

    if (!gainers || !losers) {
      return res.status(400).json({ message: "Missing gainers or losers data" });
    }

    const prompt = `
      You are a professional cryptocurrency market analyst.
      Analyze the following current market data for the top gainers and top losers.
      Provide a brief, insightful, and professional summary of the current market trend based on this data.
      Do not output any introductory filler, just the analysis.

      Top Gainers:
      ${JSON.stringify(gainers.map(g => ({ name: g.name, change: g.price_change_percentage_24h, price: g.current_price })))}

      Top Losers:
      ${JSON.stringify(losers.map(l => ({ name: l.name, change: l.price_change_percentage_24h, price: l.current_price })))}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: "Error generating analysis", error: error.message });
  }
});

export default router;
