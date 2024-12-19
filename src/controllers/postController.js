const Post = require('../models/postModel');
const User = require('../models/userModel');

// @desc    Créer un nouveau post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { email, password, text, imageUrl } = req.body;
        
        // Vérifier que le texte est fourni
        if (!text) {return res.status(400).json({ message: "Le texte du post est obligatoire." });}
        if (!email) {return res.status(400).json({ message: "Le createur du post n'est pas spécifié." });}
        if (!password) {return res.status(400).json({ message: "Mot de passe requis." });}
        
        const user = await User.findOne({email})
        
        // Vérifier que l'utilisateur existe et son mot de passe
        if (!user) {return res.status(401).json({ message: "Utilisateur introuvable." });}
        else {
            if (!await user.matchPassword(password)){return res.status(401).json({ message: "Mot de passe incorrect." });}
            else
            {
                // Créer un nouveau post
                const post = await Post.create({
                    creator : email,
                    text,
                    imageUrl,
                });
                
                if (post) {
                    return res.status(201).json(post);
                } else {
                    return res.status(400).json({ message: "Impossible de créer le post. Veuillez réessayer." });
                }
            }
        }
        

    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur : " + error.message });
    }
};


// @desc    Créer un nouveau post
// @route   POST /api/posts
// @access  Private
const getAllPosts = async (req, res) => {
    try {
        
        const postsList = await Post.find();
        
        if (postsList) {
            return res.status(200).json({success:true, postsList});
        }

    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur : " + error.message });
    }

}


// @desc    Liker un post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const { email, password, postId } = req.body;

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
            }
        }

        // Trouver le post à liker
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post non trouvé." });
        }

        // Vérifier si l'email est déjà dans la liste des likes
        if (post.likes.includes(email)) {
            post.likes.remove(email);
            await post.save();
            return res.status(200).json({ message: "post un-liké.", post });
        }

        // Ajouter l'email à la liste des likes
        post.likes.push(email);
        await post.save();

        res.status(200).json({ message: "Post liké avec succès.", post });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur : " + error.message });
    }
};


// @desc    Supprimer un post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const { email, password, postId } = req.body;

        // Trouver le post à supprimer
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post non trouvé." });
        }

        // Vérifier que l'utilisateur est bien le créateur du post
        if (post.creator !== email) {
            return res.status(403).json({ message: "Vous ne pouvez pas supprimer ce post." });
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
                    // Supprimer le post
                    await post.deleteOne();
                    return res.status(200).json({message : "Post supprimé avec succès"})
                }
            }
        }

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur : " + error.message });
    }
};

const deleteAllPosts = async (req, res) => { 
    await Post.deleteMany();
    return res.status(200).json({ succes: true, message: "Posts supprimés avec succès." }); 
}




module.exports = {
    createPost,
    getAllPosts,
    likePost,
    deletePost,
    deleteAllPosts,
};
