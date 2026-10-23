import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import { searchAnime, loadMoreAnime } from "../services/api";

const QUICK_SEARCHES = ["Jujutsu Kaisen", "Attack on Titan", "Demon Slayer", "One Piece", "Solo Leveling", "Bleach"];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [animeList, setAnimeList] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    const activeQuery = urlQuery.trim() || "Popular";
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await searchAnime(activeQuery);
        if (isMounted) {
          setAnimeList(result.data || []);
          setNextUrl(result.nextUrl || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to search anime");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [urlQuery]);

  async function handleLoadMore() {
    if (!nextUrl || loadingMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const result = await loadMoreAnime(nextUrl);

      setAnimeList((prev) => [...prev, ...(result.data || [])]);
      setNextUrl(result.nextUrl || null);
    } catch (err) {
      setError(err.message || "Failed to load more anime");
    } finally {
      setLoadingMore(false);
    }
  }

  // Sorted anime results
  const sortedAnimeList = useMemo(() => {
    if (sortBy === "relevance") return animeList;

    return [...animeList].sort((a, b) => {
      const nodeA = a.node || {};
      const nodeB = b.node || {};

      if (sortBy === "title_asc") {
        return (nodeA.title || "").localeCompare(nodeB.title || "");
      }
      if (sortBy === "score_desc") {
        return (nodeB.mean || 0) - (nodeA.mean || 0);
      }
      if (sortBy === "episodes_desc") {
        return (nodeB.num_episodes || 0) - (nodeA.num_episodes || 0);
      }
      return 0;
    });
  }, [animeList, sortBy]);

  return (
    <main className="search-page-container">
      {/* Page Header Bar with query info and clean sort dropdown */}
      <section className="search-header-bar">
        <div className="search-title-area">
          <h1>{urlQuery.trim() ? `Results for "${urlQuery}"` : "Explore Anime"}</h1>
          <span className="results-count">
            {animeList.length > 0 ? `${animeList.length} titles loaded` : ""}
          </span>
        </div>

        {/* Clean, Uncluttered Sort Dropdown */}
        <div className="sort-control">
          <label htmlFor="search-sort-select">Sort by:</label>
          <select
            id="search-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="title_asc">Title (A – Z)</option>
            <option value="score_desc">Rating (High to Low)</option>
            <option value="episodes_desc">Episodes (Most)</option>
          </select>
        </div>
      </section>

      {/* Quick Search Tag Pills */}
      <div className="quick-tags-row">
        <span className="quick-label">Trending:</span>
        {QUICK_SEARCHES.map((title) => (
          <button
            key={title}
            type="button"
            className="quick-tag-btn"
            onClick={() => setSearchParams({ q: title })}
          >
            {title}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && <p className="error-message">{error}</p>}

      {/* Loading State */}
      {loading && <p className="loading-state">Fetching anime from MyAnimeList...</p>}

      {/* Results Grid */}
      {!loading && (
        <section className="search-results">
          {sortedAnimeList.map((anime) => (
            <AnimeCard key={anime.node.id} anime={anime} />
          ))}
        </section>
      )}

      {/* Empty State */}
      {!loading && animeList.length === 0 && !error && (
        <div className="empty-state">
          <p>No anime matched your search.</p>
          <p className="empty-subtext">Try searching for popular titles like "Naruto", "Attack on Titan", or "Jujutsu Kaisen".</p>
        </div>
      )}

      {/* Load More Button */}
      {nextUrl && !loading && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading more..." : "Load More Titles"}
          </button>
        </div>
      )}
    </main>
  );
}
