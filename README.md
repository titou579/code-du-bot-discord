# 🤖 Code Bot Bienvenue Serveur

Bot Discord multifonction ultra-complet développé en JavaScript avec **Discord.js v14** et hébergé sur **Render**. Conçu spécialement pour le serveur communautaire *Les fans de Brawl Stars*.

---

## 🚀 Fonctionnalités intégrées

* **👋 Bienvenue Automatique** : Envoie un embed stylé avec l'avatar du joueur dès qu'il rejoint le serveur.
* **🔊 Salons Vocaux Temporaires** : Crée automatiquement un salon vocal privé et modérable lorsque quelqu'un rejoint le salon de création. Le salon s'autodétruit quand il devient vide.
* **🎫 Système de Tickets** : Permet aux membres d'ouvrir un salon de discussion privé avec le staff en un clic.
* **📜 Générateur de Règlement** : Commande admin `!regles` pour afficher proprement les règles du serveur.
* **🌵 Mini-Jeu "Survivant Duo"** : Un simulateur textuel interactif exclusif dans le salon `#jeu-surprise` pour tenter de faire un Top 1 avec le chef !

---

## 🛠️ Installation et Déploiement

1. Créez une application sur le **Discord Developer Portal**.
2. Activez impérativement les 3 **Privileged Gateway Intents** (*Presence*, *Server Members*, *Message Content*).
3. Liez ce dépôt GitHub à votre service sur **Render**.
4. Ajoutez votre token secret dans les variables d'environnement de Render sous le nom de **`DISCORD_TOKEN`**.
