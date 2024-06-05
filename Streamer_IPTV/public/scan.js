
// Fonction pour ouvrir le modal en cas de succès
function openModal() {
    var modal = document.getElementById("myModal");
    var modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = '<p>Scan terminé avec succès!</p><button class="ok-button">OK</button>';
    modal.style.display = "block";

    // Récupérer le bouton "OK" dans le modal
    var okButton = modal.querySelector('.ok-button');

    // Quand l'utilisateur clique sur le bouton "OK", ferme le modal
    okButton.onclick = function() {
        modal.style.display = "none";
    }
}
// Fonction pour fermer le modal
function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

// Fonction pour ouvrir le modal en cas d'erreur
function scanFailed() {
    var modal = document.getElementById("myModal");
    var modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = '<p>Échec du scan. Veuillez réessayer.</p><button class="ok-button">OK</button>';
    modal.style.display = "block";

    // Récupérer le nouveau bouton "OK" dans le modal
    var newOkButton = document.querySelector('.ok-button');

    // Quand l'utilisateur clique sur le bouton "OK", ferme le modal
    newOkButton.onclick = function() {
        closeModal(); // Appel de la fonction pour fermer le modal
    }
}


document.getElementById('scanButton').addEventListener('click', () => {
    // Récupérer la valeur de l'input
    const cityInput = document.getElementById('city');
    const city = cityInput.value;

    // Vérifier si la ville est renseignée
    if (!city) {
        alert('Veuillez entrer une ville avant de lancer le scan.');
        return;
    }

    // Afficher le message "Scan lancé"
    console.log('Scan lancé...');

    // Construire la commande avec la ville
    const command = `scan /usr/share/dvb/dvb-legacy/dvb-t/fr-${city} > /home/pi/Arbane/Project_IPTV/channel.conf`;

    // Désactiver le bouton pendant le scan
    const scanButton = document.getElementById('scanButton');
    scanButton.disabled = true;

    // Réinitialiser le champ de saisie ville
    cityInput.value = '';

    // Réinitialiser la barre de progression et l'afficher
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    progressBar.classList.add('visible');

    let progressValue = 0;
    progress.style.width = '0%';
    progressText.innerText = '0%';

    const updateProgress = () => {
        if (progressValue < 95) { // Ne pas aller au-delà de 95% avant la réponse du serveur
            progressValue += 0.3; // Augmentation plus lente pour simuler un chargement plus lent
            progress.style.width = progressValue + '%';
            progressText.innerText = progressValue.toFixed(1) + '%'; // Arrondi à un chiffre après la virgule
        }
    };

    // Mettre à jour la barre de progression toutes les 100ms
    const interval = setInterval(updateProgress, 100);

    // Envoyer la commande au serveur
    fetch('/execute-scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP, statut : ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Réponse du serveur :', data);
        clearInterval(interval);
        progressValue = 100;
        progress.style.width = progressValue + '%';
        progressText.innerText = progressValue + '%';
        scanButton.disabled = false;
        openModal(); // Appel de la fonction pour ouvrir le modal en cas de succès
    })
    .catch(error => {
        console.error('Erreur lors de la requête :', error);
        clearInterval(interval);
        scanButton.disabled = false;
        scanFailed(); // Appel de la fonction pour ouvrir le modal en cas d'erreur
    });
});






// document.getElementById('scanButton').addEventListener('click', () => {
//     // Récupérer la valeur de l'input
//     const cityInput = document.getElementById('city');
//     const city = cityInput.value;

//     // Vérifier si la ville est renseignée
//     if (!city) {
//         alert('Veuillez entrer une ville avant de lancer le scan.');
//         return;
//     }

//     // Afficher le message "Scan lancé"
//     console.log('Scan lancé...');

//     // Construire la commande avec la ville
//     const command = `scan /usr/share/dvb/dvb-legacy/dvb-t/fr-${city} > /home/pi/Arbane/Project_IPTV/channel.conf`;

//     // Désactiver le bouton pendant le scan
//     const scanButton = document.getElementById('scanButton');
//     scanButton.disabled = true;

//     // Réinitialiser le champ de saisie ville
//     cityInput.value = '';

//     // Réinitialiser la barre de progression et l'afficher
//     const progressBar = document.getElementById('progressBar');
//     const progress = document.getElementById('progress');
//     const progressText = document.getElementById('progressText');
//     progressBar.classList.add('visible');


    
//     let progressValue = 0;
//     progress.style.width = '0%';
//     progressText.innerText = '0%';

//     const updateProgress = () => {
//         if (progressValue < 95) { // Ne pas aller au-delà de 95% avant la réponse du serveur
//             progressValue += 0.2; // Augmentation plus lente pour simuler un chargement plus lent
//             progress.style.width = progressValue + '%';
//             progressText.innerText = progressValue.toFixed(1) + '%'; // Arrondi à un chiffre après la virgule
//         }
//     };

//     // Mettre à jour la barre de progression toutes les 100ms
//     const interval = setInterval(updateProgress, 100);

//     // Envoyer la commande au serveur
//     fetch('/execute-scan', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ command }),
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`Erreur HTTP, statut : ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log('Réponse du serveur :', data);
//         clearInterval(interval);
//         progressValue = 100;
//         progress.style.width = progressValue + '%';
//         progressText.innerText = progressValue + '%';
//         scanButton.disabled = false;
//     })
//     .catch(error => {
//         console.error('Erreur lors de la requête :', error);
//         clearInterval(interval);
//         scanButton.disabled = false;
//     });
// });

