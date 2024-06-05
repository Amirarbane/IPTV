const express = require("express");
const { exec } = require('child_process');
const { spawn } = require('child_process');
const io = require('../app.js');
const ps = require('ps-node');

const router = express.Router();

router.post('/stopStream', (req, res) => {
    try {
        console.log('Requête de stopStream reçue.');

        // Vérifier si le processus DVBLAST est en cours
        ps.lookup({ command: 'dvblast' }, (err, resultList) => {
            if (err) {
                console.error(`Erreur lors de la recherche des processus dvblast : ${err}`);
                return res.status(500).json({ success: false, message: 'Erreur lors de la vérification du processus dvblast.' });
            }

            if (resultList.length === 0) {
                console.log('Aucun flux en cours.');
                return res.status(200).json({ success: false, message: 'Aucun flux en cours.' });
            }

            // Commande pour tuer le processus dvblast
            const stopCommand = 'pkill dvblast';

            exec(stopCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur lors de l'arrêt du processus dvblast : ${error}`);
                    return res.status(500).json({ success: false, message: 'Erreur lors de l\'arrêt du processus dvblast.' });
                }
                console.log('Processus dvblast arrêté avec succès.');
                res.status(200).json({ success: true, message: 'Stream arrêté avec succès.' });
            });
        });
    } catch (err) {
        console.error(`Erreur d'arrêt du stream : ${err.message}`);
        res.status(500).json({ success: false, message: 'Erreur d\'arrêt du stream.' });
    }
});


// app.post('/stopStream', (req, res) => {
//     try {
//         console.log('Requête de stopStream reçue.');

//         // Commande pour tuer le processus dvblast
//         const stopCommand = 'pkill dvblast';

//         exec(stopCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Erreur lors de l'arrêt du processus dvblast : ${error}`);
//                 return res.status(500).json({ success: false, message: 'Erreur lors de l\'arrêt du processus dvblast.' });
//             }
//             // Envoyer l'événement pour supprimer les chaînes diffusées
//             io.emit('removeBroadcastChannels');
//             console.log('Processus dvblast arrêté avec succès.');
//             res.status(200).json({ success: true, message: 'Stream arrêté avec succès.' });
//         });
//     } catch (err) {
//         console.error(`Erreur d'arrêt du stream : ${err.message}`);
//         res.status(500).json({ success: false, message: 'Erreur d\'arrêt du stream.' });
//     }
// });



module.exports = router;