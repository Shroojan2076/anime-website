import express from "express";
import pool from "../db/database.js";

const router = express.Router();

router.post("/watchlist/add", async (req, res) => {

    const {
        mal_id,
        title,
        poster,
        media_type,
        synopsis,
        episodes,
        status,
        start_date,
        end_date
    } = req.body;

    try {

        await pool.query(
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
                poster = EXCLUDED.poster,
                media_type = EXCLUDED.media_type,
                synopsis = EXCLUDED.synopsis,
                episodes = EXCLUDED.episodes,
                status = EXCLUDED.status,
                start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date
            `,
            [
                mal_id,
                title,
                poster || null,
                media_type || null,
                synopsis || null,
                episodes || null,
                status || null,
                start_date || null,
                end_date || null
            ]
        );

        const { rows: animeRows } = await pool.query(
            "SELECT id FROM anime WHERE mal_id = $1",
            [mal_id]
        );

        const animeId = animeRows[0].id;

        await pool.query(
            `
            INSERT INTO watchlist
            (
                anime_id,
                status
            )
            VALUES ($1, 'plan_to_watch')
            ON CONFLICT (anime_id) DO NOTHING
            `,
            [animeId]
        );

        res.redirect(`/anime/${mal_id}?added=true`);

    } catch (error) {

        console.error(
            "Failed to add anime:",
            error.message
        );

        res.status(500).send(
            "Failed to add anime to library."
        );
    }
});

router.get("/watchlist", async (req, res) => {

    try {

        const { rows } = await pool.query(`
            SELECT
                anime.id,
                anime.mal_id,
                anime.title,
                anime.poster,
                anime.media_type,
                anime.episodes,
                watchlist.status,
                watchlist.episodes_watched,
                watchlist.score
            FROM watchlist
            JOIN anime
                ON watchlist.anime_id = anime.id
            ORDER BY watchlist.updated_at DESC
        `);

        res.render("watchlist.ejs", {
            data: rows
        });

    } catch (error) {

        console.error(
            "Failed to load watchlist:",
            error.message
        );

        res.status(500).send(
            "Failed to load watchlist."
        );
    }
});

export default router;