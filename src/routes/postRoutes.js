const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, likePost, deletePost, deleteAllPosts } = require('../controllers/postController');

// Route pour créer un nouveau post
router.post('/', createPost);

// Route pour lire tous les posts
router.get('/', getAllPosts);

// Route pour liker un post
router.put('/like', likePost);

// Route pour supprimer un post
router.delete('/', deletePost);

// Route pour supprimer un post
router.delete('/all', deleteAllPosts);



module.exports = router;
