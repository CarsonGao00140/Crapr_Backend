import crap from '../models/crap.js';
import user from '../models/user.js';

const read = crap.findById.bind(crap);

const readAll = crap.find.bind(crap);

const readUser = id => user.findById(id).select('id name');

export default { read, readAll, readUser };