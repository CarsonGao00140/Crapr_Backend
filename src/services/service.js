import model from '../models/crap.js'

const write = model.create.bind(model);

const read = model.findById.bind(model);

const readAll = model.find.bind(model);

const overwrite = (id, data) =>
    model.findOneAndReplace({_id: id}, data, {
        returnDocument: 'after',
        runValidators: true
    });

const modify = (id, data) =>
    model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });

const remove = id => model.findByIdAndDelete(id);

export default { write, read, readAll, overwrite, modify, remove };