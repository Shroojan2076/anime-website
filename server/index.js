import express from "express";
import "dotenv/config";
import cors from "cors";

import searchRoutes from "./routes/search.js";
import animeRoutes from "./routes/anime.js";
import watchlistRoutes from "./routes/watchlist.js";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.includes("*") ||
                allowedOrigins.includes(origin) ||
                origin.endsWith(".vercel.app")
            ) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// API Routes
app.use(searchRoutes);
app.use(animeRoutes);
app.use(watchlistRoutes);

// 404 Not Found JSON Handler
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized JSON Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err.stack || err.message);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});