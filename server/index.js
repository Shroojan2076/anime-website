import express from "express";
import "dotenv/config";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import animeRoutes from "./routes/anime.js";
import watchlistRoutes from "./routes/watchlist.js";

const app = express();

const port = 3000;

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.static("public"));

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");


app.use(authRoutes);

app.use(searchRoutes);

app.use(animeRoutes);

app.use(watchlistRoutes);


app.listen(port, () => {

    console.log(
        `Server is running at http://localhost:${port}`
    );

});