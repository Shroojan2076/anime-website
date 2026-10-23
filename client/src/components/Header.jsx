import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [headerQuery, setHeaderQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (!headerQuery.trim()) return;

    navigate(`/?q=${encodeURIComponent(headerQuery.trim())}`);
    setHeaderQuery("");
  }

  return (
    <header>
      <div className="logo">
        <Link to="/">MyAnimeSite</Link>
      </div>

      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Home
        </NavLink>
        <NavLink
          to="/watchlist"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Watchlist
        </NavLink>
      </nav>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={headerQuery}
          onChange={(e) => setHeaderQuery(e.target.value)}
          placeholder="Quick search..."
          required
        />
        <button type="submit">Search</button>
      </form>
    </header>
  );
}
