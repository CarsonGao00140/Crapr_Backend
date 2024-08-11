import { isValidObjectId } from 'mongoose';
import mongo from '../services/mongo.js';
import { BadRequestError, DataNotFoundError } from '../utilities/error.js';

export default (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new BadRequestError("Invalid ID.");

    mongo.check(id)
        .then(result => {
            if (!result) throw new DataNotFoundError(id);
            next();
        })
        .catch(next);
}