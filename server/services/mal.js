import axios from "axios";
import { getValidAccessToken } from "./auth.js";

async function searchAnime(query) {

    const token = await getValidAccessToken();

    if (!token) {
        return null;
    }

    const response = await axios.get(
        "https://api.myanimelist.net/v2/anime",
        {
            params: {
                q: query,
                limit: 10,
                fields:
                    "id,title,main_picture,media_type," +
                    "alternative_titles,start_date,end_date," +
                    "synopsis,mean,rank,popularity," +
                    "num_episodes,status,genres,studios"
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

async function getNextPage(nextUrl) {

    const token = await getValidAccessToken();

    if (!token) {
        return null;
    }

    const response = await axios.get(
        nextUrl,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

export {
    searchAnime,
    getNextPage
};