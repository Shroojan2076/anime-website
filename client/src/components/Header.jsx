import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [headerQuery, setHeaderQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (!headerQuery.trim()) return;

    navigate(`/search?q=${encodeURIComponent(headerQuery.trim())}`);
    setHeaderQuery("");
  }

  return (
    <header className="main-header">
      <div className="logo">
        <Link to="/">
          <span className="logo-sparkle">✦</span> MyAnimeSite
        </Link>
      </div>

      <nav className="main-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Home
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Explore
        </NavLink>
        <NavLink
          to="/watchlist"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Watchlist
        </NavLink>
      </nav>

      <form className="header-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={headerQuery}
          onChange={(e) => setHeaderQuery(e.target.value)}
          placeholder="Search anime title..."
          required
        />
        <button type="submit" title="Search">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>
    </header>
  );
}