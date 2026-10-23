import crypto from "crypto";
import "dotenv/config";
import axios from "axios";
import fs from "fs";

const clientId = process.env.MAL_CLIENT_ID;
const clientSecret = process.env.MAL_CLIENT_SECRET;

const redirectUri = "http://localhost:3000/oauth";

const codeVerifier = crypto.randomBytes(32).toString("hex");

const tokenFile = "./tokens.json";

let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = null;

const savedTokens = loadTokens();

if (savedTokens) {
    accessToken = savedTokens.access_token;
    refreshToken = savedTokens.refresh_token;
    tokenExpiresAt = savedTokens.expires_at;

    console.log("Saved MAL tokens loaded.");
}

function loadTokens() {
    if (!fs.existsSync(tokenFile)) {
        return null;
    }

    const data = fs.readFileSync(tokenFile, "utf-8");

    return JSON.parse(data);
}

function saveTokens(tokens) {
    fs.writeFileSync(
        tokenFile,
        JSON.stringify(tokens, null, 4)
    );
}

async function refreshAccessToken() {
    try {
        const response = await axios.post(
            "https://myanimelist.net/v1/oauth2/token",
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "refresh_token",
                refresh_token: refreshToken
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const tokens = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_at: Date.now() + (response.data.expires_in * 1000)
        };

        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;
        tokenExpiresAt = tokens.expires_at;

        saveTokens(tokens);

        console.log("MAL access token refreshed.");

        return accessToken;

    } catch (error) {
        console.log(
            "Token refresh failed:",
            error.response?.data || error.message
        );

        accessToken = null;
        refreshToken = null;
        tokenExpiresAt = null;

        return null;
    }
}

async function getValidAccessToken() {

    if (!accessToken || !refreshToken) {
        return null;
    }

    // Refresh if token expires within the next 60 seconds
    if (Date.now() >= tokenExpiresAt - 60000) {
        return await refreshAccessToken();
    }

    return accessToken;
}

async function exchangeAuthorizationCode(code) {

    const response = await axios.post(
        "https://myanimelist.net/v1/oauth2/token",

        new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code: code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri
        }),

        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            }
        }
    );

    const tokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at:
            Date.now() +
            (response.data.expires_in * 1000)
    };

    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    tokenExpiresAt = tokens.expires_at;

    saveTokens(tokens);
}

export {
    clientId,
    clientSecret,
    redirectUri,
    codeVerifier,
    exchangeAuthorizationCode,
    getValidAccessToken
};