// require('dotenv').config({path: "./env"})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";
//not import app, it is {app}

dotenv.config({
    path: "./env"
})

connectDB()
.then(() => {

    app.on("error", (err) => {
        console.log("ERROR : ",err);
        throw err;
    });

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB Connection failed! ", err);
})










/*
import express from "express"
const app = express()

// function connectDB(){}; //const connectDB = () => {};

// connectDB()

//Professional approach: Use IFFYS

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (err) => {
            console.log("ERROR : ",err);
            throw err;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("ERROR ", error);
        throw error
    }
})()
*/