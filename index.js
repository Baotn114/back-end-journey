// khởi tạo môi trường 
require('dotenv').config()

// khởi tạo express 
const express = require('express');

// khởi tạo body-parser
const bodyParser = require('body-parser');

// khởi tạo cors
const cors = require('cors')

// khởi tạo biến app qua express
const app = express();

app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

// set up mongodb mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        app.listen(process.env.PORT, ()=>{
            console.log("Server is listening to mongodb Atlas");
        })
    })
    .catch((error)=>{
        console.log(error);
    })


// API routes

const user = require('./routes/userRoute');
const post = require('./routes/postRoute');

/* user route to sign in, sign up, profile */
app.use('/api/user', user);

/* user route to create post */
app.use('/api/post', post);

