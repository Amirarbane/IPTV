const express = require("express");
const path = require('path');
const router = express.Router();

router.use(express.static(path.join(__dirname, 'public')));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Définissez la route pour gérer le formulaire de connexion
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log('Username:', username);
    console.log('Password:', password);

    // Vérification des identifiants
    if (username === 'admin' && password === 'admin') {
        // Redirection si les identifiants sont corrects
        res.redirect('/acceuil');
    } else {
        // Afficher un message d'erreur ou prendre d'autres mesures
        res.send('Identifiant ou mot de passe incorrect');
    }
});

// Route par défaut en cas d'erreur 404 (Not Found)
router.get('*', (req, res) => {
    res.status(404).send('Page not found');
});

module.exports = router;
