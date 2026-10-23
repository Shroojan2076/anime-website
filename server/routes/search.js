import express from "express";

import {
    searchAnime,
    getNextPage
} from "../services/mal.js";

import {
    getSearchState,
    setSearchState,
    appendSearchResults,
    updateNextUrl
} from "../services/searchState.js";

const router = express.Router();

// GET / - Returns current search results as JSON
router.get("/", (req, res) => {
    const search = getSearchState();
    res.json({
        data: search.results,
        nextUrl: search.nextUrl
    });
});

// POST / - Executes a new search and returns results as JSON
router.post("/", async (req, res) => {
    // Supports both req.body["search-anime"] and req.body.query
    const query = req.body["search-anime"] || req.body.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({
            error: "Search query is required"
        });
    }

    try {
        const result = await searchAnime(query.trim());

        setSearchState({
            query: query.trim(),
            results: result.data || [],
            nextUrl: result.paging?.next || null
        });

        const search = getSearchState();

        return res.json({
            data: search.results,
            nextUrl: search.nextUrl
        });

    } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong while searching.";

        console.error("Search API error:", status, errorMessage);

        return res.status(status).json({
            error: errorMessage
        });
    }
});

// GET /next - Loads the next page and returns updated list as JSON
router.get("/next", async (req, res) => {
    const search = getSearchState();

    if (!search.nextUrl) {
        return res.status(400).json({
            error: "There is no next page."
        });
    }

    try {
        const result = await getNextPage(search.nextUrl);

        appendSearchResults(result.data || []);
        updateNextUrl(result.paging?.next || null);

        const updatedSearch = getSearchState();

        return res.json({
            data: updatedSearch.results,
            nextUrl: updatedSearch.nextUrl
        });

    } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to load more anime.";

        console.error("Next page API error:", status, errorMessage);

        return res.status(status).json({
            error: errorMessage
        });
    }
});

export default router;