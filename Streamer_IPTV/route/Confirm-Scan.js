const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); // Module pour manipuler les chemins de fichiers
const router = express.Router();



// Définition d'une route POST '/confirmScan' pour traiter les requêtes POST
router.post('/confirmScan', (req, res) => {
    // Récupération de la fréquence à scanner depuis le corps de la requête
    const frequencyToScan = req.body.frequency;

    // Lecture des données de scan depuis un fichier
    const scanData = fs.readFileSync('/home/pi/Arbane/Project_IPTV/channel.conf', 'utf8');

    // Séparation des données de scan en un tableau de chaînes de caractères
    const channels = scanData.split('\n');

    // Initialisation d'un tableau pour stocker les canaux trouvés
    const foundChannels = [];

    // Parcours de chaque chaîne de caractères représentant un canal
    channels.forEach(channel => {
        // Séparation des informations du canal par les deux-points
        const channelInfo = channel.split(':');
        const channelFrequency = channelInfo[1]; // Fréquence du canal
        const channelName = channelInfo[0]; // Nom du canal
        const channelPID = channelInfo[channelInfo.length - 1]; // PID du canal (la dernière valeur)

        // Vérification si la fréquence du canal correspond à la fréquence à scanner
        if (channelFrequency === frequencyToScan) {
            // Si correspondance, ajout du canal trouvé au tableau foundChannels
            foundChannels.push({
                frequency: channelFrequency,
                name: channelName,
                pid: channelPID,
            });
        }
    });

    // Vérification si des canaux ont été trouvés
    if (foundChannels.length > 0) {
        // Si des canaux sont trouvés, envoi d'une réponse avec les détails des canaux trouvés
        console.log('Fréquence trouvée:', foundChannels);
        // Envoyer une réponse texte brute au lieu de JSON
        res.send(foundChannels.map(channel => `${channel.name} (PID: ${channel.pid})`).join('\n'));
    } else {
        // Si aucun canal n'est trouvé, envoi d'un message indiquant qu'aucune fréquence n'a été trouvée
        console.log('Fréquence non trouvée.');
        res.send('Fréquence non trouvée.');
    }
});

// Fonction pour récupérer les fréquences à partir du fichier
function getFrequenciesFromFile(filePath) {
    // Lire le contenu du fichier
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Diviser le contenu du fichier en lignes
    const lines = fileContent.split('\n');
    
    // Tableau pour stocker les fréquences
    const frequencies = [];
    
    // Parcourir chaque ligne du fichier
    lines.forEach(line => {
        // Diviser la ligne en parties en utilisant ':' comme délimiteur
        const parts = line.split(':');
        // La deuxième partie correspond à la fréquence
        const frequency = parts[1];
        // Ajouter la fréquence au tableau des fréquences, si elle n'est pas vide
        if (frequency.trim() !== '') {
            frequencies.push(frequency.trim());
        }
    });
    
    // Retourner le tableau des fréquences
    return frequencies;
}






module.exports = router;
