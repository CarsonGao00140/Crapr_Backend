import mongo from '../services/mongo.js';
import gcs from '../services/gcs.js';
import { BadRequestError, ForbiddenError } from '../utilities/error.js';

const checkRequest = req => {
    if(req.body.owner && req.body.owner !== req.user.id) throw new ForbiddenError
};
const checkAuth = req => mongo.read(req.params.id)
    .then(({ owner }) => {if(!owner.equals(req.user.id)) throw new ForbiddenError});
const clearSensitive = ({ _doc: { location, buyer, suggestion, ...rest } }) => rest;

const create = (req, res, next) => {
    checkRequest(req);
    gcs.write(req.body)
        .then(mongo.write)
        .then(data => res.status(201).json({ data }))
        .catch(next);
};

const getAll = (req, res, next) => {
    const missingParams = ['query', 'long', 'lat', 'distance'].filter(param => !req.query[param]);
    if (missingParams.length)
        throw new BadRequestError(`Missing required parameters: ${missingParams.join(', ')}.`);
    const { query, long, lat, distance, show_taken } = req.query;
    
    mongo.readAll({
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
        .then(data => Promise.all(data.map(gcs.read)))
        .then(data => res.json({ data }))
        .catch(next);
};

const getPartial = (req, res, next) =>
    mongo.readAll({
        $or: [
            { owner: req.user.id },
            { buyer: req.user.id }
        ]
    })
        .then(data => Promise.all(data.map(gcs.read)))
        .then(data => res.json({ data }))
        .catch(next);

const get = (req, res, next) =>
    mongo.read(req.params.id)
        .then(data =>
            data.owner.equals(req.user.id) || data.buyer.equals(req.user.id)
            ? data : clearSensitive(data)
        )
        .then(gcs.read)
        .then(data => res.json({ data }))
        .catch(next);

const update = (req, res, next) => {
    checkRequest(req)
    checkAuth(req)
        .then(() => gcs.write(req.body))
        .then(data => mongo.overwrite(req.params.id, data))
        .then(data => res.json({ data }))
        .catch(next);
};

const updatePartial = (req, res, next) => {
    checkRequest(req)
    checkAuth(req)
        .then(() => gcs.write(req.body))
        .then(data => mongo.modify(req.params.id, data))
        .then(data => res.json({ data }))
        .catch(next);
};

const remove = (req, res, next) =>
    checkAuth(req)
        .then(() => mongo.remove(req.params.id))
        .then(gcs.remove)
        .then(() => res.status(204).end())
        .catch(next);

export default { create, getAll, getPartial, get, update, updatePartial, remove };