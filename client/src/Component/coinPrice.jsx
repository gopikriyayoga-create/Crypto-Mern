import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Search,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  BrainCircuit,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import * as tf from "@tensorflow/tfjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [coins, setCoins] = useState([]);
  const [sellAmount, setSellAmount] = useState("");
  const [aiPredicting, setAiPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1",
    )
      .then((res) => res.json())
      .then((data) => setHistory(data.prices || []));

    fetch("https://coingecko.com")
      .then((res) => res.json())
      .then((data) => setCoins(data));
  }, []);

  const runAIPrediction = async () => {
    try {
      setAiPredicting(true);
      setPredictionResult(null);

      const response = await fetch(
        "https://crypto-mern-q442.onrender.com/api/auth/register/api/ml/predict/bitcoin",
      );
      const resData = await response.json();

      if (!resData.success) throw new Error(resData.message);

      const {
        price,
        current,
        changePct,
        mlTrend,
        sentimentTrend,
        overallTrend,
      } = resData.data;

      setPredictionResult({
        price: parseFloat(price),
        trend: mlTrend,
        sentiment: sentimentTrend,
        overall: overallTrend,
        change: changePct,
        current: current,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch AI prediction from server.");
    } finally {
      setAiPredicting(false);
    }
  };

  const chartData = {
    labels: history.map((p) => ""),
    datasets: [
      {
        data: history.map((p) => p[1]),
        borderColor: "#f97316", // Orange line
        borderWidth: 2,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(249, 115, 22, 0.3)");
          gradient.addColorStop(1, "rgba(249, 115, 22, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#525252", font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-5 m-10 w-fit">
      {/* 1. HEADER BAR */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-2xl text-orange-600 font-bold">
          BTC/USD <span className="text-gray-600 text-sm italic">▾</span>
          <span className="text-gray-300 ml-4 font-mono text-xl">
            16,430.00{" "}
            <span className="text-green-500 text-sm font-normal">+1.02%</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT SECTION: CHART */}
        <div className="col-span-8 bg-[#161616] p-6 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between mb-8">
            <div className="flex gap-2">
              {["Day", "Week", "Month"].map((t) => (
                <button
                  key={t}
                  className={`px-4 py-1 text-xs rounded-full ${t === "Day" ? "bg-orange-600" : "text-gray-500"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2 text-xs text-gray-400 font-medium">
              <span className="text-orange-500 underline underline-offset-4 decoration-2">
                Line chart
              </span>
              <span className="hover:text-white cursor-pointer">Bar chart</span>
            </div>
          </div>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* RIGHT SECTION: EXCHANGE & BALANCE */}
        <div className="col-span-4 space-y-6">
          <div className="bg-[#161616] p-6 rounded-[2.5rem] border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total balance</span>
              <span className="text-green-500 text-xs flex items-center">
                931.12 USD <ArrowUpRight size={14} />
              </span>
            </div>
            <h2 className="text-3xl font-bold font-mono">
              74,845.36{" "}
              <span className="text-gray-500 text-lg uppercase ml-1">USD</span>
            </h2>
          </div>

          <div className="bg-[#161616] p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-lg font-semibold mb-6">Exchange</h3>
            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                  You sell
                </p>
                <div className="flex justify-between items-center font-bold">
                  <input
                    type="number"
                    className="bg-transparent text-white outline-none w-full"
                    placeholder="0.00"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                  />
                  <span className="text-orange-500 ml-2">BTC ▾</span>
                </div>
              </div>
              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-[#161616] p-1 rounded-full border border-white/5">
                  <ArrowDownLeft className="w-5 h-5 text-gray-500" />
                </div>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                  You get
                </p>
                <div className="flex justify-between items-center font-bold">
                  <input
                    type="text"
                    className="bg-transparent text-gray-400 outline-none w-full"
                    placeholder="0.00"
                    value={
                      sellAmount
                        ? (parseFloat(sellAmount) * 74845.36).toFixed(2)
                        : ""
                    }
                    readOnly
                  />
                  <span className="text-gray-400 ml-2">USD ▾</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (sellAmount && !isNaN(sellAmount)) {
                    alert(
                      `Successfully exchanged ${sellAmount} BTC for $${(parseFloat(sellAmount) * 74845.36).toFixed(2)}`,
                    );
                    setSellAmount("");
                  } else {
                    alert("Please enter a valid amount to exchange.");
                  }
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 py-4 mt-2 rounded-2xl font-bold transition-all shadow-lg shadow-orange-600/20"
              >
                Exchange
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM GRID: NEWS & TRANSACTIONS */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 grid grid-cols-2 gap-6">
          {/* News Preview */}
          <div className="bg-[#161616] p-6 rounded-[2.5rem] border border-white/5">
            <h3 className="font-semibold mb-4 text-gray-400">News</h3>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
                ₿
              </div>
              <div>
                <p className="text-sm font-medium">
                  Challenges to Global Crypto Adoption
                </p>
                <span className="text-[10px] text-gray-500">Today</span>
              </div>
            </div>
          </div>
          {/* Rewards Preview */}
          <div className="bg-[#161616] p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-center">
            <p className="text-sm text-gray-400">Get your first coin</p>
            <p className="text-orange-500 text-xs font-bold">
              50% bonus to your next deposit
            </p>
          </div>
        </div>

        {/* AI PREDICTION WIDGET */}
        <div className="col-span-4 bg-[#161616] p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          {/* Subtle gradient background for AI feel */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none" />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" /> AI Forecast
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Short-term trend prediction
              </p>
            </div>
            {!aiPredicting && (
              <button
                onClick={runAIPrediction}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Run AI
              </button>
            )}
          </div>

          <div className="relative z-10 mt-6 min-h-25">
            {aiPredicting ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-xs text-purple-400 animate-pulse">
                  Training Neural Network...
                </p>
              </div>
            ) : predictionResult ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Projected Price
                    </p>
                    <h4 className="text-2xl font-mono font-bold text-gray-100">
                      $
                      {predictionResult.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h4>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-bold ${predictionResult.trend === "bullish" ? "text-green-500" : "text-red-500"}`}
                  >
                    {predictionResult.trend === "bullish" ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    {predictionResult.change}%
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                    predictionResult.overall === "bullish"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : predictionResult.overall === "bearish"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={15} />
                    <p className="text-xs font-medium">
                      ML Price Model:{" "}
                      <span className="uppercase ml-1">
                        {predictionResult.trend}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} />
                    <p className="text-xs font-medium">
                      News Sentiment:{" "}
                      <span className="uppercase ml-1">
                        {predictionResult.sentiment}
                      </span>
                    </p>
                  </div>
                  <div className="mt-1 pt-2 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/70">
                      Verdict:{" "}
                      <span
                        className={
                          predictionResult.overall === "bullish"
                            ? "text-green-500"
                            : predictionResult.overall === "bearish"
                              ? "text-red-500"
                              : "text-yellow-500"
                        }
                      >
                        {predictionResult.overall}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <BrainCircuit className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-sm text-gray-400">
                  Click &quot;Run AI&quot; to predict the next price movement
                  using live data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
