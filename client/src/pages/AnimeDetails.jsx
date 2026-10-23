import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAnimeDetails,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist
} from "../services/api";

export default function AnimeDetails() {
  const { mal_id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnimeDetails(mal_id);
        if (isMounted) setAnime(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load anime details");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [mal_id]);

  async function handleAddToWatchlist() {
    if (!anime) return;
    try {
      setSaving(true);
      await addToWatchlist({
        mal_id: anime.id,
        title: anime.title,
        poster: anime.main_picture?.large || anime.main_picture?.medium,
        media_type: anime.media_type,
        synopsis: anime.synopsis,
        episodes: anime.num_episodes,
        status: "plan_to_watch",
        start_date: anime.start_date,
        end_date: anime.end_date
      });

      setAnime((prev) => ({
        ...prev,
        in_watchlist: true,
        watchlist_status: "plan_to_watch",
        episodes_watched: 0
      }));

      setActionMessage("Added to your watchlist!");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Could not add to watchlist");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      setSaving(true);
      await updateWatchlistItem(anime.id, { status: newStatus });
      setAnime((prev) => ({
        ...prev,
        watchlist_status: newStatus
      }));
      setActionMessage("Status updated!");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function handleEpisodeChange(count) {
    const validCount = Math.max(0, count);
    try {
      setSaving(true);
      await updateWatchlistItem(anime.id, { episodes_watched: validCount });
      setAnime((prev) => ({
        ...prev,
        episodes_watched: validCount
      }));
    } catch (err) {
      setError(err.message || "Failed to update episode count");
    } finally {
      setSaving(false);
    }
  }

  async function handleScoreChange(scoreVal) {
    const score = scoreVal === "" ? null : Number(scoreVal);
    try {
      setSaving(true);
      await updateWatchlistItem(anime.id, { score });
      setAnime((prev) => ({
        ...prev,
        user_score: score
      }));
      setActionMessage("Rating saved!");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update score");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Remove this anime from your watchlist?")) return;
    try {
      setSaving(true);
      await removeFromWatchlist(anime.id);
      setAnime((prev) => ({
        ...prev,
        in_watchlist: false,
        watchlist_status: null,
        episodes_watched: 0,
        user_score: null
      }));
      setActionMessage("Removed from watchlist.");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to remove from watchlist");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="anime-detail">
        <p className="loading-state">Loading anime details...</p>
      </main>
    );
  }

  if (error || !anime) {
    return (
      <main className="anime-detail">
        <Link className="back-link" to="/">
          ← Back to search
        </Link>
        <p className="error-message">{error || "Anime not found"}</p>
      </main>
    );
  }

  return (
    <main className="anime-detail">
      {actionMessage && <div className="watchlist-success">{actionMessage}</div>}

      <Link className="back-link" to="/">
        ← Back to search
      </Link>

      {/* Hero Section */}
      <section className="anime-hero">
        <div className="anime-detail-poster-container">
          {anime.main_picture?.large && (
            <img
              className="anime-detail-poster"
              src={anime.main_picture.large}
              alt={anime.title}
            />
          )}
        </div>

        <div className="anime-detail-main">
          <div className="anime-detail-heading">
            <span className="detail-type">{anime.media_type || "Anime"}</span>
            <h1>{anime.title}</h1>
            {anime.alternative_titles?.en && (
              <p className="alternative-title">{anime.alternative_titles.en}</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="anime-stats">
            <div className="stat">
              <span className="stat-label">Score</span>
              <span className="stat-value">{anime.mean || "N/A"}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rank</span>
              <span className="stat-value">
                {anime.rank ? `#${anime.rank}` : "N/A"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Popularity</span>
              <span className="stat-value">
                {anime.popularity ? `#${anime.popularity}` : "N/A"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Episodes</span>
              <span className="stat-value">{anime.num_episodes || "N/A"}</span>
            </div>
          </div>

          {/* Airing Status & Dates */}
          <div className="detail-tags">
            {anime.status && (
              <span className="detail-tag">
                {anime.status.replaceAll("_", " ")}
              </span>
            )}
            {anime.start_date && (
              <span className="detail-tag">Aired: {anime.start_date}</span>
            )}
            {anime.end_date && (
              <span className="detail-tag">to {anime.end_date}</span>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="genres">
              {anime.genres.map((genre) => (
                <span key={genre.id || genre.name} className="genre">
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Watchlist Controls */}
          <div className="watchlist-action-panel">
            {!anime.in_watchlist ? (
              <button
                type="button"
                className="watchlist-button"
                onClick={handleAddToWatchlist}
                disabled={saving}
              >
                <span className="watchlist-icon">＋</span> Add to Watchlist
              </button>
            ) : (
              <div className="watchlist-manage-box">
                <span className="in-watchlist-badge">✓ In Watchlist</span>
                <div className="watchlist-controls-row">
                  <label>
                    Status:
                    <select
                      value={anime.watchlist_status || "plan_to_watch"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={saving}
                    >
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="dropped">Dropped</option>
                      <option value="plan_to_watch">Plan to Watch</option>
                    </select>
                  </label>

                  <label>
                    Episodes Watched:
                    <div className="ep-counter">
                      <input
                        type="number"
                        min="0"
                        max={anime.num_episodes || 9999}
                        value={anime.episodes_watched || 0}
                        onChange={(e) => handleEpisodeChange(Number(e.target.value))}
                        disabled={saving}
                      />
                      <span>/ {anime.num_episodes || "?"}</span>
                    </div>
                  </label>

                  <label>
                    Score:
                    <select
                      value={anime.user_score ?? ""}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">No score</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                        <option key={s} value={s}>
                          ★ {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="remove-watchlist-button"
                    onClick={handleRemove}
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Synopsis Section */}
      <section className="detail-section">
        <h2>Synopsis</h2>
        <p className="synopsis">{anime.synopsis || "No synopsis available."}</p>
      </section>

      {/* Information Grid */}
      <section className="detail-section">
        <h2>Information</h2>
        <div className="information-grid">
          <div>
            <span className="info-label">Type</span>
            <span className="info-value">{anime.media_type || "N/A"}</span>
          </div>
          <div>
            <span className="info-label">Episodes</span>
            <span className="info-value">{anime.num_episodes || "N/A"}</span>
          </div>
          <div>
            <span className="info-label">Status</span>
            <span className="info-value">
              {anime.status ? anime.status.replaceAll("_", " ") : "N/A"}
            </span>
          </div>
          <div>
            <span className="info-label">Start Date</span>
            <span className="info-value">{anime.start_date || "N/A"}</span>
          </div>
          <div>
            <span className="info-label">End Date</span>
            <span className="info-value">{anime.end_date || "N/A"}</span>
          </div>
          <div>
            <span className="info-label">Studios</span>
            <span className="info-value">
              {anime.studios?.map((s) => s.name).join(", ") || "N/A"}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
