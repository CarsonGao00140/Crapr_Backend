import service from '../services/service.js';
import { BadRequestError, ForbiddenError } from '../utilities/error.js';

const checkAuth = req => {if(req.body.owner !== req.user.id) throw new ForbiddenError};
const clearSensitive = ({ _doc: { location, buyer, suggestion, ...rest } }) => rest;

const create = (req, res, next) => {
    checkAuth(req);
    service.write(req.body)
        .then(data => res.status(201).json({ data }))
        .catch(next);
};

const getAll = (req, res, next) => {
    const missingParams = ['query', 'long', 'lat', 'distance'].filter(param => !req.query[param]);
    if (missingParams.length)
        throw new BadRequestError(`Missing required parameters: ${missingParams.join(', ')}.`);
    
    const { query, long, lat, distance, show_taken } = req.query;

    service.readAll({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ],
        status: show_taken ? { $ne: 'FLUSHED' } : 'AVAILABLE',
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [long, lat] },
                $maxDistance: distance
            }
        }
    })
        .then(data => data.map(clearSensitive))
        .then(data => res.json({ data }))
        .catch(next);
};

const getPartial = (req, res, next) =>
    service.readAll({ owner: req.user.id })
        .then(data => res.json({ data }))
        .catch(next);

const get = (req, res, next) => {
    const related = req.data.owner.equals(req.user.id) || req.data.buyer.equals(req.user.id);
    res.json({data: related ? req.data : clearSensitive(req.data)});
}; 

const update = (req, res, next) => {
    checkAuth(req);
    service.overwrite(req.params.id, req.body)
        .then(data => res.json({ data }))
        .catch(next);
};

const updatePartial = (req, res, next) => {
    checkAuth(req);
    service.modify(req.params.id, req.body)
        .then(data => res.json({ data }))
        .catch(next);
};

const remove = (req, res, next) => {
    checkAuth(req);
    service.remove(req.params.id, req.body)
        .then(() => res.status(204).end())
        .catch(next);
};

export default { create, getAll, getPartial, get, update, updatePartial, remove };