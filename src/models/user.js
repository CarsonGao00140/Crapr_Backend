import { Schema, model } from 'mongoose';

const user = new Schema({
    name: { type: String, required: true },
    googleId: { type: String, required: true, unique: true }
}, {
    timestamps: true
});

export default model('users', user);