import express from "express";

import db from "../config/database.js";

import {
    getSearchState
} from "../services/searchState.js";

const router = express.Router();

router.get("/anime/:mal_id", async (req, res) => {

    const malId = Number(req.params.mal_id);

    /*
     * 1. Check current search cache
     */

    const search = getSearchState();

    const cachedAnime = search.results.find(
        anime => anime.node.id === malId
    );

    if (cachedAnime) {

        return res.render("anime-page.ejs", {
            data: cachedAnime.node,
            added: req.query.added === "true"
        });
    }


    /*
     * 2. Not in cache → check database
     */

    try {

        const [rows] = await db.execute(
            `
            SELECT
                anime.*,
                watchlist.status AS watchlist_status,
                watchlist.episodes_watched,
                watchlist.score AS user_score,
                watchlist.started_at,
                watchlist.completed_at
            FROM anime
            LEFT JOIN watchlist
                ON watchlist.anime_id = anime.id
            WHERE anime.mal_id = ?
            `,
            [malId]
        );


        /*
         * 3. Anime doesn't exist anywhere
         */

        if (rows.length === 0) {

            return res.status(404).send(
                "Anime not found."
            );
        }


        /*
         * 4. Convert database structure
         *    into the structure expected by anime-page.ejs
         */

        const anime = rows[0];

        const data = {
            id: anime.mal_id,

            title: anime.title,

            main_picture: anime.poster
                ? {
                    large: anime.poster
                }
                : null,

            media_type: anime.media_type,

            synopsis: anime.synopsis,

            num_episodes: anime.episodes,

            status: anime.status,

            start_date: anime.start_date,

            end_date: anime.end_date,

            mean: null,
            rank: null,
            popularity: null,

            genres: [],
            studios: [],
            alternative_titles: {}
        };


        res.render("anime-page.ejs", {
            data,
            added: req.query.added === "true"
        });

    } catch (error) {

        console.error(
            "Failed to load anime:",
            error.message
        );

        res.status(500).send(
            "Failed to load anime."
        );
    }
});

export default router;