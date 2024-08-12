import checkAuth from '../utilities/checkAuth.js';
import { BadRequestError, ForbiddenError } from '../utilities/error.js';

const stepStatus = ({ doc }, current, next) => {
    current ||= doc.status;
    if (doc.status !== current) throw new BadRequestError(`Crap is not in ${current} status.`);
    doc.status = next;
};

const interested = (req, res, next) => {
    if (req.doc.owner.equals(req.user.id)) { throw new BadRequestError("You can't be interested in your own crap."); }
    stepStatus(req, 'AVAILABLE', 'INTERESTED');
    req.doc.buyer = req.user.id;
    
    req.doc.save()
        .then()
        .then(data => res.json({ data }))
        .catch(next);
};

const suggest = (req, res, next) => {
    checkAuth(req, 'owner');
    const { suggestion, ...rest} = req.body;
    if (Object.keys(rest).length) throw new BadRequestError("No fields allowed except 'suggestion'.");
    stepStatus(req, 'INTERESTED', 'SCHEDULED');

    req.doc.set({ suggestion });
    req.doc.save()
        .then(data => res.json({ data }))
        .catch(next);
};

const agree = (req, res, next) => {
    checkAuth(req, 'buyer');
    stepStatus(req, 'SCHEDULED', 'AGREED');

    req.doc.save()
        .then(data => res.json({ data }))
        .catch(next);
};

const disagree = (req, res, next) => {
    checkAuth(req, 'buyer');
    stepStatus(req, 'SCHEDULED', 'INTERESTED');
    const { suggestion, ...rest} = req.doc._doc;

    req.doc.overwrite(rest);
    req.doc.save()
        .then(data => res.json({ data }))
        .catch(next);
};

const reset = (req, res, next) => {
    if(!(req.doc.buyer.equals(req.user.id) || req.doc.owner.equals(req.user.id)))
        throw new ForbiddenError("You are not the owner or buyer of this crap");
    if (req.doc.status === 'FLUSHED') throw new ForbiddenError("Crap is already flushed.");
    stepStatus(req, undefined, 'AVAILABLE');
    const { suggestion, buyer, ...rest} = req.doc._doc;

    req.doc.overwrite(rest);
    req.doc.save()
        .then(data => res.json({ data }))
        .catch(next);
};

const flush = (req, res, next) => {
    checkAuth(req, 'owner');
    stepStatus(req, 'AGREED', 'FLUSHED');

    req.doc.save()
        .then(data => res.json({ data }))
        .catch(next);
};

export default { interested, suggest, agree, disagree, reset, flush };