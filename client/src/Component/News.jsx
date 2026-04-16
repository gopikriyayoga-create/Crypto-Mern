const fetchNews = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await axios.get(
      "https://crypto-mern-q442.onrender.com/api/news",
    );

    if (Array.isArray(res.data)) {
      setNewsList(res.data);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("❌ News fetch failed:", err);
    setError("Unable to load crypto news.");
  } finally {
    setLoading(false);
  }
};
