import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Star, ArrowUpRight, Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function SearchCoins() {
  const [coins, setCoins] = useState([]);
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);

  const cache = useRef({}); // 🔥 cache for search
  const ws = useRef(null); // 🔥 websocket

  // -------------------------------
  // ⭐ Load Watchlist
  // -------------------------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(stored);
  }, []);

  const toggleWatchlist = (coin) => {
    let updated;
    if (watchlist.includes(coin.id)) {
      updated = watchlist.filter((id) => id !== coin.id);
    } else {
      updated = [...watchlist, coin.id];
    }
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  // -------------------------------
  // 🔹 Default + Trending
  // -------------------------------
  const fetchDefaultMarkets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1",
      );
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultMarkets();

    fetch("https://api.coingecko.com/api/v3/search/trending")
      .then((res) => res.json())
      .then((data) => setTrending(data.coins));
  }, []);

  // -------------------------------
  // ⚡ Debounced + Cached Search
  // -------------------------------
  useEffect(() => {
    if (!query) {
      fetchDefaultMarkets();
      return;
    }

    const delay = setTimeout(async () => {
      if (cache.current[query]) {
        setCoins(cache.current[query]);
        return;
      }

      setIsLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`,
      );
      const data = await res.json();

      cache.current[query] = data.coins;
      setCoins(data.coins || []);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  // -------------------------------
  // 🔥 WebSocket Live Price (CoinCap)
  // -------------------------------
  useEffect(() => {
    ws.current = new WebSocket(
      "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana",
    );

    ws.current.onmessage = (msg) => {
      const live = JSON.parse(msg.data);

      setCoins((prev) =>
        prev.map((coin) => {
          const id = coin.id;
          if (live[id]) {
            return {
              ...coin,
              current_price: parseFloat(live[id]),
            };
          }
          return coin;
        }),
      );
    };

    return () => ws.current.close();
  }, []);

  // -------------------------------
  // 📊 Generate Fake Chart Data (for demo)
  // -------------------------------
  const generateChart = () => {
    return {
      labels: ["1", "2", "3", "4", "5", "6", "7"],
      datasets: [
        {
          data: Array.from({ length: 7 }, () =>
            Math.floor(Math.random() * 100),
          ),
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className="space-y-8 text-orange-500 w-7xl m-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Crypto Market</h1>

        <div className="relative">
          <Search className="absolute left-3 top-3" />
          <input
            className="pl-10 p-2 bg-black border rounded"
            placeholder="Search..."
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TRENDING */}
      <div className="flex gap-2 overflow-x-auto">
        {trending.map((t) => (
          <button
            key={t.item.id}
            className="px-3 py-1 bg-gray-800 rounded-xl cursor-pointer"
            onClick={() => setQuery(t.item.name)}
          >
            {t.item.symbol}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex justify-center  p-10">
          <Loader2 className="animate-spin overflow-hidden" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {coins.map((coin) => (
            <div key={coin.id} className="p-4 bg-[#161616] rounded-xl">
              {/* TOP */}
              <div className="flex justify-between">
                <div>
                  <h2>{coin.name}</h2>
                  <p className="text-gray-500">{coin.symbol}</p>
                </div>

                <button onClick={() => toggleWatchlist(coin)}>
                  <Star
                    className={
                      watchlist.includes(coin.id)
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }
                  />
                </button>
              </div>

              {/* PRICE */}
              <p className="text-xl font-bold">${coin.current_price || "—"}</p>

              {/* CHANGE */}
              <p className="text-green-500 text-sm flex items-center">
                <ArrowUpRight size={14} />
                {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
              </p>

              {/* 📊 CHART */}
              <div className="h-20 mt-3">
                <Line
                  data={generateChart()}
                  options={{
                    plugins: { legend: false },
                    scales: { x: { display: false }, y: { display: false } },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
