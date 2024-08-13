import Crap from '../models/crap.js';
import gcs from '../services/gcs.js';
import mongo from '../services/mongo.js';
import checkAuth from '../utilities/checkAuth.js';
import { BadRequestError, ForbiddenError } from '../utilities/error.js';

const checkRequest = ({ body, user }) => {
    if(body.owner || body.buyer)
        throw new ForbiddenError("You can't set the owner or buyer.");
};

const clearSensitive = ({ location, buyer, suggestion, ...rest }) => rest;

const insertUser = data =>
    mongo.readUser(data.owner)
        .then(owner => ({ ...data, owner }))
            .then(data => data.buyer
                ? mongo.readUser(data.buyer)
                    .then(buyer => ({ ...data, buyer }))
                : data
            )
            
const create = (req, res, next) => {
    checkRequest(req);
    
    const crap = new Crap({ ...req.body, owner: req.user.id });
    crap.validate()
        .then(() => gcs.write(req.body))
        .then(names => crap.images = names)
        .then(() => crap.save({ validateBeforeSave: false }))
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
        .then(docs => Promise.all(docs.map(doc =>
            gcs.read(doc)
                .then(clearSensitive)
                .then(insertUser)
        )))
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
        .then(docs => Promise.all(docs.map(doc =>
            gcs.read(doc)
                .then(insertUser)
        )))
        .then(data => res.json({ data }))
        .catch(next);

const get = (req, res, next) =>
    gcs.read(req.doc)
        .then(data => checkAuth(req, ['owner', 'buyer'], true)
            ? data
            : clearSensitive(data)
        )
        .then(insertUser)
        .then(data => res.json({ data }))
        .catch(next);

const update = (req, res, next) => {
    checkRequest(req);
    checkAuth(req, ['owner']);

    const { images, owner } = req.doc;
    req.doc.overwrite({ ...req.body, owner });
    req.doc.validate()
        .then(() => Promise.all([
            gcs.remove({ images }),
            gcs.write(req.body)
        ]))
        .then(([, names]) => req.doc.images = names)
        .then(() => req.doc.save({ validateBeforeSave: false }))
        .then(data => res.json({ data }))
        .catch(next);
};

const updatePartial = (req, res, next) => {
    checkRequest(req);
    checkAuth(req, ['owner']);

    const { images } = req.doc;
    req.doc.set(req.body);
    req.doc.validate()
        .then(() => req.body.images && Promise.all([
            gcs.remove({ images }),
            gcs.write(req.doc)
        ]))
        .then(([, names]) => req.doc.images = names)
        .then(() => req.doc.save({ validateBeforeSave: false }))
        .then(data => res.json({ data }))
        .catch(next);
};

const remove = (req, res, next) => {
    checkAuth(req, ['owner']);

    const { images } = req.doc;
    req.doc.deleteOne()
        .then(() => gcs.remove(images))
        .then(() => res.status(204).end())
        .catch(next);
};

export default { create, getAll, getPartial, get, update, updatePartial, remove };