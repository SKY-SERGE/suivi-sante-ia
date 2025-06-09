# Guide d'Installation et de Démarrage - Suivi Santé IA

## 🎯 Bienvenue

**Suivi Santé IA** est votre plateforme personnelle de suivi de santé alimentaire utilisant l'intelligence artificielle. Cette application vous aide à :

- 📱 **Analyser vos repas** avec l'IA par simple photo
- 🎯 **Définir et suivre vos objectifs** santé personnalisés
- 💬 **Dialoguer avec un chatbot** santé intelligent
- 📊 **Visualiser vos progrès** avec des graphiques détaillés
- 👨‍⚕️ **Communiquer avec votre médecin** (optionnel)

## 🚀 Accès à l'application

### Option 1 : Accès en ligne (Recommandé)

L'application est accessible directement dans votre navigateur :

1. **Rendez-vous sur** : `https://suivi-sante-ia.app` _(URL à adapter selon le déploiement)_
2. **Navigateurs compatibles** :
   - ✅ Chrome (recommandé)
   - ✅ Firefox
   - ✅ Safari
   - ✅ Edge
3. **Aucune installation requise** !

### Option 2 : Installation locale (Développeurs)

Si vous souhaitez installer l'application localement :

#### Prérequis

- **Docker Desktop** installé
- **Git** installé
- **Port 3000** disponible

#### Installation rapide

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/suivi-sante-ia.git
cd suivi-sante-ia

# 2. Lancer avec Docker
docker-compose up -d

# 3. Accéder à l'application
# Ouvrir http://localhost:3000 dans votre navigateur
```

#### Configuration locale complète

```bash
# 1. Cloner et entrer dans le projet
git clone https://github.com/votre-repo/suivi-sante-ia.git
cd suivi-sante-ia

# 2. Configuration environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# 3. Installation des dépendances
cd nuxt-app
npm install

# 4. Lancer la base de données
docker-compose -f docker-compose.dev.yml up -d db

# 5. Lancer l'application
npm run dev

# Application disponible sur http://localhost:3000
```

## 📱 Premiers pas

### 1. Créer votre compte

1. **Cliquez sur "S'inscrire"** sur la page d'accueil
2. **Choisissez votre type de compte** :

   - 👤 **Patient** : Pour le suivi personnel de santé
   - 👨‍⚕️ **Médecin** : Pour suivre vos patients (nécessite validation)
   - ⚙️ **Administrateur** : Gestion de la plateforme (accès restreint)

3. **Remplissez le formulaire** :

   ```
   Email        : votre-email@exemple.com
   Mot de passe : (min. 8 caractères, 1 majuscule, 1 chiffre)
   Prénom       : Votre prénom
   Nom          : Votre nom
   Date naiss.  : JJ/MM/AAAA
   ```

4. **Vérifiez votre email** et cliquez sur le lien de confirmation

### 2. Première connexion

1. **Cliquez sur "Se connecter"**
2. **Saisissez vos identifiants**
3. **Vous arrivez sur votre tableau de bord** personnalisé selon votre rôle

### 3. Configuration initiale du profil

Pour des recommandations personnalisées :

1. **Accédez à votre profil** (clic sur votre nom en haut à droite)
2. **Complétez vos informations** :
   - **Données physiques** : Poids, taille (pour calcul IMC)
   - **Objectifs santé** : Perte de poids, maintien, prise de masse...
   - **Restrictions alimentaires** : Allergies, intolérances
   - **Préférences** : Végétarien, végan, sans gluten, etc.
3. **Sauvegardez** vos modifications

## 🛠️ Configuration requise

### Navigateur web

- **Versions récentes** (moins de 2 ans)
- **JavaScript activé**
- **Cookies autorisés** pour la session
- **Connexion internet** stable

### Appareil mobile (optionnel)

- **Caméra** pour les photos de repas
- **Autorisations** d'accès à la caméra/galerie
- **iOS 12+** ou **Android 8+**

### Connexion internet

- **Minimum** : 1 Mbps pour usage normal
- **Recommandé** : 5 Mbps pour l'analyse photo en temps réel

## 🔐 Sécurité et confidentialité

### Protection des données

- 🔒 **Chiffrement** de bout en bout
- 🛡️ **RGPD compliant**
- 🔑 **Authentification sécurisée**
- 🚫 **Aucune vente de données**

### Vos droits

- ✅ **Accès** à toutes vos données
- ✅ **Modification** de vos informations
- ✅ **Suppression** de votre compte
- ✅ **Export** de vos données
- ✅ **Contrôle** du partage médecin

## 🆘 Besoin d'aide ?

### Documentation complète

- 📖 **[Guide Patient](USER-GUIDE-PATIENT.md)** : Utilisation quotidienne
- 👨‍⚕️ **[Guide Médecin](USER-GUIDE-MEDECIN.md)** : Suivi des patients
- ⚙️ **[Guide Admin](USER-GUIDE-ADMIN.md)** : Gestion de la plateforme
- 🔧 **[Dépannage](TROUBLESHOOTING-GUIDE.md)** : Résolution de problèmes

### Support technique

- 📧 **Email** : support@suivi-sante-ia.app
- 💬 **Chat en ligne** : Disponible dans l'application
- 📞 **Téléphone** : +33 1 XX XX XX XX (lu-ve 9h-18h)

### FAQ rapide

**Q: Mes données sont-elles sécurisées ?**
R: Oui, toutes les données sont chiffrées et stockées selon les standards RGPD.

**Q: L'application fonctionne-t-elle hors ligne ?**
R: Partiellement. Vous pouvez consulter vos données mais l'analyse IA nécessite une connexion.

**Q: Puis-je supprimer mon compte ?**
R: Oui, à tout moment depuis les paramètres de votre profil.

**Q: L'application est-elle gratuite ?**
R: Oui, toutes les fonctionnalités de base sont gratuites.

## 🎉 Félicitations !

Vous êtes maintenant prêt(e) à utiliser **Suivi Santé IA**. Commencez par :

1. 🍽️ **Enregistrer votre premier repas** avec une photo
2. 🎯 **Définir un objectif santé** simple
3. 💬 **Tester le chatbot** avec une question santé
4. 📊 **Explorer vos données** dans le tableau de bord

**Bon voyage vers une vie plus saine ! 🌟**

---

_Dernière mise à jour : Décembre 2024_
_Version de l'application : 1.0.0_
