import mongo from '../services/mongo.js';

export default data =>
    mongo.readUser(data.owner)
        .then(owner => ({ ...data, owner }))
            .then(data => data.buyer
                ? mongo.readUser(data.buyer)
                    .then(buyer => ({ ...data, buyer }))
                : data
            )