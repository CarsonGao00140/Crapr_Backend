import mongoose from 'mongoose';

mongoose
    .connect(process.env.MONGO_URL)
    .then(() =>
        console.log('Connected to mongoose')
    )
    .catch(error =>
        console.error('Error connecting to mongoose', error)
    );