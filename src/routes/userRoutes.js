const express = require('express');
const { createUser, loginUser, updateUserProfile, getAllUsers, getUser, deleteUser, deleteAllUsers, togglePairStatus, getSuggestions } = require('../controllers/userController');
const router = express.Router();

// Route pour créer un utilisateur
router.post('/', createUser);

// Route pour connecter un utilisateur
router.post('/login', loginUser);

// Route pour mettre à jour le profil utilisateur
router.put('/', updateUserProfile);

// Route pour récupérer tous les utilisateurs
router.get('/', getAllUsers);

// Route pour récupérer tous les utilisateurs
router.get('/user', getUser);

// Route pour supprimer un utilisateur
router.delete('/user', deleteUser);

// Route pour supprimer tous les utilisateurs
router.delete('/', deleteAllUsers);

// Route pour gérer l'enregistrement/désenregistrement des pairs
router.post('/pair', togglePairStatus);

// Route pour supprimer un post
router.get('/suggestions', getSuggestions);

module.exports = router;
