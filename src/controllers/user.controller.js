import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from 'jsonwebtoken';
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // add the generated refreshToken to th object's key
        user.refreshToken = refreshToken
        //save the object(user) but here no need for other validations(passwords, etc)
        await user.save({validateBeforeSave: false})

        //return the tokens
        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens. \n", error)
    }

    
}

//a method for registering user
//we will get a response

const registerUser = asyncHandler(async (req, res) => {
        
    //get user details from frontend
    //validation of data
    //check if user is already registered: username, email
    //upload images(multer), check for avatar
    //upload them to cloudinary
    //create user object - create entry in DB
    //remove password and refresh token field from response
    //check for user creation
    //return res(response)


    //USER DETAILS
    //Form data/json data can be got using body but not that of url data
    
    // console.log(req.body);
    const {fullname, email, username, password} = req.body
    // console.log("Email: " , email);

    // if (fullname === "") {
    //     throw new ApiError(400, "fullname is required")
    // }

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
        // Study some and this line of code
    ){
        throw new ApiError(400, "All fields are required")
    }

    //You can keep a diff file for calling diff validation methods

    //Checking for duplicate user
    
    const userIsExisting = await User.findOne({
        $or: [  //study
            {email},
            {username}
    ]})
    
    if (userIsExisting) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // at index 0, there is an object(may/may not be), which has a path provided by multer when it uploaded the file on its own server
    //localPath because it is now on our server and not yet on cloudinary
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //checking for existence of coverImage
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    

    //uploading files on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //Registering user in Database and storing reference

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //corner-case
        email,
        username: username.toLowerCase(),
        password
    })

    //checking for empty user
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
        //-ve sign to remove fields not required
    )

    if (!createdUser) {
        throw new ApiError(500, "SERVER ERROR! User not registered")
    }

    //study the following
    //Returning response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

    // res.status(200).json({
    //     message: "hello postman"
    // })
})

const loginUser = asyncHandler(async (req,res) => {

    //Todos
    // 1. Accept user details(data) from req.body
    // 2. Validate the details and find user
    // 3. If exists and data correct, login
    // 4. If not exists, either ask to register or say that pwd is wrong
    // 5. For first time, generate access as well as refresh tokens
    // 6. Send through cookies
    // 7. Return response  

    const {email, username, password} = req.body


    //check if user entered email/username
    if (!username && !email ) {//!(username \\ email)
        throw new ApiError(400, "Email or username is required")
    }

    //find user in database
    const user = await User.findOne({
        $or: [ //study $or,$nor,$and etc...
            {email},
            {username}
        ]
    })

    //throw  error if user not found
    if (!user) {
        throw new ApiError(404, "User not found, create account")
    }
    
    //check password
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    //throw error for wrong password
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //access and refresh tokens
    //create a method as this step maybe used multiple times
    //destructure and accept 
    // if (user) {
    //     return res.status(200).json(
    //         new ApiResponse(200, user, "User logged in successfully")
    //     )
    // }
    // try {
    //     const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    //     console.log(accessToken,"\n", refreshToken);
    //     let a = accessToken;
    // } catch (error) {
        //     console.log(error);
        // }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    // if (accessToken && refreshToken) {  
    // console.log(accessToken, refreshToken);
    // }
    // else
    // console.log("NULL");

    //Send to cookies of web browser

    //remove password, refreshToken from user
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //cookies can be modified by anyone on frontend, but on adding the 2 properties, they are modifiable only through the server.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken 
                //if user wants to save the tokens on local storage
                //not a good practice(depends)
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res) => {
    //clear cookie(can be managed only through server)
    // remove the tokens from cookies
    //reset the refreshToken
    //How to identify which user to log out. Use middleware
    //Create custom middleware


    // User.findById(req.params
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true //will return the new value in response else we will get the refreshToken value in response
            // runValidators: true,
            // useFindAndModify: false
        }
    )

    //Deleting cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )) //no data to be returned
})

//Creating endpoint api for frontend engineer to refresh the tokens if he has the correct refresh token
const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request") //wrong refresh token/not present
    }

    
   try { //just making sure app does not crash, optional try catch
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
         // process.env.REFRESH_TOKEN_SECRET,
         // async (error, payload) => {
         //     if (error) {
         //         throw new ApiError(401, "Unauthorized request") //wrong refresh token
         //     }}
 
         //Study the last parameter: async function
     )
 
     //Making query to mongodb to retrieve user info based on the id present in decoded refresh token
 
     const user = await User.findById(decodedToken?._id)
 
     if (!user) {
         throw new ApiError(401, "Invalid refresh token") //wrong refresh token
     }
 
     //Matching both refresh tokens
     if (user?.refreshToken !== incomingRefreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
     }
 
     const options = {
         httpOnly: true,
         secure: true
     }
 
     const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
 
     return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
         new ApiResponse(
             200,
             {accessToken, refreshToken},
             "Access token refreshed" 
         )
    )
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
   }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {currentPassword, newPassword} = req.body

    //can also add confirm password

    //extracting user
    const user = await User.findById(req.user?._id)

    //checking if old pwd is correct
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect")
    }

    //updating password and saving to db
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    //display success message
    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
    // const user = await User.findById(req.user?._id)
})

const updateUserDetails = asyncHandler( async(req, res) => {

    const {fullname, email} = req.body

    if (!username || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email     //email: email
            }
        },
        { new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    )

})

const updateUserAvatar = asyncHandler( async(req,res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Avatar upload failed")
    }

    const user = await User.findByIdAndUpdate(
        //we will use patch and not update everything, just the avatar
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )

})

const updateUserCoverImage = asyncHandler( async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Cover image upload failed")
    }

    const user = await User.findByIdAndUpdate(
        //we will use patch and not update everything, just the cover image
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

//Aggregation Pipelines
const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    //channel type is Arrray
    const channel = await User.aggregate([
        { //1st pipeline - matched user profile
            $match: {
                username: username?.toLowerCase()
            }
        },
        { //2nd pipeline - counted subscribers
            $lookup: {
                from: "subscriptions", //lowercase and add "s"
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        { //3rd pipeline - counted subscribed channels
            $lookup: {
                from: "subscriptions", //lowercase and add "s"
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        { //4th pipeline - added the two fields to user
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        { //5th pipeline - projected fields
            $project: {
                //selected fields are given back
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    //checking if execution was successful
    if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }

    // console.log(channel);

    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )
    // User.find({username}) - long process
})

//User Watch History
const getUserWatchHistory = asyncHandler( async(req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        } 
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
}