import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import { searchAnime, loadMoreAnime } from "../services/api";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [animeList, setAnimeList] = useState([]);
  const [query, setQuery] = useState(urlQuery);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize search with URL query param
  useEffect(() => {
    const targetQuery = urlQuery.trim() || "Naruto";
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await searchAnime(targetQuery);
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

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
  }

  async function handleLoadMore() {
    if (!nextUrl || loading) return;

    try {
      setLoading(true);
      setError(null);

      const result = await loadMoreAnime(nextUrl);

      // Append new anime to current list
      setAnimeList((prev) => [...prev, ...(result.data || [])]);
      setNextUrl(result.nextUrl || null);
    } catch (err) {
      setError(err.message || "Failed to load more anime");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* Search Bar */}
      <section className="search-section">
        <form className="main-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search anime by title (e.g., Jujutsu Kaisen, One Piece)..."
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      {/* Error Banner */}
      {error && <p className="error-message">{error}</p>}

      {/* Results Grid */}
      <section className="search-results">
        {animeList.map((anime) => (
          <AnimeCard key={anime.node.id} anime={anime} />
        ))}
      </section>

      {/* Empty State */}
      {!loading && animeList.length === 0 && !error && (
        <div className="empty-state">
          <p>No anime found. Try another search term!</p>
        </div>
      )}

      {/* Load More Button */}
      {nextUrl && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading more..." : "Load More"}
          </button>
        </div>
      )}
    </main>
  );
}

export default Home;
