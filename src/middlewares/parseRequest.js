import Express from 'express';
import Multer from 'multer';
import lodash from 'lodash';
import { BadRequestError } from '../utilities/error.js';

const multer = Multer();

export default (req, res, next) =>
    req.headers['content-type']?.split(';')[0] === 'multipart/form-data'
        ? multer.any()(req, res, err => {
            if (err) return next(err);
            if (!req.body?.data) return next(new BadRequestError("The 'data' field is required."));
            
            req.body = JSON.parse(req.body.data);
            req.files.forEach(({ fieldname, buffer }) => {
                const array = lodash.get(req.body, fieldname, []);
                lodash.set(req.body, fieldname, [...array, buffer]);
            });
            next();
        })
        : Express.json()(req, res, next);