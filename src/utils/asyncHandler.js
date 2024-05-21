//this is a wrapper for any problem that may arise.
//now we will not have to write promises and try-catch everywhere

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch(err => next(err));
    }
};

//the higher order function accepts a function as input and also returns a function. so we had to return the promise function



export {asyncHandler}



//Higher order function, cannot execute it in middle as it is callback
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        req.status(error.code || 500).json({
            success: false,
            message: error.message
            // error: process.env.NODE_ENV === 'production'? 'Server Error' : error.stack,
        })
    }
};
*/