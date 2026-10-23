import axios from "axios";
import "dotenv/config";

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const malHeaders = {
    "X-MAL-CLIENT-ID": MAL_CLIENT_ID
};

const animeFields =
    "id,title,main_picture,media_type," +
    "alternative_titles,start_date,end_date," +
    "synopsis,mean,rank,popularity," +
    "num_episodes,status,genres,studios";

async function searchAnime(query) {
    const response = await axios.get(
        "https://api.myanimelist.net/v2/anime",
        {
            params: {
                q: query,
                limit: 10,
                fields: animeFields
            },
            headers: malHeaders
        }
    );

    return response.data;
}

async function getNextPage(nextUrl) {
    const response = await axios.get(
        nextUrl,
        {
            headers: malHeaders
        }
    );

    return response.data;
}

async function getAnimeDetails(id) {
    const response = await axios.get(
        `https://api.myanimelist.net/v2/anime/${id}`,
        {
            params: {
                fields: animeFields
            },
            headers: malHeaders
        }
    );

    return response.data;
}

export {
    searchAnime,
    getNextPage,
    getAnimeDetails
};