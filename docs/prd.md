<context>

# **Overview**

L'application de suivi de santé par IA vise à fournir une plateforme complète et personnalisée permettant aux **utilisateurs simples** de surveiller leur santé, aux **médecins** de suivre leurs patients (avec consentement), et aux **administrateurs** de gérer la plateforme. Ce projet de fin d'études en Master IA se concentrera sur la démonstration de la faisabilité technique d'une telle solution multi-rôles, en utilisant une stack moderne (Nuxt 3, Supabase), des pratiques de développement actuelles (conteneurisation avec Docker), et en intégrant des **fonctionnalités d'IA fondamentales pour le MVP (utilisant l'API Google pour la génération de texte simple), avec une vision pour des capacités avancées futures (utilisant OpenAI)**.

Le problème principal que cette application cherche à aborder est le manque d'outils intégrés permettant un suivi proactif et collaboratif de la santé, enrichi par une analyse intelligente et des interactions personnalisées. Elle s'adresse :

- À l'**utilisateur individuel** souhaitant mieux comprendre et gérer activement son bien-être grâce à des outils de suivi, des recommandations initiales (notamment alimentaires), la définition et le suivi d'objectifs, et un chatbot IA pour des questions de santé de base.
- Aux **médecins** cherchant un moyen efficace de suivre à distance les données de leurs patients consentants et de communiquer avec eux.
- Aux **administrateurs** nécessitant des outils pour la gestion de la plateforme.

La valeur réside dans la capacité à collecter, visualiser, interpréter des données de santé, offrir des recommandations initiales basées sur l'IA (y compris une analyse de repas par photo simplifiée), faciliter la communication médecin-patient, et gérer des objectifs personnalisés, le tout dans une architecture technique solide, moderne et sécurisée.

# **Core Features**

Pour le Produit Minimum Viable (MVP) étendu et simplifié :

1. **Gestion de Compte Utilisateur Sécurisée et Multi-Rôles**:
   - **Ce que ça fait**: Permet aux utilisateurs (patients, médecins, administrateurs) de créer un compte adapté à leur rôle, de se connecter et de se déconnecter de manière sécurisée. Gestion des profils pour chaque rôle.
   - **Pourquoi c'est important**: Base de l'application personnalisée, garantissant que les données et fonctionnalités sont accessibles selon les droits de chaque rôle.
   - **Comment ça marche (haut niveau)**: Supabase Auth avec gestion des rôles (ex: via custom claims ou table de rôles). Backend Nuxt 3 pour les flux d'inscription/connexion. Informations de profil stockées dans utilisateurs avec un champ role.
2. **Pour l'Utilisateur Simple (Patient)**:
   - **Saisie Manuelle de Données de Santé**: Humeur, sommeil, activité, symptômes, etc.
   - **Définition et Suivi d'Objectifs Personnalisés**: L'utilisateur peut définir des objectifs (ex: "boire 2L d'eau/jour", "marcher 10000 pas/jour") et l'application aide à les tracker.
   - **Visualisation de l'Historique des Données et Progrès des Objectifs**: Graphiques et listes chronologiques.
   - **Analyse IA Simplifiée des Habitudes Alimentaires et Recommandations Initiales**:
     - **Ce que ça fait**: L'utilisateur peut enregistrer ses repas (manuellement ou par photo). Une IA simplifiée analyse ces informations pour fournir des retours basiques sur les habitudes alimentaires et des recommandations générales (générées via **API Google** si textuelles et basées sur des règles simples).
     - **Pourquoi c'est important**: Aide l'utilisateur à prendre une première conscience de son alimentation et à faire des choix plus sains.
     - **Comment ça marche (haut niveau)**: Formulaire de saisie de repas. Pour l'analyse photo, une API d'IA (modèle de reconnaissance d'aliments basique, ex: Google Vision AI pour une identification de base) est utilisée. Les résultats alimentent un moteur de recommandation simple (ex: basé sur des règles, avec génération de texte de recommandation par **API Google**). Données stockées dans repas_enregistres et recommandations_ia.
   - **Analyse IA Simplifiée des Repas par Photo**:
     - **Ce que ça fait**: L'utilisateur prend une photo de son repas, l'IA (ex: **Google Vision AI**) tente d'identifier les principaux groupes d'aliments ou donne un feedback qualitatif très général. **Pas d'estimation nutritionnelle détaillée pour le MVP.**
     - **Pourquoi c'est important**: Simplifie la saisie des repas et offre un premier retour immédiat sans être trop complexe à implémenter.
     - **Comment ça marche (haut niveau)**: Interface de prise de photo. Appel à un service d'IA de reconnaissance d'images (ex: **Google Vision AI** pour une fonctionnalité de base). Stockage de la photo (Supabase Storage) et des résultats d'analyse simplifiés.
   - **Chatbot IA Santé Basique**:
     - **Ce que ça fait**: Un chatbot IA avec lequel l'utilisateur peut discuter pour poser des questions de santé très générales, obtenir des informations issues d'une base de connaissances prédéfinie (non-diagnostiques), avec des réponses générées par l'**API Google**. **Pas de compréhension de langage naturel complexe ni de RAG pour le MVP.**
     - **Pourquoi c'est important**: Fournit un support informationnel accessible et interactif de premier niveau.
     - **Comment ça marche (haut niveau)**: Interface de chat. Backend Nuxt 3 relayant les questions à l'**API Google** (ex: Gemini via des prompts très contraints pour des réponses factuelles simples, ou via appariement de mots-clés déclenchant une génération de texte simple). Historique des conversations stocké dans chat_messages.
   - **Communication avec le Médecin (si lié)**: Messagerie sécurisée pour échanger avec son médecin traitant.
3. **Pour le Médecin**:
   - **Tableau de Bord des Patients**: Visualisation de la liste des patients ayant consenti au partage de leurs données.
   - **Accès aux Données de Santé des Patients**: Consultation de l'historique des données, des objectifs et des analyses IA (simplifiées).
   - **Communication avec les Patients**: Messagerie sécurisée pour échanger avec ses patients.
   - **Alertes (optionnel MVP)**: Notifications en cas de données patient préoccupantes (définies par des seuils).
4. **Pour l'Administrateur**:
   - **Gestion des Utilisateurs**: Visualiser les comptes, gérer les rôles (ex: valider un compte médecin), suspendre/activer des comptes.
   - **Gestion de Contenu de Base (optionnel MVP)**: Gérer des listes de types de données, catégories d'objectifs, etc.
   - **Monitoring Simple de la Plateforme (optionnel MVP)**: Statistiques d'utilisation basiques.
5. **Gestion Avancée du Consentement**:
   - **Ce que ça fait**: Processus clair pour que l'utilisateur simple consente au partage de ses données avec un médecin spécifique. Gestion de la révocation du consentement.
   - **Pourquoi c'est important**: Crucial pour la confiance et la conformité légale.
   - **Comment ça marche (haut niveau)**: Mécanisme de demande et d'approbation de lien médecin-patient. Statut stocké dans medecin_patient_relations.

# **User Experience**

### **User Personas**

(Inchangé)

- **Alex (L'Utilisateur Actif)**
- **Dr. Bernard (Le Médecin Connecté)**
- **Chris (L'Administrateur Système)**

### **Key User Flows**

(Globalement inchangé, mais le feedback IA sera plus simple et utilisera les API spécifiées)

1. **Inscription (Patient, Médecin, Admin)**
2. **Patient \- Suivi Quotidien**: Saisie de données \-\> Prise de photo de repas \+ feedback IA simplifié (via ex: Google Vision AI) \-\> Interaction avec le chatbot basique (via API Google) \-\> Consultation des recommandations initiales (générées par API Google) \-\> Vérification des objectifs.
3. **Patient \- Liaison avec Médecin**
4. **Médecin \- Suivi Patient**
5. **Admin \- Gestion Utilisateur**

### **UI/UX Considerations**

(Inchangé)

- **Interfaces Adaptées aux Rôles**
- **Simplicité et Clarté**
- **Intégration Naturelle de l'IA (simplifiée)**
- **Confidentialité et Confiance**
- **Feedback IA Utile (même simplifié)**
- **Langue**: Français.

</context>

<PRD>

# **Technical Architecture**

### **System Components**

(Précision sur les API IA)

1. **Application Frontend (Client)**: Nuxt 3 (Vue.js).
2. **Serveur Backend Applicatif**: Nuxt 3 (Nitro).
3. **Base de Données et Services Backend**: Supabase.
4. **Modules d'Intelligence Artificielle (IA) \- MVP Simplifié**:
   - **Analyse de texte (Chatbot Basique, Recommandations Simples)**: **API Google** (ex: Gemini) avec prompts simples et contraints, ou moteur de règles/mots-clés déclenchant une génération de texte simple via l'API Google.
   - **Analyse d'Image (Repas Simplifiée)**: API de reconnaissance d'aliments de base (ex: **Google Vision AI** pour identification d'objets/aliments de base).
   - **Moteur de Recommandation (Simple)**: Principalement basé sur des règles, avec génération de texte par **API Google** pour le MVP.
   - **Analyse de Données de Santé**: Algorithmes simples pour suivi d'objectifs.
5. **Conteneurisation (Docker)**: Pour l'application Nuxt 3\.

### **Data Models (Principales tables dans Supabase)**

(Inchangé)

- utilisateurs
- profils_medecins
- profils_admins
- donnees_sante
- objectifs_sante
- progres_objectifs
- repas_enregistres
- analyses_ia
- recommandations_ia
- chat_sessions
- chat_messages
- medecin_patient_relations
- consentements

### **APIs and Integrations**

(Précision sur les API IA)

- API Backend Nuxt 3\.
- Intégration avec l'**API Google** (ex: Gemini, Google Vision AI) pour les fonctionnalités IA de base du MVP.
- Intégration future avec **OpenAI API** pour les fonctionnalités avancées.
- Potentiellement API pour bases de données alimentaires (pour enrichir l'analyse des repas à l'avenir).

### **Infrastructure Requirements**

(Inchangé)

- Hébergement conteneur Nuxt 3\.
- Supabase Cloud.
- Accès aux API Google (et OpenAI pour le futur).
- Robustesse accrue nécessaire.

# **Development Roadmap**

### **MVP Requirements (Produit Minimum Viable Étendu \- Simplifié)**

L'objectif est de livrer les fonctionnalités clés avec une IA fonctionnelle mais basique, utilisant les API spécifiées.

1. **Phase 0: Fondations, Authentification Multi-Rôles, Docker** (Inchangé)
   - \[ \] Projets Nuxt 3 & Supabase, tables de base.
   - \[ \] Dockerfile, Docker Compose.
   - \[ \] Authentification Patient, Médecin (validation basique), Admin. Profils de base.
   - \[ \] Gestion du consentement pour liaison médecin-patient.
2. **Phase 1: Fonctionnalités Patient (Hors IA)** (Inchangé)
   - \[ \] Saisie manuelle de données de santé (1-2 types).
   - \[ \] Visualisation de l'historique.
   - \[ \] Définition et suivi d'objectifs (1 type simple).
   - \[ \] Interface de communication patient-médecin.
3. **Phase 2: Fonctionnalités Médecin** (Inchangé)
   - \[ \] Tableau de bord des patients.
   - \[ \] Consultation des données patient.
   - \[ \] Interface de communication.
4. **Phase 3: Intégration IA \- Analyse de Repas (Simplifiée via ex: Google Vision AI) & Recommandations (Basiques via API Google)**
   - \[ \] Saisie manuelle et par photo (simple upload) de repas.
   - \[ \] Intégration d'une API d'analyse d'image (ex: **Google Vision AI** pour identifier quelques groupes d'aliments ou un sentiment général). Stockage repas_enregistres avec feedback IA simplifié.
   - \[ \] Logique IA très simple (ex: basée sur des règles) pour fournir 1-2 recommandations alimentaires générales, texte généré via **API Google**. Table recommandations_ia.
   - \[ \] Affichage de ces recommandations au patient.
5. **Phase 4: Intégration IA \- Chatbot Santé (Basique via API Google)**
   - \[ \] Interface de chat pour le patient.
   - \[ \] Intégration de l'**API Google** (ex: Gemini avec des prompts très contraints pour des réponses à des questions de santé générales prédéfinies ou très simples, ou un système basé sur des mots-clés). Tables chat_sessions, chat_messages.
   - \[ \] Disclaimer clair sur les limites (non-diagnostique, information de base).
6. **Phase 5: Fonctionnalités Administrateur (Basique)** (Inchangé)
   - \[ \] Interface de gestion des utilisateurs.
7. **Phase 6: Finalisation MVP Simplifié, Tests, Dockerisation** (Inchangé)
   - \[ \] UI/UX global.
   - \[ \] Tests.
   - \[ \] Revue sécurité.
   - \[ \] Optimisation Dockerfile. Documentation.

### **Future Enhancements (Post MVP Étendu / Post projet d'études)**

- **IA Avancée pour les Recommandations**: Profilage nutritionnel complet, analyse comportementale détaillée, plans personnalisés (potentiellement avec génération de texte par **OpenAI API**).
- **Analyse de Repas Précise et Détaillée**: Identification fine des aliments, estimation des macronutriments et calories, intégration avec des bases de données alimentaires complètes (utilisant **OpenAI API avec Vision** ou des API spécialisées).
- **Chatbot IA Élaboré**: Compréhension du langage naturel avancée (NLU), gestion de dialogues complexes, capacité de suivi de contexte, intégration de RAG (Retrieval Augmented Generation) sur des bases de connaissances médicales validées pour des réponses plus riches et sourcées (utilisant **OpenAI API**, ex: GPT-4, GPT-4o).
- **Suivi d'Objectifs Plus Complexe**: Plans d'action générés par IA, adaptation dynamique des objectifs (potentiellement avec **OpenAI API**).
- Alertes intelligentes et prédictives pour les médecins.
- Gamification.
- Intégration de dispositifs portables.
- Modules d'administration plus complets.

# **Logical Dependency Chain (Simplifiée pour MVP Étendu)**

(Inchangé)

1. Fondations & Auth Multi-Rôles (Docker)
2. Saisie Données Patient & Visualisation
3. Liaison & Communication Patient-Médecin
4. Vue Médecin des Données Patient
5. Analyse Photo Repas (IA Simplifiée via ex: Google Vision AI)
6. Recommandations Alimentaires (Basiques IA via API Google)
7. Chatbot Santé (Basique IA via API Google)
8. Gestion Objectifs Patient
9. Admin Basique

# **Risks and Mitigations**

(Inchangé)

- **Complexité Accrue**
- **Sécurité et Confidentialité**
- **Fiabilité et Éthique de l'IA**
- **Coût des API IA** (maintenant spécifique à Google pour MVP, OpenAI pour futur)
- **Validation des Médecins**

# **Appendix**

### **Research Findings**

(Inchangé)

### **Technical Specifications**

(Précisions sur les API)

- **IA \- Chatbot (MVP Basique)**: **API Google** (ex: Gemini) avec prompts très simples et contraints ou moteur de règles/mots-clés.
- **IA \- Analyse d'Image (Repas MVP Simplifiée)**: **Google Vision AI** (fonctionnalités de base pour l'identification d'objets/aliments).
- **IA \- Recommandations (MVP)**: Système basé sur des règles simples, avec génération de texte de recommandation via **API Google**.
- **IA \- Chatbot Élaboré (Futur)**: **OpenAI API** (ex: GPT-4, GPT-4o) pour NLU avancé, RAG.
- **IA \- Analyse d'Image Avancée (Repas \- Futur)**: **OpenAI API avec Vision** (ex: GPT-4V) ou autres API spécialisées pour l'analyse nutritionnelle détaillée.
- **Communication en Temps Réel (optionnel)**: Supabase Realtime.

Ce PRD ajusté devrait mieux correspondre à vos contraintes de temps pour le projet de fin d'études, tout en gardant une feuille de route claire pour les évolutions futures et en spécifiant les choix d'API.

</PRD>
