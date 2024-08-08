import passport from 'passport';
import { NoValidTokenError } from '../utilities/error.js';

export default (req, res, next) => {
    if (!req.headers.authorization) throw new NoValidTokenError;

    return passport.authenticate("bearer", {
        session: false,
        failWithError: true,
    })(req, res, next);
};