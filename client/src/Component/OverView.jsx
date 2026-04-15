import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function CryptoDashboard() {
  const [coins, setCoins] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [prices, setPrices] = useState({});

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ✅ SAFE NUMBER FORMATTER
  const safe = (num, digits = 2) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return Number(num).toFixed(digits);
  };

  // 🔹 Fetch Coins (SAFE)
  const fetchCoins = async () => {
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 20,
            page: 1,
            sparkline: true,
            price_change_percentage: "24h",
          },
        },
      );

      const data = res.data || [];
      setCoins(data);

      // ✅ SAFE SORT
      const sorted = [...data].sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? 0) -
          (a.price_change_percentage_24h ?? 0),
      );

      setGainers(sorted.slice(0, 5));
      setLosers(sorted.slice(-5));
    } catch (err) {
      console.error("CoinGecko Error:", err);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  // 🔹 Memoized symbols
  const validSymbols = useMemo(() => {
    return coins.map((c) => (c.symbol + "usdt").toLowerCase());
  }, [coins]);

  // 🔹 WebSocket (FILTERED + SAFE)
  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const updated = {};

      data.forEach((coin) => {
        const symbol = coin.s.toLowerCase();

        if (validSymbols.includes(symbol)) {
          updated[symbol] = coin.c;
        }
      });

      if (Object.keys(updated).length) {
        setPrices((prev) => ({ ...prev, ...updated }));
      }
    };

    return () => ws.close();
  }, [validSymbols]);

  // 🔹 Chart Options
  const chartOptions = {
    responsive: true,
    animation: false,
    plugins: {
      legend: { display: false },
    },
  };

  // 🔹 Safe Chart Data
  const createChart = (coin) => {
    const prices = coin.sparkline_in_7d?.price || [];

    return {
      labels: prices.map((_, i) => i),
      datasets: [
        {
          data: prices.length ? prices : [0],
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };
  };

  // 🔹 Gemini Analyze (SAFE)
  const handleAnalyze = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setGeminiAnalysis("");

    try {
      const res = await axios.post("http://localhost:5000/api/gemini/analyze", {
        gainers,
        losers,
      });

      setGeminiAnalysis(res.data.analysis);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Gemini Error:", error);

      if (error.response?.status === 503) {
        setGeminiAnalysis(
          "⚠️ Gemini AI is overloaded. Please try again shortly.",
        );
      } else {
        setGeminiAnalysis(
          "❌ Failed to generate analysis. Check backend/API key.",
        );
      }

      setIsDrawerOpen(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-black w-full min-h-screen text-orange-600 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🚀 Crypto Live Dashboard</h1>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
        >
          {isAnalyzing ? "Analyzing..." : "✨ Analyze with Gemini AI"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* 🔥 GAINERS */}
        <div className="col-span-4">
          <h2 className="text-green-400 mb-4">Top Gainers</h2>

          {gainers.map((coin) => (
            <div key={coin.id} className="bg-[#161b22] p-4 rounded-xl mb-3">
              <div className="flex justify-between">
                <div>
                  <h3>{coin.name}</h3>
                  <p className="text-gray-400">${safe(coin.current_price)}</p>
                </div>

                <span className="text-green-400">
                  +{safe(coin.price_change_percentage_24h)}%
                </span>
              </div>

              <Line data={createChart(coin)} options={chartOptions} />
            </div>
          ))}
        </div>

        {/* 📊 LIVE */}
        <div className="col-span-4">
          <h2 className="mb-4">Live Prices</h2>

          {coins.slice(0, 10).map((coin) => {
            const symbol = (coin.symbol + "usdt").toLowerCase();

            return (
              <div
                key={coin.id}
                className="bg-[#161b22] p-4 rounded-xl mb-3 flex justify-between"
              >
                <span>{coin.name}</span>

                <span className="text-blue-400">
                  $
                  {prices[symbol]
                    ? safe(prices[symbol])
                    : safe(coin.current_price)}
                </span>
              </div>
            );
          })}
        </div>

        {/* 📉 LOSERS */}
        <div className="col-span-4">
          <h2 className="text-red-400 mb-4">Top Losers</h2>

          {losers.map((coin) => (
            <div key={coin.id} className="bg-[#161b22] p-4 rounded-xl mb-3">
              <div className="flex justify-between">
                <div>
                  <h3>{coin.name}</h3>
                  <p className="text-gray-400">${safe(coin.current_price)}</p>
                </div>

                <span className="text-red-400">
                  {safe(coin.price_change_percentage_24h)}%
                </span>
              </div>

              <Line data={createChart(coin)} options={chartOptions} />
            </div>
          ))}
        </div>
      </div>

      {/* 🧠 DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-[#0d1117] p-6 transition-transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={() => setIsDrawerOpen(false)}>Close</button>

        {isAnalyzing ? (
          <p>Analyzing...</p>
        ) : (
          <ReactMarkdown>{geminiAnalysis}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
