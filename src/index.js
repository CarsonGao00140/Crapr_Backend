import Express from 'express';
import cors from 'cors';

import auth from './routers/auth.js';
import crap from './routers/crap.js';
import { ErrorHandler } from './utilities/error.js';

import 'dotenv/config';
import './utilities/database.js';
import './utilities/passport.js';

const strategy = { origin: process.env.WEB_URL, credentials: true };

const app = Express();

app.use(cors(strategy));

app.use('/auth', auth);
app.use('/api/crap', crap);

app.use(ErrorHandler);

const port = process.env.PORT || 9124;
app.listen(port, () =>
    console.log(`App running on port ${port}`)
);