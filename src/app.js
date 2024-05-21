import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true  
    // read docs
}))

//For JSON Data
app.use(express.json({
    limit: "16kb"
}))

//For URLS, like they use + or %20
app.use(express.urlencoded({
    extended: true, //not mandatory
    limit: "16kb"
}))

//For public assets
app.use(express.static("public"))

//For placing cookies securely in user's web browser
app.use(cookieParser())

//Import routes
import userRouter from "./routes/user.routes.js"

//Routes declaration

/* We were using app.get in backend 101, where routes and controllers were placed together. But now as we have kept routes and controllers in seperate files, we need to use middleware to use routes i.e. app.use */
app.use("/api/v1/users", userRouter)

// After/users is entered controller is passed to userRouter(user.routes.js)

// http://localhost:8000/users/register
// http://localhost:8000/users/login
// http://localhost:8000/api/v1/users/register

export { app }
//you can also export default