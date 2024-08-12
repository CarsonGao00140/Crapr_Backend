import { ForbiddenError } from '../utilities/error.js';

export default ({ doc, user }, identity) => {
    if(!doc[identity].equals(user.id))
        throw new ForbiddenError(`You are not the ${identity} of this crap`);
};