//Set up dotenv file
require('dotenv').config();

// khai bao model post
const Post = require('../dbModels/posts');

// Create Post
const createPost = async (req, res) => {
    const {title, userName, content, user, image} = req.body;
    if(!title || !content || !image){
        res.status(400).send({error: "please add all fields to continue!"});
    }else{
        await Post.create({
            title: title,
            userName: userName,
            content: content,
            user: user,
            image: image
       })
       res.status(200).send({message: "Post created successful"});
    }
}

// Get posts
const getPosts = async (req, res) =>{
    try {
        const posts = await Post.find({}).sort({createdAt: -1});
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).send({error: "Cannot get Posts"});
    }
}

// Get Details
const getDetails = async(req, res) =>{
    const numberId = req.params['id'];
    try {
        const details = await Post.findById({_id: numberId})
        res.status(200).json(details);
    } catch (error) {
        res.status(400).send({error: "Cannot get Details"})
    }
}

module.exports = {
    createPost, 
    getPosts, 
    getDetails
};