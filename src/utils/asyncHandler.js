const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch(err => next(err));
    }
};



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