const API_URL = "http://localhost:3000";

export async function searchAnime(query) {

    const response = await fetch(`${API_URL}/`, {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },

        body: new URLSearchParams({
            "search-anime": query
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to search anime"
        );
    }

    return data;
}


export async function loadMoreAnime() {

    const response = await fetch(
        `${API_URL}/next`,
        {
            headers: {
                "Accept": "application/json"
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to load more anime"
        );
    }

    return data;
}