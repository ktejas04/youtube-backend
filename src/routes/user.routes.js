import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

// on going to /register url, registerUser method is called
// router.route("/login").post(login)
//remember this is post not get


export default router