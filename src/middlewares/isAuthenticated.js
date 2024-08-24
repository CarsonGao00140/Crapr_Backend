import cookie from 'cookie';
import passport from 'passport';
import { UnauthenticatedError } from '../utilities/error.js';

export default (req, res, next) => {
    console.log(req.headers.authorization);
    req.headers.authorization ||= `bearer ${cookie.parse(req.headers.cookie || '').token}`;
    console.log(req.headers.authorization);
    if (!req.headers.authorization)
        throw new UnauthenticatedError("JWT token not provided.");

    return passport.authenticate("bearer", {
        session: false,
        failWithError: true,
    })(req, res, next);
};