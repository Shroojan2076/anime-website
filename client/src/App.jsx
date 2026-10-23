import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";


import Home from "./pages/Home";
import Search from "./pages/Search";
import AnimeDetails from "./pages/AnimeDetails";
import Watchlist from "./pages/Watchlist";

function App() {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route
                    path="/anime/:mal_id"
                    element={<AnimeDetails />}
                />
                <Route
                    path="/watchlist"
                    element={<Watchlist />}
                />
            </Routes>

            <Footer />
        </>
    );
}

export default App;