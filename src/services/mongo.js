import model from '../models/crap.js';

const read = model.findById.bind(model);

const readAll = model.find.bind(model);

export default { read, readAll };