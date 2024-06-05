const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const util = require('util');
const { spawn } = require('child_process');
const pumpify = require('pumpify');
const { PassThrough } = require('stream');
const execAsync = util.promisify(exec);
const ps = require('ps-node');
const axios = require('axios');

const io = require('../app.js');
const router = express.Router();

router.post('/startCommand', async (req, res) => {
    try {
        // Validation des données d'entrée
        const frequency = req.body.frequency;
        if (!frequency) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir une fréquence.' });
        }

        // Vérifier d'abord si le processus DVBLAST est en cours
        ps.lookup({ command: 'dvblast' }, async (err, resultList) => {
            if (err) {
                console.error(`Erreur lors de la recherche des processus dvblast : ${err}`);
                return res.status(500).json({ success: false, message: 'Erreur lors de la vérification du statut du processus dvblast.' });
            }

            const dvblastRunning = resultList.length > 0;

            if (dvblastRunning) {
                console.log("Le processus DVBLAST est déjà en cours. Impossible de démarrer un autre stream.");
                return res.status(400).json({ success: false, message: "Le processus DVBLAST est déjà en cours. Impossible de démarrer un autre stream." });
            }

            // Si le processus DVBLAST n'est pas en cours, continuer avec le démarrage du flux
            // Commande à exécuter
            const command = `dvblast -a 0 -f ${frequency} -c chaine.conf -m QAM_64 -b 8 -e`;

            console.log('Commande à exécuter :', command); // Débogage

            // Démarrer le processus sans attendre la fin
            const childProcess = spawn(command, { shell: true, stdio: ['ignore', 'ignore', 'ignore'] });

            // Attendre un court délai pour que le processus ait le temps de démarrer
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Envoyer la réponse au client
            res.status(200).json({ success: true, message: 'Diffusion en cours...', dvblastRunning: true });
        });
    } catch (err) {
        console.error('Erreur lors de l\'exécution de la commande :', err.message); // Débogage
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;