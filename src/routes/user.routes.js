import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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

//Secred Routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken) //no need of verify JWT here
// on going to /register url, registerUser method is called
// router.route("/login").post(login)
//remember this is post not get


export default router