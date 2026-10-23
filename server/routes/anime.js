import express from "express";

import pool from "../db/database.js";
import { getAnimeDetails } from "../services/mal.js";

const router = express.Router();

router.get("/anime/:mal_id", async (req, res) => {
    const malId = Number(req.params.mal_id);

    if (!malId || isNaN(malId)) {
        return res.status(400).json({ error: "Invalid anime ID" });
    }

    try {
        const { rows: dbRows } = await pool.query(
            `
            SELECT
                anime.*,
                watchlist.id AS watchlist_id,
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

        const dbRecord = dbRows[0] || null;

        try {
            const malData = await getAnimeDetails(malId);

            if (malData) {
                const responseData = {
                    ...malData,
                    in_watchlist: !!dbRecord?.watchlist_id,
                    watchlist_status: dbRecord?.watchlist_status || null,
                    episodes_watched: dbRecord?.episodes_watched ?? 0,
                    user_score: dbRecord?.user_score ?? null
                };

                return res.json({ data: responseData });
            }
        } catch (malError) {
            console.warn("MAL API fetch failed, checking database fallback:", malError.message);
        }


        if (dbRecord) {
            const fallbackData = {
                id: dbRecord.mal_id,
                title: dbRecord.title,
                main_picture: dbRecord.poster ? { large: dbRecord.poster } : null,
                media_type: dbRecord.media_type,
                synopsis: dbRecord.synopsis,
                num_episodes: dbRecord.episodes,
                status: dbRecord.status,
                start_date: dbRecord.start_date,
                end_date: dbRecord.end_date,
                in_watchlist: !!dbRecord.watchlist_id,
                watchlist_status: dbRecord.watchlist_status || null,
                episodes_watched: dbRecord.episodes_watched ?? 0,
                user_score: dbRecord.user_score ?? null,
                genres: [],
                studios: []
            };

            return res.json({ data: fallbackData });
        }

        return res.status(404).json({ error: "Anime not found." });

    } catch (error) {
        console.error("Failed to load anime:", error.message);
        return res.status(500).json({ error: "Failed to load anime." });
    }
});

export default router;