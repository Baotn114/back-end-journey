//Set up dotenv file
require('dotenv').config();

// khai bao model user
const User = require('../dbModels/user');

// khai bao model comment
const Comment = require('../dbModels/comments');

// khai bao model post
const Post = require('../dbModels/posts')

// khai bao bcrypt
const bcrypt = require('bcrypt');

// khai bao jwt
const jwt = require('jsonwebtoken');

// khai bao nodemailer
const nodemailer = require('nodemailer');


//Tao function de create JWT khi nguoi dung dang nhap
const generateToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}

//Tao function de create token khi nguoi dung verify email
const tokenCreate = (email)=> {
    return jwt.sign({email}, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}

// Tao transport
let transport = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASS
    },
    host: "smtp.gmail.com"
})


//Sign up
const signup = async (req, res) =>{
    //res.send("sign up");

    //Nhan data sign up tu nguoi dung
    const {name, email, password, repassword} = req.body;

    //Tim xem user co ton tai trong Db khong?
    const userExist = await User.findOne({email})

    //Kiem tra xem co day du thong tin chua
    if(!name || !email || !password || !repassword){
        res.status(400).send({error: 'Please add all fields to continue!'});
    }
    else if( !(password === repassword)){ //Kiem tra xem password va nhap lai password dung chua
        res.status(400).send({error: 'Your password are not matched!'})
    }
    else if(userExist && userExist.verified == false){
        //Neu khong co user trong Db thi ta tien hanh hashPassword
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        
        //Tao Token de verify trong email
        let token = tokenCreate(email);

        //Update user vao trong dB
        const user = await User.findOneAndUpdate(
            {email: email},
            {$set:{
                name: name,
                email: email,
                password: hashPassword,
                verified: false
            }},
            {new: true}
        )

        let Link = `https://journey-diary-api.onrender.com/api/user/confirm-email?token=${token}` 

        let emailVerification = {
            from: process.env.EMAIL,
            to: email,
            subject: "Email Verification",
            html: `<p>Thank you for signing up for our service. Please confirm your email address by clicking on the following link:</p><br><a href="${Link}">${Link}</a>`
        }

        transport.sendMail(emailVerification, function(err, info){
            if(err){
                res.status(400).send({error: 'Email Verification sent failed!'})   
            }else{
                res.status(200).send({success: 'Email Verification sent successfully!'})
            }
        })
    }
    else if(userExist){ //Kiem tra xem co Email trong Db chua
            res.status(400).send({error: 'Email is already in use!'})
    }
    else if(!userExist){
        //Neu khong co user trong Db thi ta tien hanh hashPassword
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        
        //Tao Token de verify trong email
        let token = tokenCreate(email);

        //Tao user vao trong dB
        const user = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            verified: false
        })

        let Link = `https://journey-diary-api.onrender.com/api/user/confirm-email?token=${token}` 

        let emailVerification = {
            from: process.env.EMAIL,
            to: email,
            subject: "Email Verification",
            html: `<p>Thank you for signing up for our service. Please confirm your email address by clicking on the following link:</p><br><a href="${Link}">${Link}</a>`
        }

        transport.sendMail(emailVerification, function(err, info){
            if(err){
                res.status(400).send({error: 'Email Verification sent failed!'})   
            }else{
                res.status(200).send({success: 'Email Verification sent successfully!'})
            }
        })
    }

    //Gui tra ve cho client
    // if(user){
    //     res.status(201).json({
    //         _id: user.id,
    //         name: user.name,
    //         email: user.email,
    //         token: generateToken(user._id)
    // })
    // }else{
    //     res.status(400).send({error: 'Invalid User'})
    // }
}

//Sign in
const signin = async (req, res)=>{
    //res.send('sign in');
    const {email, password} = req.body;

    //Kiem tra xem user da dc dang ky chua
    const user = await User.findOne({email});
    //
    if(!email || !password){
        res.status(400).send({error: "please fill all fields to continue!"});
    }else if(!user){
        res.status(400).send({error: "User is not registerd or Invalid user"})
    }else if(user){
        const passwords = await bcrypt.compare(password, user.password);
        const verifiedUser = await user.verified;
        if(verifiedUser){
            if(passwords){
                res.json({
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                })
            }else{
                res.status(400).send({error: "Password is not correct!"})
            }
        }else{
            res.status(400).send({error: "please verify your email!"})
        }
        
    }
    // if(user && (await bcrypt.compare(password, user.password))){
    //     res.json({
    //         _id: user.id,
    //         name: user.name,
    //         email: user.email,
    //         token: generateToken(user._id)
    //     })
    // }else{
    //     res.status(400).send({error: 'User is not registerd'});
    // }
}

// post Comment
const comment = async (req, res) => {
    const {comment, user, post} = req.body;
    //Moi bai blog co id cua rieng no, va moi blog co comments cua rieng no
    const numberId = req.params['id'];
    if(!comment){
        res.status(400).send({error: 'Please enter some words in the comment'})
    }else{
        await Comment.create({
            comment: comment,
            user: user,
            post: post
        })
        const response = await Comment.find({post: numberId}).select('comment').populate({
            path: 'user',
            select: 'name email image -_id'
        })
        const data = response.slice(-1)[0];
        //console.log(data);
        res.status(200).json(data);
    }
}

// get Comments
const comments = async (req, res) =>{
    //Moi bai blog co id cua rieng no, va moi blog co comments cua rieng no
    const numberId = req.params['id'];
    try {
        const userComments = await Comment.find({post: numberId}).select('comment').populate({
            path: 'user',
            select: 'name email image -_id'
        });
        res.status(200).json(userComments);
        //console.log(userComments);
    } catch (error) {
        res.status(400).send({error: "Cannot get comments"})
    }
}

//In user profile, get all comments
const userComment = async (req, res) =>{
    try {
        const userId = req.params['id'];
        const comments = await Comment.find({user: userId}).populate({
            path: 'user',
            select: 'image -_id'
        }).populate({
            path: 'post',
            select: 'title userName -_id'
        })
        //console.log(comments);
        res.status(200).json(comments);
    } catch (error) {
        res.status(400).send({error: "Cannot get comments in a user profile"})
    }
}

//In user profile, delete any comment

const deleteComment = async (req, res) =>{
    const commentId = req.params['id'];
    try {
        const commentDelete = await Comment.findByIdAndDelete({_id: commentId});
        res.status(200).json(commentDelete);
    } catch (error) {
        res.status(400).send({error: 'cannot delete comment'})
    }
    //console.log(commentId);
}

//In user profile, update any comment
const updateComment = async (req, res) =>{
    const commentId = req.params['id'];
    const { modify } = req.body;
    if (!modify){
        res.status(400).send({error: "Please write some words to modify!"})
    }else{
        const commentUpdate = await Comment.findByIdAndUpdate(
            {_id: commentId},
            {$set: {comment: modify}},
            {new: true}
        )
        res.status(200).json(commentUpdate);
    }
}

//In user profile, get all posts
const userPost = async (req, res) =>{
    try {
        const userId = req.params['id'];
        const posts = await Post.find({user: userId}).select('title').populate({
            path: 'user',
            select: 'image -_id'
        });
        //console.log(posts)
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).send({error: "Cannot get posts in a user profile"})
    }
}

//In user profile, delete any post
const deletePost = async (req, res) =>{
    const postId = req.params['id'];
    try {
        const response = await Post.findByIdAndDelete({_id: postId});
        await Comment.deleteMany({post: postId});
        // if(!response){
        //     console.log('empty')
        // }
        res.status(200).json(response);
    } catch (error) {
        res.status(400).send({error: "Cannot delete posts in a user profile"});
    }
}

//In user profile, update any post
const updatePost = async (req, res) =>{
    const postId = req.params['id'];
    const {title, content} = req.body;
    if(!title && !content){
        res.status(400).send({error: "Please write some words to modify!"})
    }
    else if(!title && content){
        const updatePost = await Post.findByIdAndUpdate(
            {_id: postId},
            {$set: {
                content: content
            }},
            {new: true}
        )
        res.status(200).json(updatePost);
    }
    else if(title && !content){
        const updatePost = await Post.findByIdAndUpdate(
            {_id: postId},
            {$set: {
                title: title
            }},
            {new: true}
        )
        res.status(200).json(updatePost);
    }
    else if(title && content){
        const updatePost = await Post.findByIdAndUpdate(
            {_id: postId},
            {$set: {
                title: title,
                content: content
            }},
            {new: true}
        )
        res.status(200).json(updatePost);
    }
}


//In user profile, get all the information
const getProfile = async (req, res) =>{
    const userId = req.params['id'];
    const findUser = await User.findById({_id: userId}).select('name email image -_id');
    //console.log(findUser);
    res.status(200).json(findUser);
}

//In user profile, update avatar
const updateAvatar = async (req, res) =>{
    const userId = req.params['id'];
    const {image} = req.body;
    if(!image){
        res.status(400).send({error: "Please choose your desired picture!!"})
    }else{
        const avatar = await User.findByIdAndUpdate(
            {_id: userId},
            {$set: {
                image: image
            }},
            {new: true}
        )
        res.status(200).json(avatar);
    }
}

// In gmail, verify the email
const emailConfirm = async (req, res) =>{
    const token = req.query.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        // const expired = new Date(decoded.exp * 1000);
        // console.log(expired);
        const userEmailSignUp = await User.findOne({email});
        if (userEmailSignUp){
            await User.findOneAndUpdate(
                {email: email},
                {$set : {
                    verified: true
                }},
                {new: true}
            )
            setTimeout(()=>{
                res.redirect('https://journey-diary.onrender.com/sign-in')        
            }, 2000)
        }
    } catch (error) {
        res.redirect('https://journey-diary.onrender.com/401'); // redirect to 401 page if the token is expired 
    }
}


module.exports = {signup, signin, comment, comments, userComment, deleteComment, updateComment, userPost, updatePost, deletePost, getProfile, updateAvatar, emailConfirm}
