const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Module pour la manipulation des fichiers
const path = require('path'); // Module pour manipuler les chemins de fichiers
const router = express.Router();


const cheminAbsoluFichierJSON = path.resolve('/home/pi/Arbane/Project_IPTV/chaine.json');

// Endpoint pour accéder au fichier JSON
router.get('/api/data', (req, res) => {
    try {
        // Utilisez res.sendFile pour envoyer le fichier JSON
        res.sendFile(cheminAbsoluFichierJSON);
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
        res.status(404).send('Fichier non trouvé');
    }
});

module.exports = router;