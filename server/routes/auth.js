import express from "express";

import {
    clientId,
    redirectUri,
    codeVerifier,
    exchangeAuthorizationCode
} from "../services/auth.js";

const router = express.Router();

router.get("/login", (req, res) => {

    const authUrl =
        `https://myanimelist.net/v1/oauth2/authorize` +
        `?response_type=code` +
        `&client_id=${clientId}` +
        `&code_challenge=${codeVerifier}` +
        `&code_challenge_method=plain` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    res.redirect(authUrl);
});

router.get("/oauth", async (req, res) => {

    const code = req.query.code;

    console.log("Authorization code received");

    try {

        await exchangeAuthorizationCode(code);

        console.log("MAL authentication successful.");

        res.redirect("/");

    } catch (error) {

        console.log(
            error.response?.data || error.message
        );

        res.status(500).send(
            "MAL authentication failed."
        );
    }
});

export default router;