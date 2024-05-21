import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser}