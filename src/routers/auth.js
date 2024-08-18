import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import handleRequest from '../middlewares/handleRequest.js';

const router = Router();

router.use(handleRequest());

router.get('/google', (req, res) => {
    const { redirect_url } = req.query;
    const state = redirect_url
        ? encodeURI(JSON.stringify({ redirect_url }))
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
        const url = req.query.state
            ? JSON.parse(decodeURI(req.query.state)).redirect_url
            : "/success";

        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
        res.cookie('token', encodeURIComponent(token), {
            // secure: true,
            sameSite: 'None'
        });
        res.redirect(url);
    }
);

router.get('/fail', (req, res) =>
    res.send("Something went wrong during Sign in with Google.")); 

export default router;