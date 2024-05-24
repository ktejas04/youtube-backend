import { Router } from "express";
import { changeCurrentPassword,
         getCurrentUser,
         getUserChannelProfile, 
         getUserWatchHistory, 
         loginUser, 
         logoutUser, 
         refreshAccessToken, 
         registerUser, 
         updateUserAvatar, 
         updateUserCoverImage, 
         updateUserDetails
         } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from './../middlewares/auth.middleware.js';

const router = Router();

// http://localhost:8000/users/register

router.route("/register").post(
    //use middleware
    //we need many files of various types, but cannot use .array as it will take multiple files but of same type
    upload.fields([
        {
            name: "avatar", //file name
            maxCount: 1     //max files allowed
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//Secured Routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken) //no need of verify JWT here
// on going to /register url, registerUser method is called
// router.route("/login").post(login)
//remember this is post not get

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateUserDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getUserWatchHistory)

export default router