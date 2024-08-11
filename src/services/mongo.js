import model from '../models/crap.js';

const check = _id => model.exists({ _id });

const write = model.create.bind(model);

const read = model.findById.bind(model);

const readAll = model.find.bind(model);

const overwrite = (_id, data) =>
    model.findOneAndReplace({ _id }, data, {
        returnDocument: 'after',
        runValidators: true
    });

const modify = (id, data) =>
    model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })

const remove = model.findByIdAndDelete.bind(model);

export default { check, write, read, readAll, overwrite, modify, remove };