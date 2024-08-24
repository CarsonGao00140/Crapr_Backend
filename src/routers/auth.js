import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import handleRequest from '../middlewares/handleRequest.js';

const router = Router();

router.use(handleRequest());

router.get('/google', (req, res) => {
    const { redirect_url } = req.query;
    const state = redirect_url
        ? encodeURIComponent(JSON.stringify({ redirect_url }))
        : undefined;

    return passport.authenticate("google", {
        scope: ["profile"],
        state
    })(req, res);
});

router.get('/google/callback',
    passport.authenticate(
        "google", { failureRedirect: "/fail", session: false }
    ),
    (req, res) => {
        const state = req.query.state
            ? JSON.parse(decodeURIComponent(req.query.state))
            : undefined;
        const params = new URLSearchParams(state);
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
        params.append("token", token);
        res.redirect(`${process.env.WEB_URL}/signin?${params}`);
    }
);

router.get('/fail', (req, res) =>
    res.send("Something went wrong during Sign in with Google.")); 

export default router;