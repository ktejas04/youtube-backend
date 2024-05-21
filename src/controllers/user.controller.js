import { asyncHandler } from "../utils/asyncHandler.js";

//a method for registering user
//we will get a response

const registerUser = asyncHandler(async (req, res) => {
        res.status(200).json({
            message: "hello postman"
        })
})

export {registerUser}