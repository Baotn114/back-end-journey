//Khai bao express
const express = require('express');

//Khai bao router
const router = express.Router();

//Khai bao controllers
const {createPost, getPosts, getDetails} = require('../controllers/post');

                /* API ROUTES*/
//Tao get posts route
router.get('/', getPosts);

//Tao get posts details
router.get('/details/:id', getDetails);

//Them vao middleware, neu co user thi moi cho phep ta.o
const {protect} = require('../middleware/authMiddleware');
router.use(protect);

//Tao post route
router.post('/', createPost);


//export router
module.exports = router;