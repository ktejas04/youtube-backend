//Just verifies if user is there or not
//We will add new object in req -> req.user
//Reuasbility - checks if user is authenticated while liking, commenting etc.

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

//as it is middleware, we need next
export const verifyJWT = asyncHandler(async (req, _, next) => {
    //as res is not use, write _
    //two scenarios, either it could be our cookie injected through server, or a custom header that the user has used for mobile screens
    //Format of header - Authorization: Bearer <token>
    //Replace "Bearer " with "" to get token value
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        //Check if token is correct and decode info in it.
        //Study the last two functions of user model
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        //unwrapping the decoded token, _id used in generateAccessToken method and removing the two unwanted fields
        const user = await User.findById(decodedToken?._id).select("-password, -refresh-token")
    
        //if not loggedIn, display error as access token is invalid(the secret key)
        if (!user) {
            //Frontend Discussion
            throw new ApiError(401, "Invalid Access Token")
        }
    
        //Adding object to req.
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }

})

//Now we have the middleware and exported it. Now we will see how we use it