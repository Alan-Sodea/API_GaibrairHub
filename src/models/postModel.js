const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
    {
        creator: {
            type: String,
            required: [true, "Un post doit avoir un créateur (email)."],
        },
        text: {
            type: String,
            required: [true, "Le texte du post est obligatoire."],
        },
        imageUrl: {
            type: String,
            required: false,
        },
        likes: {
            type: [String], // Tableau d'emails des utilisateurs
            default: [], // Vide par défaut
        },
        date: 
        {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true, // Ajoute createdAt et updatedAt
    }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
