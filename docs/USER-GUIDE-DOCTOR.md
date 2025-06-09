# Guide Utilisateur - Interface Médecin

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Accès et Authentification](#accès-et-authentification)
3. [Tableau de Bord Principal](#tableau-de-bord-principal)
4. [Gestion des Patients](#gestion-des-patients)
5. [Consultation des Données Patient](#consultation-des-données-patient)
6. [Communication avec les Patients](#communication-avec-les-patients)
7. [Alertes et Notifications](#alertes-et-notifications)
8. [Paramètres du Profil Médecin](#paramètres-du-profil-médecin)
9. [FAQ et Dépannage](#faq-et-dépannage)

---

## Vue d'ensemble

L'interface médecin de la plateforme de suivi de santé par IA vous permet de :

- **Surveiller** les données de santé de vos patients ayant donné leur consentement
- **Communiquer** de manière sécurisée avec vos patients
- **Consulter** l'historique des données et analyses IA
- **Recevoir** des alertes sur l'état de santé de vos patients
- **Collaborer** dans le suivi personnalisé des objectifs de santé

### Objectifs Principaux

- Faciliter le suivi à distance des patients
- Améliorer la continuité des soins
- Optimiser la communication médecin-patient
- Exploiter les analyses IA pour un meilleur diagnostic

---

## Accès et Authentification

### Inscription en tant que Médecin

1. **Accédez** à la page d'inscription : `/auth/register`
2. **Sélectionnez** le type de compte "Médecin"
3. **Remplissez** le formulaire avec :
   - Nom et prénom
   - Adresse email professionnelle
   - Mot de passe sécurisé (min. 8 caractères)
   - Numéro d'ordre des médecins
   - Spécialité médicale
   - Établissement d'exercice
4. **Validez** votre inscription
5. **Attendez** la validation de votre compte par l'administrateur

> **⚠️ Important :** Votre compte nécessite une validation administrative avant activation.

### Connexion

1. **Accédez** à la page de connexion : `/auth/login`
2. **Saisissez** votre email et mot de passe
3. **Cliquez** sur "Se connecter"
4. **Activez** l'authentification à deux facteurs si configurée

### Mot de Passe Oublié

1. **Cliquez** sur "Mot de passe oublié ?" sur la page de connexion
2. **Saisissez** votre adresse email
3. **Consultez** votre boîte mail pour le lien de réinitialisation
4. **Suivez** les instructions dans l'email

---

## Tableau de Bord Principal

### Vue d'ensemble

Le tableau de bord vous offre une vue synthétique de :

- **Nombre total** de patients sous suivi
- **Patients actifs** récemment
- **Alertes** et notifications pendantes
- **Messages** non lus
- **Statistiques** d'activité

### Éléments du Tableau de Bord

#### Widgets Principaux

1. **Patients Récemment Actifs**

   - Liste des 5 derniers patients ayant saisi des données
   - Accès rapide à leurs profils
   - Indicateurs de statut (normal, attention, alerte)

2. **Alertes et Notifications**

   - Alertes automatiques basées sur les seuils définis
   - Notifications de nouveaux consentements
   - Messages urgents des patients

3. **Activité Récente**

   - Résumé des interactions patient-médecin
   - Nouvelles données saisies par les patients
   - Analyses IA récentes

4. **Statistiques Rapides**
   - Nombre de consultations virtuelles ce mois
   - Taux d'activité des patients
   - Évolution des objectifs de santé

### Navigation

- **Menu principal** : Accès aux différentes sections
- **Barre de recherche** : Recherche rapide de patients
- **Notifications** : Centre de notifications en temps réel
- **Profil** : Paramètres du compte médecin

---

## Gestion des Patients

### Liste des Patients

#### Accès à la Liste

- **Naviguez** vers "Mes Patients" dans le menu principal
- **Visualisez** tous vos patients ayant consenti au partage

#### Informations Affichées

- **Nom et âge** du patient
- **Statut de consentement** (actif, révoqué, en attente)
- **Dernière activité** (saisie de données)
- **Indicateurs de santé** (normal, attention, alerte)
- **Date de début** du suivi

#### Actions Disponibles

- **Consulter** le profil détaillé
- **Envoyer** un message
- **Voir** l'historique des données
- **Configurer** des alertes personnalisées

### Demandes de Consentement

#### Processus de Liaison Patient

1. **Le patient** fait une demande de liaison via son interface
2. **Vous recevez** une notification de demande
3. **Consultez** les informations du patient demandeur
4. **Acceptez ou refusez** la demande
5. **Le patient** est notifié de votre réponse

#### Gestion des Consentements

- **Visualisation** du statut de chaque consentement
- **Historique** des consentements (accordés, révoqués)
- **Documentation** automatique des changements
- **Respect** des réglementations RGPD

### Recherche et Filtres

#### Options de Recherche

- **Par nom** : Recherche textuelle dans les noms
- **Par état de santé** : Filtrage par statut d'alerte
- **Par activité** : Patients actifs/inactifs
- **Par période** : Suivi depuis une date donnée

#### Tri et Organisation

- **Tri alphabétique** par nom
- **Tri par date** de dernière activité
- **Tri par priorité** (alertes en premier)
- **Groupement** par statut de santé

---

## Consultation des Données Patient

### Profil Patient Détaillé

#### Informations Générales

- **Données personnelles** autorisées
- **Historique médical** partagé
- **Objectifs de santé** actuels
- **Médications** déclarées

#### Données de Santé Disponibles

1. **Données Physiologiques**

   - Poids, taille, IMC
   - Tension artérielle
   - Fréquence cardiaque
   - Température corporelle

2. **Données Comportementales**

   - Qualité du sommeil
   - Niveau d'activité physique
   - Humeur et bien-être
   - Stress ressenti

3. **Données Alimentaires**

   - Repas enregistrés
   - Analyses IA des habitudes alimentaires
   - Photos de repas avec analyses
   - Recommandations nutritionnelles générées

4. **Symptômes et Observations**
   - Symptômes déclarés
   - Niveau de douleur
   - Effets secondaires de traitements
   - Notes personnelles du patient

### Visualisations et Graphiques

#### Types de Graphiques Disponibles

- **Courbes d'évolution** : Tendances sur le temps
- **Histogrammes** : Distribution des valeurs
- **Graphiques en secteurs** : Répartition par catégories
- **Heatmaps** : Intensité par période

#### Périodes d'Analyse

- **Vue quotidienne** : Détail heure par heure
- **Vue hebdomadaire** : Moyennes par jour
- **Vue mensuelle** : Tendances générales
- **Vue personnalisée** : Période définie

### Analyses IA et Recommandations

#### Accès aux Analyses IA

- **Analyses automatiques** des patterns de santé
- **Recommandations** nutritionnelles générées
- **Détection d'anomalies** dans les données
- **Prédictions** de tendances

#### Interprétation des Résultats

- **Niveau de confiance** des analyses
- **Explication** des algorithmes utilisés
- **Limites** et disclaimers des recommandations
- **Sources** des données analysées

### Export et Partage

#### Options d'Export

- **PDF** : Rapport complet formaté
- **CSV** : Données brutes pour analyse
- **Images** : Graphiques et visualisations
- **Résumé** : Synthèse période donnée

#### Partage Sécurisé

- **Liens temporaires** sécurisés
- **Protection** par mot de passe
- **Traçabilité** des accès
- **Expiration** automatique

---

## Communication avec les Patients

### Messagerie Sécurisée

#### Interface de Messagerie

- **Liste des conversations** actives
- **Statut** des messages (lu, non lu, urgent)
- **Recherche** dans l'historique des messages
- **Organisation** par patient

#### Envoi de Messages

1. **Sélectionnez** le patient destinataire
2. **Rédigez** votre message
3. **Ajoutez** des pièces jointes si nécessaire
4. **Définissez** le niveau de priorité
5. **Envoyez** le message

#### Types de Messages

- **Messages généraux** : Communication standard
- **Messages urgents** : Priorité élevée avec notification
- **Rappels** : Rendez-vous, médicaments, objectifs
- **Recommandations** : Conseils personnalisés

### Gestion des Conversations

#### Organisation des Discussions

- **Tri chronologique** des messages
- **Marquage** des messages importants
- **Archivage** des conversations anciennes
- **Recherche** textuelle dans les messages

#### Réponses et Suivi

- **Réponses rapides** prédéfinies
- **Templates** de messages courants
- **Rappels** de suivi automatiques
- **Intégration** avec le calendrier

### Notifications

#### Types de Notifications

- **Nouveaux messages** des patients
- **Alertes de santé** automatiques
- **Demandes de consentement** en attente
- **Rappels** de suivi patient

#### Configuration des Notifications

- **Email** : Notifications par email
- **Push** : Notifications dans l'application
- **Fréquence** : Immédiate ou résumé quotidien
- **Filtres** : Par type de patient ou d'alerte

---

## Alertes et Notifications

### Système d'Alertes Automatiques

#### Configuration des Seuils

- **Définition** de valeurs limites par patient
- **Paramétrage** personnalisé selon le profil
- **Activation/désactivation** par type de donnée
- **Ajustement** des sensibilités d'alerte

#### Types d'Alertes

1. **Alertes Physiologiques**

   - Tension artérielle anormale
   - Poids en variation importante
   - Fréquence cardiaque irrégulière

2. **Alertes Comportementales**

   - Absence prolongée de données
   - Dégradation de la qualité du sommeil
   - Signaux de détresse psychologique

3. **Alertes Médicamenteuses**
   - Oublis répétés de prises
   - Effets secondaires rapportés
   - Interactions potentielles

### Gestion des Alertes

#### Réception et Traitement

1. **Réception** de l'alerte (email/push)
2. **Consultation** des détails dans l'interface
3. **Analyse** du contexte patient
4. **Action** : Contact patient ou ajustement suivi
5. **Marquage** comme traitée

#### Historique des Alertes

- **Journal** complet des alertes générées
- **Statut** de traitement (en cours, traitée, fermée)
- **Actions** prises pour chaque alerte
- **Efficacité** des seuils configurés

---

## Paramètres du Profil Médecin

### Informations Professionnelles

#### Données du Profil

- **Informations personnelles** : Nom, prénom, photo
- **Qualifications** : Diplômes, spécialisations
- **Coordonnées** : Email, téléphone, adresse cabinet
- **Numéro d'ordre** et certifications

#### Mise à Jour du Profil

1. **Accédez** aux paramètres via le menu profil
2. **Modifiez** les informations nécessaires
3. **Téléchargez** les documents justificatifs si requis
4. **Sauvegardez** les modifications
5. **Attendez** la validation si nécessaire

### Préférences d'Interface

#### Personnalisation

- **Thème** : Clair, sombre, automatique
- **Langue** : Français, autres langues disponibles
- **Fuseau horaire** : Configuration automatique
- **Unités** : Métrique, impérial

#### Tableau de Bord

- **Widgets** : Choix des éléments affichés
- **Disposition** : Organisation personnalisée
- **Périodes** : Intervalles par défaut
- **Alertes** : Types affichés en priorité

### Sécurité et Confidentialité

#### Paramètres de Sécurité

- **Mot de passe** : Modification et politique
- **Double authentification** : Configuration 2FA
- **Sessions** : Gestion des connexions actives
- **Logs** : Historique des accès

#### Confidentialité

- **Consentements** : Gestion des autorisations patients
- **Partage de données** : Contrôles de confidentialité
- **Anonymisation** : Options d'analyse anonyme
- **Suppression** : Droit à l'oubli

---

## FAQ et Dépannage

### Questions Fréquentes

#### **Q : Comment ajouter un nouveau patient ?**

**R :** Les patients doivent faire une demande de liaison depuis leur interface. Vous recevrez une notification pour approuver la demande.

#### **Q : Que faire si un patient révoque son consentement ?**

**R :** L'accès à ses données est immédiatement supprimé. L'historique des interactions reste archivé pour des raisons légales mais n'est plus accessible.

#### **Q : Comment interpréter les analyses IA ?**

**R :** Les analyses IA sont des outils d'aide à la décision. Elles doivent toujours être combinées avec votre expertise clinique et ne remplacent pas l'examen médical.

#### **Q : Puis-je exporter les données d'un patient ?**

**R :** Oui, plusieurs formats d'export sont disponibles (PDF, CSV). Assurez-vous de respecter les règles de confidentialité.

#### **Q : Comment configurer des alertes personnalisées ?**

**R :** Dans le profil de chaque patient, section "Alertes", vous pouvez définir des seuils spécifiques selon ses besoins médicaux.

### Problèmes Techniques Courants

#### **Problème : Impossible de se connecter**

**Solutions :**

1. Vérifiez vos identifiants
2. Contrôlez votre connexion internet
3. Videz le cache du navigateur
4. Contactez l'administrateur si le compte n'est pas validé

#### **Problème : Données patient non visibles**

**Solutions :**

1. Vérifiez que le consentement est actif
2. Attendez la synchronisation (jusqu'à 5 minutes)
3. Actualisez la page
4. Contactez le support technique

#### **Problème : Notifications non reçues**

**Solutions :**

1. Vérifiez les paramètres de notification
2. Contrôlez les dossiers spam/indésirables
3. Mettez à jour votre adresse email
4. Testez avec un autre navigateur

### Contact et Support

#### **Support Technique**

- **Email** : support-medecin@plateforme-sante.fr
- **Téléphone** : +33 1 XX XX XX XX
- **Horaires** : Lundi-Vendredi 9h-18h
- **Urgences** : Service 24h/7j pour problèmes critiques

#### **Support Médical**

- **Documentation** : Guide d'interprétation des analyses IA
- **Formation** : Sessions de formation à l'utilisation
- **Communauté** : Forum des médecins utilisateurs
- **Feedback** : Suggestions d'amélioration

#### **Conformité et Légal**

- **RGPD** : Questions sur la protection des données
- **Responsabilité** : Utilisation des analyses IA
- **Audit** : Traçabilité des accès aux données
- **Certification** : Conformité HDS et autres

---

## Notes Importantes

### Responsabilités Médicales

- Les analyses IA sont des **outils d'aide** à la décision
- La **responsabilité médicale** reste entièrement du médecin
- Les **recommandations IA** doivent être validées cliniquement
- L'**examen physique** reste irremplaçable

### Confidentialité

- Toutes les données sont **chiffrées** en transit et au repos
- L'accès aux données patient est **tracé** et auditable
- Les **consentements** peuvent être révoqués à tout moment
- La plateforme est **conforme RGPD** et certifiée HDS

### Limitations Techniques

- Les analyses IA ont des **marges d'erreur**
- Certaines données peuvent avoir des **délais** de synchronisation
- La plateforme nécessite une **connexion internet** stable
- Certaines fonctionnalités peuvent être **temporairement indisponibles**

---

_Dernière mise à jour : {{date_actuelle}}_
_Version du guide : 1.0_
_Pour toute question : documentation@plateforme-sante.fr_
