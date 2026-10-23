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


// HOME PAGE

router.get("/", (req, res) => {

    const search = getSearchState();

    res.render("index.ejs", {
        data: search.results,
        nextUrl: search.nextUrl
    });
});


// NEW SEARCH

router.post("/", async (req, res) => {

    const query = req.body["search-anime"];

    if (!query || query.trim() === "") {

        if (req.headers.accept?.includes("application/json")) {
            return res.status(400).json({
                error: "Search query is required"
            });
        }

        return res.redirect("/");
    }

    try {

        const result = await searchAnime(
            query.trim()
        );

        if (!result) {

            if (req.headers.accept?.includes("application/json")) {
                return res.status(401).json({
                    error: "MAL authentication required"
                });
            }

            return res.redirect("/login");
        }

        setSearchState({
            query: query.trim(),
            results: result.data,
            nextUrl: result.paging?.next || null
        });

        const search = getSearchState();

        if (req.headers.accept?.includes("application/json")) {

            return res.json({
                data: search.results,
                nextUrl: search.nextUrl
            });
        }

    } catch (error) {

        const status = error.response?.status;

        console.log(
            "MAL API error:",
            status,
            error.response?.data || error.message
        );

        if (status === 429) {

            if (req.headers.accept?.includes("application/json")) {
                return res.status(429).json({
                    error: "Too many requests. Please wait a moment."
                });
            }

            return res.status(429).send(
                "Too many requests. Please wait a moment."
            );
        }


        if (status === 401) {

            if (req.headers.accept?.includes("application/json")) {
                return res.status(401).json({
                    error: "MAL authentication required"
                });
            }

            return res.redirect("/login");
        }


        if (req.headers.accept?.includes("application/json")) {
            return res.status(500).json({
                error: "Something went wrong while searching."
            });
        }

        res.status(500).send(
            "Something went wrong while searching."
        );
    }
});


// LOAD MORE

router.get("/next", async (req, res) => {

    const search = getSearchState();

    if (!search.nextUrl) {

        if (req.headers.accept?.includes("application/json")) {
            return res.status(400).json({
                error: "There is no next page."
            });
        }

        return res.redirect("/");
    }

    try {

        const result = await getNextPage(
            search.nextUrl
        );

        if (!result) {

            if (req.headers.accept?.includes("application/json")) {
                return res.status(401).json({
                    error: "MAL authentication required"
                });
            }

            return res.redirect("/login");
        }

        appendSearchResults(result.data);

        updateNextUrl(
            result.paging?.next || null
        );

        const updatedSearch = getSearchState();

        if (req.headers.accept?.includes("application/json")) {

            return res.json({
                data: updatedSearch.results,
                nextUrl: updatedSearch.nextUrl
            });
        }

    } catch (error) {

        console.log(
            "MAL API error:",
            error.response?.status,
            error.response?.data || error.message
        );


        if (req.headers.accept?.includes("application/json")) {
            return res.status(500).json({
                error: "Failed to load more anime."
            });
        }

        res.status(500).send(
            "Failed to load more anime."
        );
    }
});


export default router;