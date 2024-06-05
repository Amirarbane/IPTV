#!/bin/bash

# Fonction pour afficher le dialogue et récupérer les valeurs de l'utilisateur
get_network_config() {
    exec 3>&1
    ip_address=$(dialog --inputbox "Entrez l'adresse IP pour wlan0 :" 8 40 2>&1 1>&3)
    netmask=$(dialog --inputbox "Entrez le masque de sous-réseau (ex: 24 pour 255.255.255.0) :" 8 40 2>&1 1>&3)
    exec 3>&-
}

# Définir la fonction pour configurer le réseau
set_network_config() {
    ip_address=$1
    netmask=$2

    # Créer la nouvelle ligne de configuration avec l'adresse IP et le masque de sous-réseau
    new_line="static ip_address=${ip_address}/${netmask}"

    # Sauvegarder le contenu actuel du fichier dhcpcd.conf avec sudo
    sudo cp /etc/dhcpcd.conf /etc/dhcpcd.conf.bak

    # Éditer le fichier dhcpcd.conf pour mettre à jour la configuration réseau avec sudo
    sudo sed -i "s/^static ip_address=.*/$new_line/" /etc/dhcpcd.conf

    # Redémarrer le service dhcpcd pour appliquer les changements avec sudo
    sudo systemctl restart dhcpcd

    # Supprimer toutes les adresses IP secondaires de l'interface wlan0 avec sudo
    sudo ip addr flush dev wlan0

    # Ajouter l'adresse IP principale à l'interface wlan0 avec sudo
    sudo ip addr add ${ip_address}/${netmask} dev wlan0
}

# Afficher le dialogue pour obtenir les valeurs de configuration réseau
get_network_config

# Appeler la fonction pour configurer le réseau avec les valeurs récupérées
set_network_config "$ip_address" "$netmask"

# Afficher un message de confirmation
dialog --msgbox "Configuration réseau mise à jour avec succès." 8 40

# Effacer l'écran du terminal
clear
