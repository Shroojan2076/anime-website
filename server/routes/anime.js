import express from "express";

import pool from "../db/database.js";
import { getSearchState } from "../services/searchState.js";
import { getAnimeDetails } from "../services/mal.js";

const router = express.Router();

router.get("/anime/:mal_id", async (req, res) => {
    const malId = Number(req.params.mal_id);

    if (isNaN(malId)) {
        return res.status(400).json({ error: "Invalid anime ID" });
    }

    /*
     * 1. Check current search cache
     */
    const search = getSearchState();
    const cachedAnime = search.results.find(
        anime => anime.node.id === malId
    );

    if (cachedAnime) {
        return res.json({ data: cachedAnime.node });
    }

    /*
     * 2. Not in cache -> Check database
     */
    try {
        const { rows } = await pool.query(
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
            WHERE anime.mal_id = $1
            `,
            [malId]
        );

        if (rows.length > 0) {
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
                watchlist_status: anime.watchlist_status,
                episodes_watched: anime.episodes_watched,
                user_score: anime.user_score,
                mean: null,
                rank: null,
                popularity: null,
                genres: [],
                studios: [],
                alternative_titles: {}
            };

            return res.json({ data });
        }

        /*
         * 3. Not in cache or database -> Fetch directly from MyAnimeList API
         */
        const malAnime = await getAnimeDetails(malId);
        if (malAnime) {
            return res.json({ data: malAnime });
        }

        return res.status(404).json({ error: "Anime not found." });

    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: "Anime not found." });
        }

        console.error("Failed to load anime:", error.message);
        return res.status(500).json({ error: "Failed to load anime." });
    }
});

export default router;