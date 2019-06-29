const express = require('express');
const router = express.Router();

const postsController = require('../controllers/posts_controller');
const passport = require('passport');

// Create a route to create a new post
router.post('/create', passport.checkAuthentication, postsController.createPost);


module.exports = router;