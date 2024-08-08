import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

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

router.get('/google/callback', passport.authenticate(
    "google", {
        failureRedirect: "/fail",
        session: false,
    }),
    (req, res) => {
        const { state } = req.query;

        const redirect_url = state
            ? JSON.parse(decodeURI(state)).redirect_url
            : undefined;
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);

        res.redirect(`${redirect_url ?? "/success"}?token=${token}`);
    }
);

router.get('/dev', (req, res) => res.send('Successfully logged in!'));

router.get('/fail', (req, res) => res.send('Failed to log in!'));

export default router;