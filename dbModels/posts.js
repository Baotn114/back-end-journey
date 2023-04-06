const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const postSchema = Schema({
    title:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema);