import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

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

export {
    registerUser,
    loginUser,
    logoutUser
}