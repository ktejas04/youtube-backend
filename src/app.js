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

export { app }
//you can also export default