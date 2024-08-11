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

const write = data => Promise.all(
    (data.images || []).map(image => {
        const name = uuid();
        return bucket.file(name).save(image)
            .then(() => name);
    })
).then(names => {data.images = names; return data;});

const read = data => Promise.all(
    data.images.map(name => bucket.file(name).getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000
    }).then(url => url[0]))
).then(urls => {data.images = urls; return data;});

const remove = data => Promise.all(
    data.images.map(name => bucket.file(name).delete())
);

export default { write, read, remove };