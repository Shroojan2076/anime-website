import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import { searchAnime } from "../services/api";

const FEATURED_GENRES = [
  { name: "Action", query: "Action" },
  { name: "Shounen", query: "Shounen" },
  { name: "Supernatural", query: "Supernatural" },
  { name: "Sci-Fi", query: "Sci-Fi" },
  { name: "Fantasy", query: "Fantasy" },
  { name: "Romance", query: "Romance" }
];

export default function Home() {
  const [featuredAnime, setFeaturedAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        setLoading(true);
        const result = await searchAnime("Demon Slayer");
        if (isMounted) {
          setFeaturedAnime((result.data || []).slice(0, 5));
        }
      } catch (err) {
        console.warn("Featured anime failed to load:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="landing-page">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">✦ Official MyAnimeList Database</span>
          <h1 className="hero-title">
            Discover, Track & Curate <br />
            <span className="hero-gradient">Your Anime Journey.</span>
          </h1>
          <p className="hero-subtitle">
            Explore thousands of anime titles, keep track of episodes you've watched,
            and organize your personalized library with real-time ratings and metadata.
          </p>

          <div className="hero-actions">
            <Link to="/search" className="btn-primary-hero">
              Explore Anime Collection →
            </Link>
            <Link to="/watchlist" className="btn-secondary-hero">
              Open My Watchlist
            </Link>
          </div>

          {/* Quick Genre Tags */}
          <div className="hero-genres-row">
            <span className="genres-label">Browse Genres:</span>
            {FEATURED_GENRES.map((g) => (
              <button
                key={g.name}
                type="button"
                className="genre-pill-btn"
                onClick={() => navigate(`/search?q=${encodeURIComponent(g.query)}`)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Showcase Section */}
      <section className="showcase-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Anime</h2>
            <p className="section-desc">Popular community favorites ready to explore.</p>
          </div>
          <Link to="/search" className="view-all-link">
            View All Anime →
          </Link>
        </div>

        {loading ? (
          <p className="loading-state">Loading featured titles...</p>
        ) : (
          <div className="showcase-grid">
            {featuredAnime.map((anime) => (
              <AnimeCard key={anime.node.id} anime={anime} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us / Features Grid */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Comprehensive Database</h3>
          <p>
            Powered by the public MyAnimeList API v2 with full metadata, airing dates,
            genres, studios, and synopsis.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📑</div>
          <h3>Personalized Watchlist</h3>
          <p>
            Save titles to Watching, Completed, or Plan to Watch lists with simple status
            switching and one-click episode increments.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⭐️</div>
          <h3>Ratings & Progress Tracking</h3>
          <p>
            Give personal 1–10 star ratings and track your exact progress per episode
            stored securely in your PostgreSQL database.
          </p>
        </div>
      </section>
    </main>
  );
}
