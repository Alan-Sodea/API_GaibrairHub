const express = require("express");
const router = express.Router();
const { sendPrivateMessage, getPrivateMessages, deleteAllMessages } = require("../controllers/messageController");

// Route pour envoyer un message
router.post("/", sendPrivateMessage);

// Route pour récupérer les messages
router.get("/", getPrivateMessages);

// Route pour supprimer tous les messages
router.delete("/", deleteAllMessages);

module.exports = router;
    