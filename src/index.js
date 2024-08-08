import Express from 'express';

import auth from './routers/auth.js';
import { ErrorHandler } from './utilities/error.js';

import 'dotenv/config';
import './utilities/database.js';
import './utilities/passport.js';

const app = Express();

app.use('/auth', auth);

app.use(ErrorHandler);

const port = process.env.PORT || 9124;
app.listen(port, () =>
    console.log(`App running on port ${port}`)
);