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
    verified:{
        type: Boolean
    },
    image: {
        type: String
    }
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema)

