const cors = require('cors');
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { execSync } = require("child_process");
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const router = express.Router();

router.post('/execute-scan', (req, res) => {
    const { command } = req.body;

    if (!command) {
        res.status(400).json({ success: false, message: 'La commande est manquante dans la requête.' });
        return;
    }

    // Utilisez child_process.exec pour exécuter la commande
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur lors de l'exécution de la commande : ${error.message}`);
            res.status(500).json({ success: false, message: 'Erreur lors de l\'exécution de la commande.' });
            return;
        }

        console.log(`Commande exécutée avec succès : ${stdout}`);

        // Vérifier le contenu du fichier channel.conf
        fs.readFile('/home/pi/Arbane/Project_IPTV/channel.conf', 'utf8', (err, data) => {
            if (err) {
                console.error(`Erreur lors de la lecture du fichier channel.conf : ${err.message}`);
                res.status(500).json({ success: false, message: 'Erreur lors de la lecture du fichier channel.conf.' });
                return;
            }

            if (data.trim().length === 0) {
                console.log('Le fichier channel.conf est vide.');
                res.status(500).json({ success: false, message: 'Le fichier channel.conf est vide.' });
            } else {
                console.log('Le fichier channel.conf contient des informations.');
                res.status(200).json({ success: true, message: 'Commande exécutée avec succès et le fichier channel.conf contient des informations.' });
            }
        });
    });
});

module.exports = router;
