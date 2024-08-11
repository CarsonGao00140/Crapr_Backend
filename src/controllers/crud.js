import model from '../models/crap.js';
import gcs from '../services/gcs.js';
import mongo from '../services/mongo.js';
import { BadRequestError, ForbiddenError } from '../utilities/error.js';

const checkRequest = ({ body, user }) => { if(body.owner && body.owner !== user.id)
    throw new ForbiddenError("You can't set the owner to someone else");
};
const checkAuth = ({ doc, user }) => { if(!doc.owner.equals(user.id))
    throw new ForbiddenError("You are not the owner of this crap");
};
const clearSensitive = ({ _doc: { location, buyer, suggestion, ...rest } }) => rest;

const create = (req, res, next) => {
    checkRequest(req);
    
    const crap = new model(req.body);
    crap.validate()
        .then(() => gcs.write(crap))
        .then(() => crap.save())
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
        .then(data => Promise.all(data.map(item => gcs.read(item).then(() => item))))
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
        .then(data => Promise.all(data.map(item => gcs.read(item).then(() => item))))
        .then(data => res.json({ data }))
        .catch(next);

const get = (req, res, next) => {
    const related = req.doc.owner.equals(req.user.id) || req.doc.buyer.equals(req.user.id);

    gcs.read(related ? req.doc : clearSensitive(req.doc))
        .then(() => res.json({ data: req.doc }))
        .catch(next);
};

const update = (req, res, next) => {
    checkRequest(req);
    checkAuth(req);

    const { images } = req.doc;
    req.doc.overwrite({});
    req.doc.set(req.body);
    req.doc.validate()
        .then(() => gcs.remove({ images }))
        .then(() => gcs.write(req.doc))
        .then(() => req.doc.save())
        .then(data => res.json({ data }))
        .catch(next);
};

const updatePartial = (req, res, next) => {
    checkRequest(req);
    checkAuth(req);

    const { images } = req.doc;
    req.doc.set(req.body);
    req.doc.validate()
        .then(() => req.body.images && gcs.remove({ images }))
        .then(() => req.body.images && gcs.write(req.doc))
        .then(() => req.doc.save())
        .then(data => res.json({ data }))
        .catch(next);
};

const remove = (req, res, next) => {
    checkAuth(req);

    req.doc.deleteOne()
        .then(gcs.remove)
        .then(() => res.status(204).end())
        .catch(next);
};

export default { create, getAll, getPartial, get, update, updatePartial, remove };