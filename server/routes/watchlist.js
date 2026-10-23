import express from "express";
import pool from "../db/database.js";

const router = express.Router();

// GET /watchlist - Returns all watchlist items
router.get("/watchlist", async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                anime.id AS anime_db_id,
                anime.mal_id,
                anime.title,
                anime.poster,
                anime.media_type,
                anime.episodes,
                watchlist.id AS watchlist_id,
                watchlist.status,
                watchlist.episodes_watched,
                watchlist.score,
                watchlist.updated_at
            FROM watchlist
            JOIN anime
                ON watchlist.anime_id = anime.id
            ORDER BY watchlist.updated_at DESC
        `);

        return res.json({
            data: rows
        });
    } catch (error) {
        console.error("Failed to load watchlist:", error.message);
        return res.status(500).json({
            error: "Failed to load watchlist."
        });
    }
});

// POST /watchlist/add - Adds anime to watchlist
router.post("/watchlist/add", async (req, res) => {
    const {
        mal_id,
        title,
        poster,
        media_type,
        synopsis,
        episodes,
        status = "plan_to_watch",
        start_date,
        end_date
    } = req.body;

    if (!mal_id || !title) {
        return res.status(400).json({
            error: "mal_id and title are required"
        });
    }

    try {
        // Upsert anime record
        const animeRes = await pool.query(
            `
            INSERT INTO anime
            (
                mal_id,
                title,
                poster,
                media_type,
                synopsis,
                episodes,
                status,
                start_date,
                end_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (mal_id) DO UPDATE SET
                title = EXCLUDED.title,
                poster = COALESCE(EXCLUDED.poster, anime.poster),
                media_type = COALESCE(EXCLUDED.media_type, anime.media_type),
                synopsis = COALESCE(EXCLUDED.synopsis, anime.synopsis),
                episodes = COALESCE(EXCLUDED.episodes, anime.episodes),
                status = COALESCE(EXCLUDED.status, anime.status),
                start_date = COALESCE(EXCLUDED.start_date, anime.start_date),
                end_date = COALESCE(EXCLUDED.end_date, anime.end_date)
            RETURNING id
            `,
            [
                mal_id,
                title,
                poster || null,
                media_type || null,
                synopsis || null,
                episodes || null,
                null,
                start_date || null,
                end_date || null
            ]
        );

        const animeId = animeRes.rows[0].id;

        // Upsert into watchlist
        await pool.query(
            `
            INSERT INTO watchlist (anime_id, status, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (anime_id) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP
            `,
            [animeId, status]
        );

        return res.json({
            success: true,
            message: "Added to watchlist",
            mal_id: Number(mal_id),
            status
        });

    } catch (error) {
        console.error("Failed to add anime to watchlist:", error.message);
        return res.status(500).json({
            error: "Failed to add anime to library."
        });
    }
});

// PUT /watchlist/:mal_id - Updates status, episodes_watched, or score
router.put("/watchlist/:mal_id", async (req, res) => {
    const malId = Number(req.params.mal_id);
    const { status, episodes_watched, score } = req.body;

    if (!malId || isNaN(malId)) {
        return res.status(400).json({ error: "Invalid anime ID" });
    }

    try {
        const updateRes = await pool.query(
            `
            UPDATE watchlist
            SET
                status = COALESCE($1, status),
                episodes_watched = COALESCE($2, episodes_watched),
                score = COALESCE($3, score),
                updated_at = CURRENT_TIMESTAMP
            WHERE anime_id = (SELECT id FROM anime WHERE mal_id = $4)
            RETURNING *
            `,
            [
                status || null,
                episodes_watched !== undefined ? Number(episodes_watched) : null,
                score !== undefined ? Number(score) : null,
                malId
            ]
        );

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ error: "Anime not found in watchlist" });
        }

        return res.json({
            success: true,
            message: "Watchlist updated",
            data: updateRes.rows[0]
        });

    } catch (error) {
        console.error("Failed to update watchlist:", error.message);
        return res.status(500).json({ error: "Failed to update watchlist entry." });
    }
});

// DELETE /watchlist/:mal_id - Removes anime from watchlist
router.delete("/watchlist/:mal_id", async (req, res) => {
    const malId = Number(req.params.mal_id);

    if (!malId || isNaN(malId)) {
        return res.status(400).json({ error: "Invalid anime ID" });
    }

    try {
        const deleteRes = await pool.query(
            `
            DELETE FROM watchlist
            WHERE anime_id = (SELECT id FROM anime WHERE mal_id = $1)
            RETURNING id
            `,
            [malId]
        );

        if (deleteRes.rows.length === 0) {
            return res.status(404).json({ error: "Anime not found in watchlist" });
        }

        return res.json({
            success: true,
            message: "Removed from watchlist",
            mal_id: malId
        });

    } catch (error) {
        console.error("Failed to remove anime from watchlist:", error.message);
        return res.status(500).json({ error: "Failed to remove anime from watchlist." });
    }
});

export default router;