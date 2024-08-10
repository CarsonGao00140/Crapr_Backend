import service from '../services/data.js';
import { BadRequestError, ForbiddenError } from '../utilities/error.js';

const checkRequest = req => {if(req.body.owner && req.body.owner !== req.user.id) throw new ForbiddenError};
const checkAuth = req => service.read(req.params.id)
    .then(({ owner }) => {if(!owner.equals(req.user.id)) throw new ForbiddenError});
const clearSensitive = ({ _doc: { location, buyer, suggestion, ...rest } }) => rest;

const create = (req, res, next) => {
    checkRequest(req);
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
    service.readAll({
        $or: [
            { owner: req.user.id },
            { buyer: req.user.id }
        ]
    })
        .then(data => res.json({ data }))
        .catch(next);

const get = (req, res, next) =>
    service.read(req.params.id)
        .then(data => {
            const related = data.owner.equals(req.user.id) || data.buyer.equals(req.user.id);
            res.json({data: related ? data : clearSensitive(data)});
        })
        .catch(next);

const update = (req, res, next) => {
    checkRequest(req)
    checkAuth(req)
        .then(() => service.overwrite(req.params.id, req.body))
        .then(data => res.json({ data }))
        .catch(next);
};

const updatePartial = (req, res, next) => {
    checkRequest(req)
    checkAuth(req)
        .then(() => service.modify(req.params.id, req.body))
        .then(data => res.json({ data }))
        .catch(next);
};

const remove = (req, res, next) =>
    checkAuth(req)
        .then(() => service.remove(req.params.id, req.body))
        .then(() => res.status(204).end())
        .catch(next);

export default { create, getAll, getPartial, get, update, updatePartial, remove };