const cors = require('cors');
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http'); 
const https = require('https');
const util = require('util');
const { spawn } = require('child_process');
const ps = require('ps-node');
const execAsync = util.promisify(require('child_process').exec);

const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

// Créer un serveur HTTPS
const httpsServer = https.createServer(credentials,app , (req, res) => {
    res.writeHead(200);
    res.end('Bonjour, serveur HTTPS !');
});

const socketIo = require('socket.io');
const io = socketIo(httpsServer);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const showFile = require("./route/showFile");
app.use('/', showFile);

app.use(express.static(path.join(__dirname, 'public')));

const acceuilRoute = require("./route/acceuil");
const loginRoute = require("./route/login");
const startCommandRoute = require('./route/startComand');
const saveConfigRoute = require('./route/saveConfig');
const stopStreamRoute = require('./route/stopStreams');
const scanChannel = require('./route/scan');
const confirmScan = require('./route/Confirm-Scan');

app.use('/', loginRoute);
app.use('/', acceuilRoute);
app.use('/', startCommandRoute);
app.use('/', saveConfigRoute);
app.use('/', stopStreamRoute);
app.use('/', scanChannel);
app.use('/', confirmScan);

//Écoute de la connexion du client Socket.IO
io.on('connection', (socket) => {
    console.log('Client connecté.');
    
    // Gérer l'événement 'streamStarted'
    socket.on('streamStarted', () => {
        console.log('Stream démarré.');
        // Charger les chaînes à partir du fichier JSON
        const channelsData = JSON.parse(fs.readFileSync('chaine.json', 'utf8'));
        // Envoyer les chaînes diffusées au client lorsque le flux est démarré
        io.emit('broadcastChannels', channelsData);
    });
    // Gérer l'événement 'streamStopped'
    socket.on('streamStopped', () => {
        console.log('Stream arrêté.');
        // Réinitialiser les chaînes diffusées lorsque le flux est arrêté
        io.emit('removeBroadcastChannels');
    });

    // Gestion de la déconnexion du client
    socket.on('disconnect', () => {
        console.log('Client déconnecté.');
    });
});

httpsServer.listen(3000, () => {
    console.log('Serveur démarré sur https://192.168.5.11:3000');
});

