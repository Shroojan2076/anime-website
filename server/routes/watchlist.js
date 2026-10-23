import express from "express";
import db from "../config/database.js";

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

        const [result] = await db.execute(
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                poster = VALUES(poster),
                media_type = VALUES(media_type),
                synopsis = VALUES(synopsis),
                episodes = VALUES(episodes),
                status = VALUES(status),
                start_date = VALUES(start_date),
                end_date = VALUES(end_date)
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

        const [animeRows] = await db.execute(
            "SELECT id FROM anime WHERE mal_id = ?",
            [mal_id]
        );

        const animeId = animeRows[0].id;

        await db.execute(
            `
            INSERT INTO watchlist
            (
                anime_id,
                status
            )
            VALUES (?, 'plan_to_watch')
            ON DUPLICATE KEY UPDATE
                anime_id = anime_id
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

        const [rows] = await db.execute(`
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