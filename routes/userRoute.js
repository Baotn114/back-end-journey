//Khai bao express
const express = require('express');

//Khai bao router
const router = express.Router();

//Khai bao controllers
const {
    signup, 
    signin,
    comment,
    comments,
    userComment,
    deleteComment,
    updateComment,
    userPost,
    updatePost,
    deletePost,
    getProfile,
    updateAvatar,
    emailConfirm
} = require('../controllers/user');


//Sign up route
router.post('/signup', signup);

//Sign in route
router.post('/signin', signin)

// Get comments 
router.get('/comments/:id', comments)

//Route to verify email
router.get('/confirm-email', emailConfirm)

//Them vao middleware, neu co user thi moi cho phep ta.o comment, hoac la quan li comment trong profile
const {protect} = require('../middleware/authMiddleware');
router.use(protect);

//Comment route
router.post('/comment/:id', comment);

//In user profile, get all comments
router.get('/userComment/:id', userComment);

//In user profile, delete any comment
router.delete('/commentDelete/:id', deleteComment);

//In user profile, update any comment
router.put('/commentUpdate/:id', updateComment);

//In user profile, get all posts
router.get('/userPost/:id', userPost);

//In user profile, update any post
router.put('/postUpdate/:id', updatePost);

//In user profile, delete any post
router.delete('/postDelete/:id', deletePost);

//In user profile, get the information of user
router.get('/profile/:id', getProfile);

//In user profile, update the image of user
router.put('/profile/:id', updateAvatar);

//export router
module.exports = router;