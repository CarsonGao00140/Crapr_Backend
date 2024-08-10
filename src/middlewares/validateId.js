import { isValidObjectId } from 'mongoose';
import service from '../services/data.js';
import { BadRequestError, DataNotFoundError } from '../utilities/error.js';

export default (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new BadRequestError("Invalid ID.");

    service.exists(id)
        .then(exists => {
            if (!exists) throw new DataNotFoundError(id);
            next();
        })
        .catch(next);
}