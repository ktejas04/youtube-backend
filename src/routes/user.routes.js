import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// http://localhost:8000/users/register

router.route("/register").post(registerUser)

// on going to /register url, registerUser method is called
// router.route("/login").post(login)
//remember this is post not get


export default router