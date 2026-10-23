import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <div className="logo">
        <Link to="/">MyAnimeSite</Link>
      </div>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/watchlist">Watchlist</Link>
      </nav>

      <form>
        <input type="text" placeholder="Search anime" required />

        <button type="submit">Search</button>
      </form>
    </header>
  );
}
