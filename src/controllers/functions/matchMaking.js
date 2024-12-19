function formatDomain(inputString) {
    return inputString
        .toLowerCase()                      // Convertir en minuscule
        .replace(/[^a-z0-9]/g, "");         // Supprimer tous les caractères non alphanumériques
}

const calculateSectorAffinity = (user1, user2) => {
    // Secteur de l'utilisateur exécutant la requête
    const sector1 = formatDomain(user1.sector);
    // Secteur de l'utilisateur proposé
    const sector2 = formatDomain(user2.sector);

    // Logique pour attribuer des points
    if (sector1 === sector2 || sector1.includes(sector2) || sector2.includes(sector1)) {
        return 50; // Correspondance parfaite
    } 

    // Liste de secteurs proches définis manuellement ou importés
    const relatedSectors = {
        "technologie": ["intelligenceartificielle", "developpement", "cybersecurite", "cloudcomputing"],
        "marketing": ["publicite", "communicationdigitale", "reseauxsociaux", "growthhacking"],
        "ecommerce": ["dropshipping", "marketplace", "logistique", "venteenligne"],
        "education": ["formationenligne", "coaching", "tutorat", "elearning"],
        "sante": ["bienetre", "medecinealternative", "fitness", "nutrition"],
        "finance": ["comptabilite", "fintech", "investissement", "assurances"],
        "immobilier": ["construction", "designinterieur", "gestionlocative", "urbanisme"],
        "artisanat": ["designgraphique", "mode", "photographie", "bijouterie"],
        "energie": ["solaire", "recyclage", "environnement", "renouvelable"],
        "agriculture": ["agroecologie", "permaculture", "agritech", "culturebiologique"]
    };



    return (relatedSectors[sector1]?.filter((evt) => evt.includes(sector2) || sector2.includes(evt)).length  > 0)
            ? 30
            : (relatedSectors[sector2]?.filter((evt) => evt.includes(sector1) || sector1.includes(evt)).length > 0)
            ? 30
            : 0

};


const calculateSkillAfinity = (user1, user2) => {
    // Secteur de l'utilisateur exécutant la requête
    let skills1 = user1.skills;
    // Secteur de l'utilisateur proposé
    let skills2 = user2.skills;
    skills1 = skills1.map((evt) => formatDomain(evt))
    skills2 = skills2.map((evt) => formatDomain(evt))
    
    return skills1.filter((s1) => skills2.filter((s2) => s1.includes(s2) || s2.includes(s1)).length > 0).length * 10;
}

const calculateCommonFriendAfinity = (user1, user2) => {
    const pair1 = user1.pairs;
    const pair2 = user2.pairs;
    return pair1.filter((p1) => pair2.includes(p1)).length * 5;
    
}

function calculateDaysBetween(date1, date2) {
    // YYYY-MM-DD
    // Convertir les dates en objets Date
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Calculer la différence en millisecondes
    const diffInMilliseconds = Math.abs(d2 - d1);
    // Convertir les millisecondes en jours
    const daysDifference = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));

    return daysDifference;
}

const calculateRecentActivityAffinity = (user, post) => {
    // YYYY-MM-DD
    const days = calculateDaysBetween(post.date, Date.now());
    return (days<=7)
            ?5
            :days<=30
                ?3
                :0
}


function extractKeywords(bio, stopWords = []) {
    if (!bio || typeof bio !== 'string') {
        return [];
    }

    const defaultStopWords = [
        "et", "le", "la", "les", "un", "une", "des", "de", "du", "en",
        "à", "avec", "pour", "par", "est", "ce", "dans", "sur", "au", "aux",
        "que", "qui", "dont", "ou", "si", "se", "pas", "ne", "son", "sa",
        "ses", "leur", "leurs", "mon", "ma", "mes", "notre", "nos", "votre",
        "vos", "il", "elle", "ils", "elles", "nous", "vous"
    ];

    const mergedStopWords = new Set([...defaultStopWords, ...stopWords]);

    const normalizedBio = bio
        .toLowerCase()
        .replace(/[^a-zA-ZÀ-ÿ\s-]/g, "") // Supprime caractères spéciaux sauf lettres accentuées
        .replace(/\s+/g, " ");

    const words = normalizedBio.split(" ");
    const keywords = new Set(
        words.filter(word => !mergedStopWords.has(word) && word.length > 2)
    );

    return { keywords, wordCount: words.length };
}


function calculateKeywordMatch(bio1, bio2) {
    // Extraire les mots-clés et tailles des bios
    const { keywords: keywordsBio1, wordCount: wordCount1 } = extractKeywords(bio1 || " ");
    const { keywords: keywordsBio2, wordCount: wordCount2 } = extractKeywords(bio2 || " ");
    const commonKeywords = [...keywordsBio1].filter(keyword => keywordsBio2.has(keyword));
    const numCommonKeywords = commonKeywords.length;

    // Calcul de la taille moyenne des bios
    const averageBioSize = (wordCount1 + wordCount2) / 2;

    // Score brut basé sur le nombre de mots-clés communs
    let baseScore = 0;
    if (numCommonKeywords === 0) {
        baseScore = 0; // Aucun mot-clé commun
    } else if (numCommonKeywords <= 2) {
        baseScore = 3; // Peu de mots-clés communs
    } else if (numCommonKeywords <= 5) {
        baseScore = 5; // Quelques mots-clés communs
    } else if (numCommonKeywords <= 10) {
        baseScore = 8; // Plusieurs mots-clés communs
    } else {
        baseScore = 10; // Beaucoup de mots-clés communs
    }

    // Ajustement du score basé sur la densité de mots-clés
    const keywordDensity = numCommonKeywords / averageBioSize;
    const adjustedScore = Math.round(baseScore * keywordDensity * 10); // Échelle de 0 à 10

    return Math.min(adjustedScore, 10) * 3;
}


function calculateContactMatchAffinity(user1, user2, posts) {
    let nbre = 0;
    for (let i = 0; i<posts.length; i++) {
        if (new Set(posts[i].likes).has(user1.email) && new Set(posts[i].likes).has(user2.email))
        {
            nbre++;
        }
    }
    return nbre * 2;
}


module.exports = {
    calculateContactMatchAffinity,
    calculateKeywordMatch,      
    calculateDaysBetween,
    calculateRecentActivityAffinity,
    calculateCommonFriendAfinity,
    calculateSkillAfinity,
    calculateSectorAffinity,
}