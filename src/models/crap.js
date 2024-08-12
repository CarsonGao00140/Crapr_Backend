import { Schema, model } from 'mongoose';
import user from './user.js';

const validateArrayLength = (array, length) =>
    array.length === length;

const pointSchema = new Schema({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: coordinates => validateArrayLength(coordinates, 2),
            message: "Coordinates array length must be 2."
        }
    }
}, { _id: false });

const suggestionSchema = new Schema({
    address: { type: String, minlength: 3, maxlength: 255, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }
}, { _id: false });    

const crapSchema = new Schema({
    title: { type: String, minlength: 3, maxlength: 255, required: true },
    description: { type: String, minlength: 3, maxlength: 255, required: true },
    location: { type: pointSchema, required: true},
    images: { type: [String], required: true, default: undefined},
    status: {
        type: String,
        enum: ['AVAILABLE', 'INTERESTED', 'SCHEDULED', 'AGREED', 'FLUSHED'],
        default: 'AVAILABLE'
    },
    owner: { type: Schema.Types.ObjectId, ref: user, required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User'},
    suggestion: { type: suggestionSchema }
}, {
    timestamps: true
});

crapSchema.index({ location: '2dsphere' });

export default model('craps', crapSchema);