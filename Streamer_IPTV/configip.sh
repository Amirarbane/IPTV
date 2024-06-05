#!/bin/bash

# Fonction pour configurer l'adresse IP dans dhcpcd.conf
set_network_config() {
    local ip_address="$1"
    local netmask="$2"

    # Créer la nouvelle ligne de configuration avec l'adresse IP et le masque de sous-réseau
    local new_line="static ip_address=${ip_address}/${netmask}"

    # Sauvegarder le fichier dhcpcd.conf
    sudo cp /etc/dhcpcd.conf /etc/dhcpcd.conf.bak

    # Utiliser sed pour remplacer la ligne d'adresse IP dans dhcpcd.conf
    sudo sed -i "/^static ip_address=/c\\$new_line" /etc/dhcpcd.conf

    # Redémarrer le service dhcpcd pour appliquer les changements
    sudo systemctl restart dhcpcd

    # Rafraîchir le port wlan0
    sudo ip addr flush dev wlan0
    sudo ip addr add "${ip_address}/${netmask}" dev wlan0
}

# Fonction pour afficher les informations entrées
display_info() {
    local ip_address="$1"
    local netmask="$2"

    dialog --msgbox "Adresse IP : $ip_address\nMasque de sous-réseau : $netmask" 10 40
}

# Demander à l'utilisateur s'il souhaite modifier l'adresse IP
dialog --yesno "Voulez-vous modifier l'adresse IP ?" 10 40
response=$?

# Si la réponse est "Oui" (code 0), demander à l'utilisateur d'entrer l'adresse IP
if [ $response -eq 0 ]; then
    # Demander à l'utilisateur d'entrer l'adresse IP
    ip_address=$(dialog --inputbox "Entrez la nouvelle adresse IP pour wlan0 :" 10 40 --output-fd 1)

    # Demander à l'utilisateur d'entrer le masque de sous-réseau
    netmask=$(dialog --inputbox "Entrez le nouveau masque de sous-réseau (ex: 24 pour 255.255.255.0) :" 10 40 --output-fd 1)

    # Afficher les informations entrées sur une page
    display_info "$ip_address" "$netmask"

    # Appel de la fonction pour définir la nouvelle configuration réseau
    set_network_config "$ip_address" "$netmask"
fi

# Effacer l'écran
clear
