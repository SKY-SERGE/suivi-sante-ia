# Sécurité du système de messagerie patient-médecin

## Vue d'ensemble

Le système de messagerie sécurisée entre patients et médecins implémente plusieurs niveaux de sécurité pour garantir la confidentialité, l'intégrité et l'authentification des communications médicales.

## Architecture de sécurité

### 1. Contrôle d'accès basé sur les rôles (RBAC)

- **Patients** : Peuvent envoyer des messages uniquement aux médecins qui ont accepté leur consentement
- **Médecins** : Peuvent répondre aux messages des patients avec lesquels ils ont un consentement actif
- **Administrateurs** : Accès complet pour la modération et la gestion

### 2. Row Level Security (RLS) - Supabase

#### Politiques implémentées :

```sql
-- Visualisation : L'utilisateur ne peut voir que ses propres messages
CREATE POLICY "Users can view own secure_messages" ON secure_messages FOR SELECT USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id
);

-- Insertion patient : Vérification du consentement
CREATE POLICY "Patients can send secure_messages" ON secure_messages FOR INSERT WITH CHECK (
  auth.uid() = patient_id AND verify_patient_consent(patient_id, doctor_id)
);

-- Insertion médecin : Vérification du consentement
CREATE POLICY "Doctors can send secure_messages" ON secure_messages FOR INSERT WITH CHECK (
  auth.uid() = doctor_id AND verify_doctor_consent(doctor_id, patient_id)
);

-- Mise à jour : Seuls les propriétaires peuvent modifier leurs messages
CREATE POLICY "Users can update own secure_messages" ON secure_messages FOR UPDATE USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id
);
```

### 3. Validation du contenu

#### Composable `useSecureMessaging`

Le composable implémente plusieurs couches de validation :

```typescript
export const validateMessageContent = (content: string) => {
  const errors: string[] = [];

  // Validation de longueur
  if (content.length < 10) {
    errors.push("Le message doit contenir au moins 10 caractères");
  }

  if (content.length > 5000) {
    errors.push("Le message ne peut pas dépasser 5000 caractères");
  }

  // Détection de contenu malveillant
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  if (maliciousPatterns.some((pattern) => pattern.test(content))) {
    errors.push("Contenu potentiellement malveillant détecté");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### 4. Chiffrement et intégrité

#### Hachage des messages

Chaque message inclut un hash SHA-256 pour vérifier son intégrité :

```typescript
const messageHash = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(
    JSON.stringify({
      content: message.content,
      sender_id: message.sender_id,
      timestamp: message.created_at,
    })
  )
);
```

#### Stockage sécurisé

- Messages stockés dans la table `secure_messages` avec RLS activé
- Métadonnées séparées pour l'audit et la traçabilité
- Index optimisés pour les requêtes sécurisées

### 5. Tests de sécurité automatisés

#### Suite de tests disponible

Le système inclut une suite complète de tests de sécurité accessible via `/security-tests` :

1. **Tests de validation de contenu**

   - Détection XSS
   - Validation des longueurs
   - Contenu malveillant

2. **Tests de permissions**

   - Accès autorisé avec consentement
   - Refus d'accès non autorisé
   - Vérification des rôles

3. **Tests d'intégrité**

   - Vérification des hash
   - Cohérence des données
   - Protection contre la falsification

4. **Tests d'authentification**

   - Vérification des sessions
   - Expiration des tokens
   - Authentification multi-facteurs (si activée)

5. **Tests de protection contre les attaques**
   - Injection SQL
   - Cross-Site Scripting (XSS)
   - Cross-Site Request Forgery (CSRF)

## Configuration de sécurité

### Variables d'environnement requises

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Sécurité
ENABLE_MESSAGE_ENCRYPTION=true
MESSAGE_RETENTION_DAYS=90
MAX_MESSAGE_SIZE=5000
RATE_LIMIT_MESSAGES_PER_HOUR=50
```

### Politiques de sécurité recommandées

1. **Authentification forte**

   - Mot de passe complexe requis
   - Authentification à deux facteurs recommandée
   - Sessions limitées dans le temps

2. **Audit et logging**

   - Tous les accès aux messages sont loggés
   - Alertes automatiques pour les tentatives d'accès suspectes
   - Archivage automatique des logs

3. **Conformité réglementaire**
   - Respect du RGPD
   - Chiffrement end-to-end pour les données sensibles
   - Droit à l'oubli implémenté

## Monitoring et alertes

### Métriques surveillées

- Nombre de messages par utilisateur/heure
- Tentatives d'accès non autorisé
- Échecs de validation de contenu
- Temps de réponse des requêtes sécurisées

### Alertes automatiques

- Tentatives de connexion suspectes
- Volume anormal de messages
- Échecs répétés de validation
- Erreurs de permission

## Maintenance de sécurité

### Mises à jour régulières

1. **Audit trimestriel** des politiques de sécurité
2. **Tests de pénétration** semestriels
3. **Mise à jour** des dépendances mensuellement
4. **Review** des logs de sécurité hebdomadairement

### Procédures d'incident

1. **Détection** automatique via monitoring
2. **Isolation** immédiate des comptes compromis
3. **Investigation** avec logs détaillés
4. **Notification** aux utilisateurs affectés
5. **Correction** et mise à jour des politiques

## Contact sécurité

Pour tout incident de sécurité ou question relative à la protection des données :

- Email : security@example.com
- Téléphone d'urgence : +33 X XX XX XX XX
- Formulaire de signalement : `/security/report`

---

_Dernière mise à jour : 7 juin 2025_
_Version : 1.0_
