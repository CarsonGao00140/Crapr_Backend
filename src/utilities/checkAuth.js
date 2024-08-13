import { ForbiddenError } from '../utilities/error.js';

export default ({ doc, user }, identities, output) => {
    const result = identities.some(identity => doc[identity]?.equals(user.id))
    if (output) return result;
    if (!result) {
        const list = identities.length > 1 
            ? `${identities.slice(0, -1).join(', ')} or ${identities.at(-1)}` 
            : identities[0];
        throw new ForbiddenError(`You are not the ${list} of this crap`);
    }
};