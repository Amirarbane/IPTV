const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Module pour la manipulation des fichiers
const path = require('path'); // Module pour manipuler les chemins de fichiers
const router = express.Router();


let channelCounter = 1;
const baseDirectory = '/home/pi/Arbane/Project_IPTV'; // Remplacez cela par votre chemin réel

router.post('/saveConfig', (req, res) => {
    const { channels, fec } = req.body;

    if (!channels || !Array.isArray(channels) || !fec) {
        return res.status(400).send('Données malformées');
    }
    //!Array.isArray(channels) : Cela vérifie si channels n'est pas un tableau. 
    //Si channels n'est pas un tableau, cela signifie qu'il n'a pas été initialisé correctement pour stocker des données.

    const channelsText = channels.map(channel => {
        const { ip, pid, name } = channel;
        return `${ip} ${fec} ${pid} #${name}`;
    }).join('\n');

    const configData = `${channelsText}`;

    // Utilisation du chemin manuel
    fs.writeFileSync(path.join(baseDirectory, 'chaine.conf'), configData);

    let channelCounter = 1; // Changez la déclaration ici

    const channelsJSON = channels.map(channel => {
        const { ip, name } = channel;
        const channelKey = `chaine ${channelCounter++}`;
        return `"${channelKey}": {
            "chaine": "${name}",
            "Multicast": "${ip}"
    }`;
    }).join(',\n');

    try {
        const jsonData = `{
            ${channelsJSON}
        }\n`;

        // Utilisation du chemin manuel
        fs.writeFileSync(path.join(baseDirectory, 'chaine.json'), jsonData);
    } catch (error) {
        console.error('Erreur lors de l\'écriture du fichier JSON :', error);
        res.status(500).send('Erreur lors de l\'enregistrement des informations.');
        return;
    }

    res.send('Informations enregistrées avec succès.');
});

module.exports = router;