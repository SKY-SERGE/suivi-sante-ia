# Guide de tests End-to-End - Système de messagerie sécurisée

## Objectif

Ce guide décrit les procédures de test complètes pour valider le fonctionnement sécurisé du système de messagerie entre patients et médecins.

## Prérequis

- Application Nuxt lancée (`npm run dev`)
- Base de données Supabase configurée avec les schémas
- Au moins 2 comptes utilisateur : 1 patient et 1 médecin
- Consentement actif entre le patient et le médecin

## Tests automatisés de sécurité

### 1. Accès à la suite de tests

```bash
# Naviguer vers la page de tests de sécurité
http://localhost:3000/security-tests
```

### 2. Exécution des tests

1. Cliquer sur "Lancer les tests"
2. Attendre l'exécution complète (30-60 secondes)
3. Vérifier que tous les tests passent avec succès
4. Examiner les détails des échecs éventuels

### 3. Tests inclus

#### Tests de validation de contenu ✅

- Détection XSS (`<script>` tags)
- Validation longueur minimum (10 caractères)
- Validation longueur maximum (5000 caractères)
- Acceptation de contenu légitime

#### Tests de permissions ✅

- Vérification accès autorisé avec consentement
- Refus d'accès non autorisé
- Validation des rôles utilisateur

#### Tests d'intégrité ✅

- Vérification des hash SHA-256
- Cohérence des métadonnées
- Protection contre la falsification

## Tests manuels End-to-End

### Scénario 1 : Envoi de message patient → médecin

#### Étapes :

1. **Connexion patient**

   ```
   http://localhost:3000/auth/login
   ```

2. **Navigation vers messages**

   ```
   Dashboard patient → "Messages sécurisés"
   ```

3. **Composition du message**

   - Cliquer sur "Nouveau message"
   - Sélectionner le médecin dans la liste déroulante
   - Saisir un message valide (>10 caractères)
   - Choisir la priorité (normale/urgente)
   - Cliquer sur "Envoyer"

4. **Vérifications attendues** ✅
   - Message affiché dans la liste des conversations
   - Statut "Envoyé" visible
   - Toast de confirmation affiché

### Scénario 2 : Réception et réponse médecin

#### Étapes :

1. **Connexion médecin**

   ```
   http://localhost:3000/auth/login
   ```

2. **Navigation vers messages**

   ```
   Dashboard médecin → "Messages patients"
   ```

3. **Vérification du nouveau message**

   - Badge "non lu" visible sur le message
   - Compteur de messages non lus mis à jour
   - Indicateur de priorité si urgent

4. **Lecture et réponse**

   - Cliquer sur la conversation
   - Lire le message (statut passe à "lu")
   - Rédiger une réponse
   - Envoyer la réponse

5. **Vérifications attendues** ✅
   - Message marqué comme lu côté patient
   - Réponse visible dans la conversation
   - Notification reçue côté patient

### Scénario 3 : Tests de sécurité manuels

#### Test d'injection XSS

1. Tenter d'envoyer un message avec :
   ```html
   <script>
     alert("XSS");
   </script>
   Bonjour docteur
   ```
2. **Résultat attendu** ❌ : Message rejeté avec erreur de validation

#### Test de longueur

1. Tenter d'envoyer un message de 2 caractères : "OK"
2. **Résultat attendu** ❌ : Erreur "minimum 10 caractères"

3. Tenter d'envoyer un message de 6000 caractères
4. **Résultat attendu** ❌ : Erreur "maximum 5000 caractères"

#### Test d'accès non autorisé

1. Modifier l'URL pour accéder aux messages d'un autre utilisateur
2. **Résultat attendu** ❌ : Accès refusé ou redirection

### Scénario 4 : Fonctionnalités avancées

#### Test de messages urgents

1. Envoyer un message avec priorité "Urgent"
2. **Vérifications** ✅ :
   - Badge rouge "Urgent" visible
   - Tri prioritaire dans la liste
   - Notification push (si configurée)

#### Test d'archivage

1. Archiver une conversation
2. **Vérifications** ✅ :
   - Conversation disparaît de la vue principale
   - Accessible dans "Messages archivés"
   - Possibilité de désarchiver

#### Test de recherche

1. Utiliser la fonction de recherche
2. **Vérifications** ✅ :
   - Recherche dans le contenu des messages
   - Filtrage par patient/médecin
   - Résultats pertinents affichés

## Tests de performance

### Test de charge

1. Envoyer 10 messages rapidement
2. **Vérifications** ✅ :
   - Tous les messages sont envoyés
   - Pas de perte de données
   - Interface reste réactive

### Test de synchronisation

1. Ouvrir la même conversation dans 2 onglets
2. Envoyer un message dans l'onglet 1
3. **Vérification** ✅ : Message apparaît automatiquement dans l'onglet 2

## Validation de la conformité

### RGPD

- [ ] Consentement explicite pour la communication
- [ ] Possibilité de révoquer le consentement
- [ ] Droit à l'effacement des données
- [ ] Export des données personnelles

### Sécurité médicale

- [ ] Chiffrement des données en transit
- [ ] Contrôle d'accès strict
- [ ] Audit trail complet
- [ ] Sauvegarde sécurisée

## Checklist de validation finale

### Tests automatisés ✅

- [ ] Suite de tests de sécurité : 100% réussite
- [ ] Tests de validation : Toutes les règles appliquées
- [ ] Tests de permissions : Accès contrôlé

### Tests manuels ✅

- [ ] Envoi patient → médecin fonctionnel
- [ ] Réponse médecin → patient fonctionnelle
- [ ] Sécurité XSS validée
- [ ] Contrôles de longueur appliqués
- [ ] Messages urgents traités correctement

### Interface utilisateur ✅

- [ ] Design responsive sur mobile/desktop
- [ ] Messages d'erreur clairs
- [ ] Confirmations visuelles appropriées
- [ ] Navigation intuitive

### Performance ✅

- [ ] Temps de chargement < 2 secondes
- [ ] Synchronisation en temps réel
- [ ] Gestion de la charge acceptable

## Rapport de bugs

Si vous rencontrez des problèmes :

1. **Documenter** le comportement observé vs attendu
2. **Capturer** les erreurs console (F12)
3. **Noter** les étapes de reproduction
4. **Signaler** via le système de tickets

---

_Guide mis à jour le : 7 juin 2025_
_Validé par : Équipe sécurité_
