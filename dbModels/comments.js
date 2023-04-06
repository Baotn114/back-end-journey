const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const commentSchema = Schema({
    comment: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    }
},{timestamps: true});

module.exports = mongoose.model('Comment', commentSchema);

