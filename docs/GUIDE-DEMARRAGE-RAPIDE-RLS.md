# 🚀 Guide de Démarrage Rapide - Résolution de l'Erreur RLS

## ⚡ Solution Immédiate (2 minutes)

### Étape 1: Correction Supabase

1. **Ouvrez votre dashboard Supabase** → SQL Editor
2. **Collez et exécutez** le code suivant :

```sql
-- Corriger les politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Fonction RPC de sécurité
CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID, p_email TEXT, p_first_name TEXT DEFAULT '', p_last_name TEXT DEFAULT '', p_role user_role DEFAULT 'patient'
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_data JSON; new_user users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Utilisateur non authentifié'; END IF;
  IF auth.uid() != p_id THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  IF EXISTS (SELECT 1 FROM users WHERE id = p_id) THEN RAISE EXCEPTION 'Profil existe déjà'; END IF;

  INSERT INTO users (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (p_id, p_email, COALESCE(p_first_name, ''), COALESCE(p_last_name, ''), COALESCE(p_role, 'patient'), NOW(), NOW())
  RETURNING * INTO new_user;

  RETURN json_build_object('success', true, 'user', json_build_object('id', new_user.id, 'email', new_user.email,
    'first_name', new_user.first_name, 'last_name', new_user.last_name, 'role', new_user.role));
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END; $$;

GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, user_role) TO authenticated;
```

### Étape 2: Vérification

Votre application devrait maintenant fonctionner ! 🎉

## 🔧 Ce qui a été corrigé

### 1. **Page Profil Refactorisée**

- ✅ Remplacement complet des composants NuxtUI par Shadcn Vue
- ✅ Formulaires avec validation robuste (Zod + vee-validate)
- ✅ Cards pour l'organisation des sections
- ✅ Compatibilité Tailwind CSS v4

### 2. **Résolution RLS Multiple**

- ✅ **Méthode 1**: Fonction RPC sécurisée (recommandée)
- ✅ **Méthode 2**: API route avec gestion d'erreur
- ✅ **Méthode 3**: Insertion directe avec politiques corrigées
- ✅ **Fallback automatique** entre toutes les méthodes

### 3. **Système de Diagnostic**

- ✅ Page de debug `/debug/profile` pour tester toutes les méthodes
- ✅ Logs détaillés pour identifier les problèmes
- ✅ Composables de diagnostic RLS

## 📁 Fichiers Modifiés

### Code Principal

- `pages/profile.vue` - Page de profil refactorisée
- `composables/useUserProfile.ts` - Logique robuste de création
- `composables/useUserProfileCreation.ts` - Méthodes de fallback
- `server/api/user/create-profile.post.ts` - API route sécurisée

### Migrations & Scripts

- `database/migrations/quick-fix-rls-complete.sql` - Correction rapide
- `database/migrations/fix_users_rls_policies.sql` - Politiques RLS
- `database/migrations/create_user_profile_function.sql` - Fonction RPC
- `scripts/apply-rls-migrations-auto.ps1` - Script automatisé Windows

### Documentation

- `docs/RESOLUTION-RAPIDE-RLS.md` - Ce guide
- `docs/RESOLUTION-PROFILE-CREATION-RLS-ERROR.md` - Guide détaillé

## 🧪 Tests Disponibles

### Diagnostic Complet

```bash
# Visitez cette page pour diagnostiquer
http://localhost:3000/debug/profile
```

### Vérification Manuelle

1. **Créez un compte** ou connectez-vous
2. **Allez sur la page profil** `/profile`
3. **Remplissez et sauvegardez** vos informations
4. **Vérifiez les logs** dans la console du navigateur

## 🔍 En cas de problème

### Logs à vérifier

```javascript
// Console navigateur - recherchez ces messages
"Profil créé avec succès via [méthode]";
"Tentative de création via [méthode]...";
```

### Diagnostic Base de Données

```sql
-- Vérifier les politiques appliquées
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- Vérifier la fonction RPC
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'create_user_profile';
```

## 🎯 Résultats Attendus

Après application de la correction :

- ✅ **Création de profil** fonctionne sans erreur RLS
- ✅ **Interface utilisateur** moderne avec Shadcn Vue
- ✅ **Sécurité maintenue** avec politiques RLS appropriées
- ✅ **Fallback automatique** en cas de problème

## 💡 Points Clés

1. **Multiple méthodes de création** pour une fiabilité maximale
2. **Diagnostic intégré** pour identifier rapidement les problèmes
3. **Sécurité préservée** - toutes les méthodes respectent l'authentification
4. **Interface moderne** - transition complète vers Shadcn Vue

---

**🎉 Votre application de suivi santé IA est maintenant prête !**

Si vous rencontrez encore des problèmes, consultez les logs dans `/debug/profile` ou la documentation détaillée.
