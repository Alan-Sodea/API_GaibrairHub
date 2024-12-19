const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");


// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour JSON
app.use(express.json());
app.use(cors("*"));

//Connexion à la BD
connectDB();

// Route de test
app.get('/', (req, res) => {
    res.send('Bienvenue sur le serveur de l\'application de mentorat !');
});


//Routes de l'api
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use("/api/messages", messageRoutes);












// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
