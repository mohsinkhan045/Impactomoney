// /*
// ---------------------------------------------------
// Project:        FundingProject
// Date:           Oct 26, 2024
// Author:         Faizan
// ---------------------------------------------------

// Description:
// Created a MongoDB connection
// ---------------------------------------------------
// */

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// // const { createDefaultAdmin } = require('../controllers/createDefaultAdmin'); // Adjust the import according to your folder structure

// dotenv.config();

// export async function connectDB() {
//     try {
//         const conn = await mongoose.connect(process.env.MONGODB_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log(`MongoDB connected: ${conn.connection.host}`);

//         // Uncomment the following line if you need to initialize a default admin user
//         // await createDefaultAdmin();
//     } catch (error) {
//         console.error('MongoDB connection error:', error.message); // Log the error message for clarity
//         process.exit(1); // Exit the process if the connection fails
//     }
// };

import mongoose from "mongoose";


const MongoUri=process.env.MONGODB_URI;
// console.log(MongoUri)
export const connectDB = async ()=>{
    if (!MongoUri) {
        throw new Error("MongoDB URI is not defined in the environment variables.");
      }
    if(mongoose.connection.readyState>=1) {
        console.log("DB already connected")
            return
        } ;
  
            try {
                await mongoose.connect(MongoUri)
                    console.log("Mongodb connected")
            } catch (error) {
                console.log("Error connecting te string" ,  error)
                throw error;
            }
        
    

}