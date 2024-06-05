
// Fonction pour afficher les chaînes
function displayChannels(channelsText) {
    const channelFieldsContainer = document.getElementById('channelFieldsContainer');
    channelFieldsContainer.innerHTML = '';

    const channels = channelsText.split('\n');

    channels.forEach((channel) => {
        //exécuter une opération sur chaque élément d'un tableau, 
        const channelInfo = channel.split(' (PID: ');//Cette ligne divise la chaîne channel en deux parties en utilisant
        const channelName = channelInfo[0];
        const channelPID = channelInfo[1].replace(')', '');

        const channelLabel = document.createElement('label');
        channelLabel.textContent = `${channelName} :`;
        channelLabel.dataset.pid = channelPID;
        // créez un attribut de données personnalisé sur l'élément <label> appelé data-pid qui contient la valeur de channelPID. 
        //Cela permet de stocker le PID en association avec cet élément <label>, ce qui peut être utile 

        const ipInput = document.createElement('input');
        ipInput.type = 'text';
        ipInput.placeholder = 'IP/PORT';

        const br = document.createElement('br');

        channelFieldsContainer.appendChild(channelLabel);
        channelFieldsContainer.appendChild(ipInput);
        channelFieldsContainer.appendChild(br);
        //Ces lignes ajoutent les éléments label, input et br au conteneur
        // channelFieldsContainer, afin qu'ils soient affichés dans le document HTML.
    });
}




function searchFrequency() {
    var frequencyValue = document.getElementById('frequency').value;
    var fecValue = document.getElementById('fec').value;

    // Ajoutez le champ FEC dans la chaîne channelsText
    var channelsText = `FEC: ${fecValue}\n`;

    // Construire le corps de la requête POST en utilisant un objet JavaScript
    var requestBody = {
        frequency: frequencyValue,
        fec: fecValue,
        channelsText: channelsText
    };

    fetch('/confirmScan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Utiliser la méthode URLSearchParams pour encoder le corps de la requête
        body: new URLSearchParams(requestBody)
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
        displayChannels(result);
        
        // Réafficher les boutons une fois que la réponse est reçue avec succès
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('stopButton').style.display = 'inline-block';
        document.querySelector('#configForm button[type="button"]:nth-of-type(2)').style.display = 'inline-block';
    })
    .catch(error => {
        console.error('Erreur lors de la requête:', error);
    });
}


function saveConfig() {
    const channelInputs = document.querySelectorAll('#channelFieldsContainer input[type="text"]');
    const fecInput = document.getElementById('fec'); // Ajout du champ FEC

    const fec = fecInput.value.trim();

    const channels = [];

    channelInputs.forEach(ipInput => {
        const channelName = ipInput.previousSibling.textContent.replace(' :', '');
        const channelPID = ipInput.previousSibling.dataset.pid;

        if (ipInput.value.trim() !== '') {
            const channelIP = ipInput.value;
            channels.push({ ip: channelIP, pid: channelPID, name: channelName });
            // Réinitialiser la valeur du champ
            ipInput.value = '';
        }
    });

    console.log('Channels:', channels);
    console.log('FEC:', fec);

    if (channels.length > 0) {
        fetch('/saveConfig', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channels, fec }),
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
            // Réinitialiser la valeur du champ FEC
            fecInput.value = '';
        })
        .catch(error => {
            console.error('Erreur lors de la requête:', error);
        });
    } else {
        console.error('Veuillez fournir au moins une adresse IP pour une chaîne.');
    }
}

// Afficher le modal
function showModal() {
    var modal = document.getElementById("streamModal");
    modal.style.display = "block";
}

// Masquer le modal lorsque l'utilisateur clique sur le bouton de fermeture
function closeModal() {
    var modal = document.getElementById("streamModal");
    modal.style.display = "none";
}

// Masquer le modal lorsque l'utilisateur clique en dehors du modal
window.onclick = function(event) {
    var modal = document.getElementById("streamModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var closeButton = document.querySelector(".modal .close");

// Ajouter un gestionnaire d'événement pour le clic sur le bouton de fermeture
closeButton.onclick = function() {
    closeModal(); // Fermer le modal
}


async function startStream() {
    try {
        // Validation des données d'entrée
        const frequencyInput = document.getElementById('frequency');
        const frequency = frequencyInput.value.trim();
        if (!frequency) {
            console.error('Veuillez saisir une fréquence.');
            return;
        }

        // Vérifier d'abord si le processus DVBLAST est en cours
        const dvblastStatusResponse = await fetch('/startCommand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const dvblastStatusData = await dvblastStatusResponse.json();

        if (dvblastStatusData.dvblastRunning) {
            showModal(); // Afficher le modal
            return;
        }

        // Si le processus DVBLAST n'est pas en cours, continuer avec le démarrage du flux
        const requestData = { frequency: frequency };
        const response = await fetch('/startCommand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            if (response.status === 400) {
                const responseData = await response.json();
                if (responseData.message === "Le processus DVBLAST est déjà en cours. Impossible de démarrer un autre stream.") {
                    showModal(); // Afficher le modal
                } else {
                    console.error('Erreur HTTP, statut :', response.status);
                }
            } else {
                throw new Error(`Erreur HTTP, statut : ${response.status}`);
            }
            return;
        }

        document.getElementById('channelList').style.visibility = 'visible';
        socket.emit('streamStarted');

        const responseData = await response.json();
        console.log(responseData);

    } catch (error) {
        console.error('Erreur lors de la requête au serveur pour lancer le stream :', error);
    }
}




async function stopStream() {
    try {
        const response = await fetch('/stopStream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 400) {
                const responseData = await response.json();
                if (responseData.message === "Aucun flux en cours.") {
                    showNoStreamModal(); // Afficher le modal
                } else {
                    console.error('Erreur HTTP, statut :', response.status);
                }
            } else {
                throw new Error(`Erreur HTTP, statut : ${response.status}`);
            }
            return;
        }

        const responseData = await response.json();
        console.log(responseData);

        if (responseData.success) {
            console.log('Stream arrêté avec succès !');
            // Cacher les chaînes lorsque le flux est arrêté
            document.getElementById('channelList').style.visibility = 'hidden';
            // Envoyer un événement via Socket.IO pour indiquer que le flux a été arrêté
            socket.emit('streamStopped');
        } else {
            console.log('Aucun flux en cours.');
            // Afficher le modal
            showNoStreamModal();
        }
    } catch (error) {
        console.error('Erreur lors de la requête au serveur pour arrêter le stream :', error);
        showNoStreamModal(); // Afficher le modal également en cas d'erreur
    }
}

// Fonction pour afficher le modal
function showNoStreamModal() {
    var modal = document.getElementById('noStreamModal');
    modal.style.display = 'block'; // Afficher le modal

    // Fermer le modal lorsqu'on clique sur la croix
    var closeButton = document.querySelector('#noStreamModal .close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    // Fermer le modal lorsqu'on clique en dehors du contenu
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Fermer le modal lorsque la touche 'Escape' est pressée
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
}


const socket = io();

// Écouter l'événement 'broadcastChannels' émis par Socket.IO
socket.on('broadcastChannels', (channels) => {
    // Appeler la fonction pour afficher les chaînes sur l'interface utilisateur
    afficherChaines(channels);
});

// Écouter l'événement 'streamStopped' émis par Socket.IO
socket.on('streamStopped', () => { 
    // Cacher les chaînes lorsque le flux est arrêté
    document.getElementById('channelList').style.visibility = 'hidden';
});


function sendScanRequest() {
    fetch('/Scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
    })
        .then(handleResponse)
        .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
    }

    return response.json()
        .then(data => {
            console.log(data.message);
            return data;
        });
}

function handleError(error) {
    console.error('Erreur lors de la requête:', error);
    // Gérez les erreurs ici
}

  
function deleteConfig() {
    fetch('/deleteConfig', { method: 'POST' })
        .then(handleResponse)
        .catch(handleError);
}

const body = document.querySelector('body');
const btn = document.querySelector('.btn');
const icon = document.querySelector('.btn__icon');

//to save the dark mode use the object "local storage".

//function that stores the value true if the dark mode is activated or false if it's not.
function store(value){
  localStorage.setItem('darkmode', value);
}

//function that indicates if the "darkmode" property exists. It loads the page as we had left it.
function load(){
  const darkmode = localStorage.getItem('darkmode');

  //if the dark mode was never activated
  if(!darkmode){
    store(false);
    icon.classList.add('fa-sun');
  } else if( darkmode == 'true'){ //if the dark mode is activated
    body.classList.add('darkmode');
    icon.classList.add('fa-moon');
  } else if(darkmode == 'false'){ //if the dark mode exists but is disabled
    icon.classList.add('fa-sun');
  }
}



function afficherChaines(channels) {
    const channelListContainer = document.getElementById('channelList');

    // Effacer le contenu précédent
    channelListContainer.innerHTML = '';

    // Vérifier si channels est un objet avant de le parcourir
    if (typeof channels === 'object' && Object.keys(channels).length > 0) {
        // Créer un élément de liste pour chaque chaîne
        Object.values(channels).forEach(channel => {
            const channelItem = document.createElement('div');
            channelItem.classList.add('channel-item');

            // Ajouter le nom et l'IP/port à l'élément de liste
            channelItem.innerHTML = `<p>Nom de la chaîne : ${channel.chaine}</p><p>IP : ${channel.Multicast}</p>`;

            // Ajouter l'élément de liste au conteneur
            channelListContainer.appendChild(channelItem);
        });
    } else {
        // Afficher un message indiquant que les chaînes ne sont pas disponibles
        const message = document.createElement('p');
        message.textContent = 'Aucune chaîne disponible.';
        channelListContainer.appendChild(message);
    }
}



// Fonction pour mettre à jour la liste des chaînes
function updateChannelList(channels) {
    const channelListContainer = document.getElementById('channelList');
    channelListContainer.innerHTML = ''; // Effacer le contenu précédent

    // Générer le contenu de la liste des chaînes avec les données mises à jour
    channels.forEach(channel => {
        const channelItem = document.createElement('div');
        channelItem.textContent = channel.name; // Utilisez les données appropriées de chaque chaîne
        channelListContainer.appendChild(channelItem);
    });
}

load();

btn.addEventListener('click', () => {

  body.classList.toggle('darkmode');
  icon.classList.add('animated');

  //save true or false
  store(body.classList.contains('darkmode'));

  if(body.classList.contains('darkmode')){
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }else{
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }

  setTimeout( () => {
    icon.classList.remove('animated');
  }, 500)
})


