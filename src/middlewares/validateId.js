import { isValidObjectId } from 'mongoose';
import mongo from '../services/mongo.js';
import { BadRequestError, NotFoundError } from '../utilities/error.js';

export default (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new BadRequestError("Invalid ID.");

    mongo.read(id)
        .then(doc => {
            if (!doc) throw new NotFoundError(`Crap with id ${id}.`);
            req.doc = doc;
            next();
        })
        .catch(next);
}