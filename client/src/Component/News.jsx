import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, Calendar, RefreshCw } from 'lucide-react';

function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "2daed5b6f7a64d13835c6616ebfc2f21"; 

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ 1. Primary Source → NewsAPI
      const res = await axios.get(
        `https://newsapi.org/v2/everything?q=cryptocurrency&sortBy=publishedAt&language=en&pageSize=12&apiKey=${API_KEY}`
      );

      if (res.data.articles && res.data.articles.length > 0) {
        const formatted = res.data.articles.map((item, index) => ({
          id: index,
          title: item.title || "No Title",
          body: item.description || "No description available",
          imageurl: item.urlToImage || "",
          url: item.url,
          published_on: item.publishedAt
            ? new Date(item.publishedAt).getTime() / 1000
            : Date.now() / 1000,
          source_info: { name: item.source?.name || "News" },
          categories: "Crypto|Market"
        }));

        setNewsList(formatted);
        return;
      }

      throw new Error("NewsAPI returned empty");
    } catch (err) {
      console.warn("⚠️ NewsAPI failed, using fallback...", err);

      try {
        // ✅ 2. Fallback → CryptoCompare
        const fallback = await axios.get(
          'https://min-api.cryptocompare.com/data/v2/news/?lang=EN'
        );

        if (fallback.data?.Data) {
          setNewsList(fallback.data.Data.slice(0, 12));
        } else {
          throw new Error("Fallback failed");
        }
      } catch (error) {
        console.error("❌ All APIs failed:", error);
        setError("Unable to load crypto news. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-full text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-orange-600">Crypto News</h1>
          <p className="text-gray-500 mt-1">
            Stay updated with the latest market trends and updates.
          </p>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Loader */}
      {loading && newsList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-[#161616] rounded-2xl h-75 border border-white/5"
            />
          ))}
        </div>
      ) : (
        /* News Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="bg-[#161616] rounded-2xl border border-white/5 overflow-hidden hover:border-white/20 transition-all flex flex-col group"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={
                    news.imageurl ||
                    "https://via.placeholder.com/400x200?text=Crypto+News"
                  }
                  alt={news.title}
                  className="w-full text-orange-600 h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=Crypto+News";
                  }}
                />

                <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-orange-400">
                  {news.source_info?.name || "News"}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs  text-orange-600  mb-2">
                  <Calendar size={14} />
                  {formatDate(news.published_on)}
                </div>

                <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-orange-400">
                  {news.title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                  {news.body}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="flex gap-1 max-w-37.5 overflow-hidden">
                    {(news.categories || "Crypto")
                      .split('|')
                      .slice(0, 2)
                      .map((cat, i) => (
                        <span
                          key={i}
                          className="text-[10px] uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400"
                        >
                          {cat}
                        </span>
                      ))}
                  </div>

                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400"
                  >
                    Read <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default News;