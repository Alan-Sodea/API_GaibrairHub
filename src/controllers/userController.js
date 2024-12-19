const User = require('../models/userModel');
const Post = require('../models/postModel');
const { calculateContactMatchAffinity, calculateKeywordMatch, calculateRecentActivityAffinity, calculateDaysBetween, calculateCommonFriendAfinity, calculateSkillAfinity, calculateSectorAffinity } = require("./functions/matchMaking")

// @desc    Créer un utilisateur
// @route   POST /api/users/
const createUser = async (req, res) => {
    try {
        const { fullName, email, password, profilePhoto, bio, sector, skills } = req.body;

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Créer un nouvel utilisateur
        const user = new User({
            fullName,
            email,
            password, // On gérera le hashage plus tard
            profilePhoto,
            bio,
            sector,
            skills,
        });

        // Sauvegarde dans la base de données
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error.message);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};



// @desc    Connecter un utilisateur
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePhoto: user.profilePhoto,
                bio: user.bio,
                sector: user.sector,
                skills: user.skills,
            });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error.message);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};


// @desc    Modifier les infos d'un utilisateur
// @route   PUT /api/users
const updateUserProfile = async (req, res) => {
    const user = await User.findOne({email : req.body.email});

    try {
        
        if (!user || user == null) {
            res.status(404);
            throw new Error('Utilisateur introuvable');
        }
        else
        {
            if (!await user.matchPassword(req.body.password)) {
                throw new Error('Utilisateur introuvable');
            }
        }
        
    
        // Mettre à jour uniquement les champs autorisés
        user.fullName = req.body.fullName || user.fullName;
        user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
        user.bio = req.body.bio || user.bio;
        user.sector = req.body.sector || user.sector;
        user.skills = req.body.skills || user.skills;
        
        // Sauvegarder les modifications
        const updatedUser = await user.save();
        
        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                profilePhoto: updatedUser.profilePhoto,
                bio: updatedUser.bio,
                sector: updatedUser.sector,
                skills: updatedUser.skills,
            },
        });

    } catch (err) {
        res.status(500).json({err : err.message});
    }
    
    
};


// @desc    Récupérer la liste de tous les utilisateurs
// @route   GET /api/users
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password'); // Exclut les mots de passe
    res.json({
        success: true,
        users,
    });
};


// @desc    Récupérer les infos d'un utilisateur
// @route   GET /api/users/user
const getUser = async (req, res) => {

    const { fullName } = req.query;

    const user = await User.findOne({ fullName }).select('-password');
    if (!user) {return res.status(404).json({ message: 'Utilisateur introuvable' });}
    
    res.json({
        success: true,
        user,
    });

};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/user/:email
const deleteUser = async (req, res) => {

    const user = await User.findOne({email : req.query.email});
    if (!user) {return res.status(404).json({ message: 'Utilisateur introuvable' });}

    await User.findOneAndDelete({email : req.query.email});

    res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès',
    });
};

// @desc    Supprimer tous les utilisateurs
// @route   DELETE /api/users
const deleteAllUsers = async (req, res) => {
    await User.deleteMany();

    res.json({
        success: true,
        message: 'Utilisateurs supprimés avec succès',
    });
};




const togglePairStatus = async (req, res) => {
    const { email, password, pairEmail } = req.body;

    if (!email || !password || !pairEmail) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    try {
        // Vérifier l'authenticité de l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        if (!await user.matchPassword(password)) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }

        // Vérifier si le pair existe
        const pair = await User.findOne({ email: pairEmail });
        if (!pair) {
            return res.status(404).json({ message: "Le pair spécifié n'existe pas." });
        }

        // Ajouter ou retirer le pair
        if (pair.pairs.includes(email)) {
            pair.pairs = pair.pairs.filter(myemail => myemail != email);
            await pair.save();
            return res.status(200).json({ message: `${email} retiré de la liste des pairs.`, add : -1 });
        } else {
            pair.pairs.push(email);
            await pair.save();
            return res.status(200).json({ message: `${email} ajouté à la liste des pairs.`,  add : +1 });
        }
    } catch (error) {
        return res.status(500).json({ message: "Une erreur est survenue lors de la mise à jour de la liste des pairs." });
    }
};


const getSuggestions = async (req, res) => {
    const { email, password } = req.query;
    
    // Vérifier que l'email est fourni
    if (!email) {
        return res.status(400).json({ message: "L'email de l'utilisateur est obligatoire." });
    }
    else
    {
        const user = await User.findOne({ email});
        
        // Vérifier que l'utilisateur existe et son mot de passe
        if (!user) {
            return res.status(401).json({ message: "Utilisateur introuvable." });
        }
        else {
            if (!await user.matchPassword(password)){return res.status(401).json({ message: "Mot de passe incorrect." });}
            else
            {
                // Récupérer tous les utilisateurs
                let users = await User.find();
                users = users.filter(user => user.email!=email)

                // Récupérer tous les posts
                let posts = await Post.find().sort({ sentAt: -1 });
                // posts = posts;
                let user2;
                let suggestions = [];
                let score = 0;
                for (let i = 0; i < users.length; i++)
                {
                    user2 = users[i];
                    score = calculateSectorAffinity(user, user2) + calculateSkillAfinity(user, user2) + calculateCommonFriendAfinity(user, user2) + calculateKeywordMatch(user.bio, user2.bio) + calculateContactMatchAffinity(user, user2, posts) ;                    
                    let post = posts.filter((elt) => elt.creator == user2.email)
                    if (post.length != 0) score += + calculateRecentActivityAffinity(user2, post[0]);
                    // suggestions.push({user : user2, score})
                    suggestions.push(user2)
                    
                }
                suggestions.sort((elt) => elt.score);
                return res.status(200).json(suggestions);

            }
        }
    }
}


module.exports = { createUser, loginUser, updateUserProfile, getAllUsers, getUser, deleteUser, deleteAllUsers, togglePairStatus, getSuggestions};
