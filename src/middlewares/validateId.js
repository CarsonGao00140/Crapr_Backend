import { isValidObjectId } from 'mongoose';
import mongo from '../services/mongo.js';
import { BadRequestError, DataNotFoundError } from '../utilities/error.js';

export default (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new BadRequestError("Invalid ID.");

    mongo.read(id)
        .then(data => {
            if (!data) throw new DataNotFoundError(id);
            req.doc = data;
            next();
        })
        .catch(next);
}