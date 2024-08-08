import { MongooseError } from 'mongoose';

class NoValidTokenError extends Error {
    code = 401;
    message = "No valid jwt token provided.";
}

class UnauthenticatedError extends Error {
    code = 401;
    message = "You are not authenticated.";
} 

class UserNotFoundError extends Error {
    code = 404;
    message = "No user found for the provided token."
}

class DataNotFoundError extends Error {
    code = 404;
    message = "No data found for the provided ID."
}

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof MongooseError) err.code = 400;
    
    res.status(err.code || 405).json({
        error: {message: err.message}
    });
};

export {
    NoValidTokenError,
    UnauthenticatedError,
    UserNotFoundError,
    DataNotFoundError,
    ErrorHandler
};