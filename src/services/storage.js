import { Storage } from '@google-cloud/storage';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuid } from 'uuid';

import 'dotenv/config';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const keyFilename = path.resolve(dirname, '../../credentials.json');
const storage = new Storage({ keyFilename });
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);

const write = images => Promise.all(
    images.map(image => {
        const fileName = uuid();
        return bucket.file(fileName).save(image)
            .then(() => fileName);
    })
);

const read = names => Promise.all(
    names.map(name => bucket.file(name).getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000
    })
        .then(url => url[0]))
);

const remove = names => Promise.all(
    names.map(name => bucket.file(name).delete())
);

export default { write, read, remove };