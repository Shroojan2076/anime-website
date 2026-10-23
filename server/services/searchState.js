let currentSearch = {
    query: "",
    results: [],
    nextUrl: null
};

export function getSearchState() {
    return currentSearch;
}

export function setSearchState(search) {
    currentSearch = search;
}

export function appendSearchResults(results) {
    currentSearch.results.push(...results);
}

export function updateNextUrl(nextUrl) {
    currentSearch.nextUrl = nextUrl;
}