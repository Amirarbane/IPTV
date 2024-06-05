
// Fonction de vérification de connexion et de redirection
function checkLoggedInAndRedirect() {
    var isLoggedIn = localStorage.getItem('isLoggedIn');

    // Si l'utilisateur est déjà connecté, redirigez-le vers la page d'accueil
    if (isLoggedIn === 'true') {
        redirectToHomePage();
    }

    // Gérer la soumission du formulaire de connexion
    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Empêcher l'envoi du formulaire par défaut

            // Récupérer les valeurs des champs de saisie
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            // Vérifier les identifiants
            if (username === 'admin' && password === 'admin') {
                // Définir l'indicateur isLoggedIn sur true
                localStorage.setItem('isLoggedIn', 'true');
                // Redirection vers la page d'accueil
                redirectToHomePage();
            } else {
                // Afficher un message d'erreur en cas d'identifiants incorrects
                alert('Identifiant ou mot de passe incorrect ! Veuillez réessayer.');
            }
        });
    }
}

// Fonction pour rediriger vers la page d'accueil
function redirectToHomePage() {
    window.location.href = 'acceuil.html';
}

// Appeler la fonction de vérification au chargement de la page
window.onload = checkLoggedInAndRedirect;
