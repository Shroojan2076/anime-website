import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, updateWatchlistItem, removeFromWatchlist } from "../services/api";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "plan_to_watch", label: "Plan to Watch" },
  { id: "on_hold", label: "On Hold" },
  { id: "dropped", label: "Dropped" }
];

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWatchlist();
        if (isMounted) setItems(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load watchlist");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleIncrementEpisode(anime) {
    const nextCount = (anime.episodes_watched || 0) + 1;
    const maxEp = anime.episodes;
    if (maxEp && nextCount > maxEp) return;

    try {
      await updateWatchlistItem(anime.mal_id, { episodes_watched: nextCount });
      setItems((prev) =>
        prev.map((item) =>
          item.mal_id === anime.mal_id
            ? { ...item, episodes_watched: nextCount }
            : item
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update episode count");
    }
  }

  async function handleRemove(malId) {
    if (!window.confirm("Remove this anime from your watchlist?")) return;
    try {
      await removeFromWatchlist(malId);
      setItems((prev) => prev.filter((item) => item.mal_id !== malId));
    } catch (err) {
      alert(err.message || "Failed to remove anime");
    }
  }

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  return (
    <main>
      <section className="watchlist-page">
        <div className="watchlist-header">
          <h1>My Watchlist</h1>
          <span className="watchlist-count">{items.length} titles</span>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`status-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-badge">
                {tab.id === "all"
                  ? items.length
                  : items.filter((i) => i.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {loading && <p className="loading-state">Loading your watchlist...</p>}
        {error && <p className="error-message">{error}</p>}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="empty-watchlist">
            <p>
              {items.length === 0
                ? "Your watchlist is empty."
                : `No anime found in "${STATUS_TABS.find((t) => t.id === activeTab)?.label}".`}
            </p>
            <Link to="/" className="explore-link">
              Explore and search anime →
            </Link>
          </div>
        )}

        {/* Watchlist Grid */}
        <div className="watchlist-grid">
          {filteredItems.map((anime) => (
            <article key={anime.mal_id} className="watchlist-card">
              <Link to={`/anime/${anime.mal_id}`} className="watchlist-poster-link">
                <div className="anime-card-poster">
                  {anime.poster ? (
                    <img
                      className="anime-card-image"
                      src={anime.poster}
                      alt={anime.title}
                    />
                  ) : (
                    <div className="poster-placeholder">No image</div>
                  )}
                  <span className={`anime-type status-${anime.status}`}>
                    {anime.status ? anime.status.replaceAll("_", " ") : "Saved"}
                  </span>
                </div>
              </Link>

              <div className="watchlist-card-content">
                <Link to={`/anime/${anime.mal_id}`} className="anime-title-link">
                  <h2>{anime.title}</h2>
                </Link>

                <div className="watchlist-progress-row">
                  <span className="ep-progress">
                    {anime.episodes_watched || 0} / {anime.episodes || "?"} eps
                  </span>

                  <button
                    type="button"
                    className="plus-ep-btn"
                    title="Increment episode watched"
                    onClick={() => handleIncrementEpisode(anime)}
                  >
                    +1 ep
                  </button>
                </div>

                {anime.score && (
                  <span className="watchlist-score">★ {anime.score} / 10</span>
                )}

                <button
                  type="button"
                  className="quick-remove-btn"
                  onClick={() => handleRemove(anime.mal_id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
