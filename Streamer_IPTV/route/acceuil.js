const express = require("express");
const path = require('path');
const router = express.Router();

// Définissez la route pour la acceuil
router.get('/acceuil', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'acceuil.html'));
});

module.exports = router;
