import { useState } from "react";
import AnimeCard from "../components/AnimeCard.jsx";
import { searchAnime, loadMoreAnime } from "../services/api.js";

function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [query, setQuery] = useState("");

  const [nextUrl, setNextUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await searchAnime(query.trim());

      setAnimeList(result.data);
      setNextUrl(result.nextUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    try {
      setLoading(true);
      setError(null);

      const result = await loadMoreAnime();

      setAnimeList(result.data);
      setNextUrl(result.nextUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* Search */}

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search anime"
        />

        <button type="submit">Search</button>
      </form>

      {/* Error */}

      {error && <p className="error-message">{error}</p>}

      {/* Results */}

      <section className="search-results">
        {animeList.map((anime) => (
          <AnimeCard key={anime.node.id} anime={anime} />
        ))}
      </section>

      {/* Load More */}

      {nextUrl && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </main>
  );
}

export default Home;
