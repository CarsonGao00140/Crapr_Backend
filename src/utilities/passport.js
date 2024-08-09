import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import BearerStrategy from 'passport-http-bearer';
import jwt from 'jsonwebtoken';
import user from '../models/user.js';
import { UnauthenticatedError, UserNotFoundError } from './error.js';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, callback) =>
            user.findOneAndUpdate(
                { googleId: profile.id },
                { $set: {
                    name: profile.displayName,
                    googleId: profile.id
                } },
                { upsert: true, new: true }
            )
            .then(userData => callback(null, userData))
            .catch(callback)
    )
);

passport.use(
    new BearerStrategy(
        (token, callback) => {
            try {
                token = jwt.verify(token, process.env.JWT_SECRET);
            } catch (error) {
                throw new UnauthenticatedError;
            }

            user.findById(token.id)
                .then(userData => {
                    if (!userData) throw new UserNotFoundError;
                    callback(null, userData)
                })
                .catch(callback);
        }
    )
);