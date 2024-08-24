import passport from 'passport';
import { UnauthenticatedError } from '../utilities/error.js';

export default (req, res, next) => {
    if (!req.headers.authorization)
        throw new UnauthenticatedError("JWT token not provided.");

    return passport.authenticate("bearer", {
        session: false,
        failWithError: true,
    })(req, res, next);
};