const User = require("../models/userModel");
const PrivateMessage = require("../models/privateMessageModel");

// Envoyer un message privé
const sendPrivateMessage = async (req, res) => {
  try {
    const { email, password, receiver, message } = req.body;

    // Vérifier si tous les champs sont fournis
    if (!receiver || !message) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérification de l'envoyeur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateurs introuvable." });
    }
    
    if (!await user.matchPassword(password)) {
      return res.status(404).json({ message: "Mot de passe incorrect." });
    }

    // Vérifier si le destinataire existe
    const receiverExists = await User.findOne({ email: receiver });
    if (!receiverExists) {
      return res.status(404).json({ message: "Destinataire introuvable." });
    }

    // Créer le message
    const newMessage = await PrivateMessage.create({
      sender: email, // Email de l'utilisateur connecté
      receiver,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};

const getPrivateMessages = async (req, res) => {
    const {email, password, receiver} = req.query;
    if (!email) return res.status(400).send({ message : 'L\'utilisateur doit être spéifié' });
    if (!password) return res.status(400).send({ message : 'Le mot de passe doit être spéifié' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message : 'Utilisateur introuvable' });
    
    if (!await user.matchPassword(password)) {
        return res.status(404).send({ message : 'Mot de passe incorrect' });
    }
    
    try {
      // Récupérer les messages privés entre l'utilisateur connecté et le destinataire
      let messages;
      if (receiver)
      {
        messages = await PrivateMessage.find({ sender: email, receiver }).sort({ sentAt: -1 }); // Trier par date décroissante
      }
      else
      {
        messages = await PrivateMessage.find({ sender: email }).sort({ sentAt: -1 }); // Trier par date décroissante
      }
      
      let receivedMessages = await PrivateMessage.find({ receiver: email }).sort({ sentAt: -1 })
      receivedMessages = receivedMessages.filter((elt) => elt.sender!=email)

      messages = [
        ...messages,
        ...receivedMessages
      ]

      

      const discussions = {};

      messages.forEach(message => {
          const otherUser = message.sender === email ? message.receiver : message.sender;

          // Si une discussion avec cet utilisateur n'existe pas, on la crée
          if (!discussions[otherUser]) {
              discussions[otherUser] = [];
          }

          // Ajouter le message dans la discussion correspondante
          discussions[otherUser].push(message);
      });


      // Formater en liste pour répondre en JSON
      const formattedDiscussions = Object.entries(discussions).map(([interlocutor, messages]) => ({
          interlocutor,
          messages: messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)) // Tri par date croissante
      }));


      res.status(200).json(formattedDiscussions);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des messages." });
    }

    
};

// Supprimer tous les messages
const deleteAllMessages = async (req, res) => {
  await PrivateMessage.deleteMany();

  return res.json({
    success: true,
    message: 'Messages supprimés avec succès',
  });

};


module.exports = { sendPrivateMessage, getPrivateMessages, deleteAllMessages };
