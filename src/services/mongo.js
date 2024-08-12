import crap from '../models/crap.js';
import user from '../models/user.js';

const read = id => crap.findById(id)

const readAll = crap.find.bind(crap);

const readUser = id => user.findById(id).select('id name');

export default { read, readAll, readUser };