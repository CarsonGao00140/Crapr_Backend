import { isValidObjectId } from 'mongoose';
import service from '../services/service.js';
import { BadRequestError, DataNotFoundError } from '../utilities/error.js';

export default (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new BadRequestError("Invalid ID.");
    service.read(id)
        .then(data => {
            if (!data) throw new DataNotFoundError(id);
            req.data = data;
            next();
        })
        .catch(next);
}