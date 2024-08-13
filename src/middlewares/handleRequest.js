import Multer from 'multer';
import lodash from 'lodash';
import Express from 'express';
import { BadRequestError } from '../utilities/error.js';

const multer = Multer();

const parseForm = (req, res, next) =>
    multer.any()(req, res, err => {   
        try {
            if (err) throw err;
            if (!req.body.data) throw new Error("The 'data' field is required.");
            req.body = JSON.parse(req.body.data);
        } catch ({ message }) {
            return next(new BadRequestError(message));
        };

        req.files.forEach(({ fieldname, buffer }) => {
            const array = lodash.get(req.body, fieldname, []);
            lodash.set(req.body, fieldname, [...array, buffer]);
        });

        next();
    });

export default expectType =>
    (req, res, next) => {
        const type = req.headers['content-type'];
        switch (expectType) {
            case 'json':
                if (type !== 'application/json') return next(
                    new BadRequestError("Content type must be 'application/json'.")
                );

                Express.json()(req, res, next);
                break;
            case 'form':
                if (!type?.includes('multipart/form-data')) return next(
                    new BadRequestError("Content type must be 'multipart/form-data'.")
                )

                parseForm(req, res, next);
                break;
            case 'json or form':
                if (type !== 'application/json' && !type?.includes('multipart/form-data')) return next(
                    new BadRequestError("Content type must be 'application/json' or 'multipart/form-data'.")
                );

                (type === 'application/json' ? Express.json() : parseForm)(req, res, next);
                break;
            default:
                next(type && new BadRequestError(`Content type must be undefined.`));
        };
    };