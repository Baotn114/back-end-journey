// Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = Schema({
    name:{
        type: String,
        requried: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    image: {
        type: String
    },
    posts : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    comments : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema)

