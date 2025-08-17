-- ===============================================================
-- MISE À JOUR DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- Application: Suivi Santé IA
-- Fichier: 004_security_rls_policies_update.sql
-- ===============================================================

-- Active RLS sur toutes les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- ===============================================================
-- POLITIQUES POUR LA TABLE USERS
-- ===============================================================

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Doctors can read consented patient profiles" ON users;
DROP POLICY IF EXISTS "Admins can read all user profiles" ON users;

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Médecins peuvent lire les profils des patients consentants
CREATE POLICY "Doctors can read consented patient profiles" ON users
    FOR SELECT
    USING (
        role = 'patient' AND (
            EXISTS (
                SELECT 1 FROM consents
                WHERE patient_id = users.id
                AND doctor_id = auth.uid()
                AND status = 'granted'
            )
            OR auth.uid() = id
        )
    );

-- Les administrateurs peuvent lire tous les profils
CREATE POLICY "Admins can read all user profiles" ON users
    FOR SELECT
    USING (is_admin(auth.uid()));

-- ===============================================================
-- POLITIQUES POUR LA TABLE USER_PROFILES
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own detailed profile" ON user_profiles;
DROP POLICY IF EXISTS "Doctors can read consented patient detailed profiles" ON user_profiles;

-- Les utilisateurs peuvent gérer leur propre profil détaillé
CREATE POLICY "Users can manage own detailed profile" ON user_profiles
    FOR ALL
    USING (user_id = auth.uid());

-- Les médecins peuvent lire les profils détaillés des patients consentants
CREATE POLICY "Doctors can read consented patient detailed profiles" ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = user_profiles.user_id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR user_id = auth.uid()
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE CONSENTS
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can manage their consents" ON consents;
DROP POLICY IF EXISTS "Doctors can view their consents" ON consents;
DROP POLICY IF EXISTS "Doctors can create consent requests" ON consents;

-- Les patients peuvent gérer leurs consentements
CREATE POLICY "Patients can manage their consents" ON consents
    FOR ALL
    USING (patient_id = auth.uid());

-- Les médecins peuvent voir les consentements qui les concernent
CREATE POLICY "Doctors can view their consents" ON consents
    FOR SELECT
    USING (doctor_id = auth.uid());

-- Les médecins peuvent créer des demandes de consentement
CREATE POLICY "Doctors can create consent requests" ON consents
    FOR INSERT
    WITH CHECK (
        doctor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'doctor'
        )
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE HEALTH_DATA
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can manage own health data" ON health_data;
DROP POLICY IF EXISTS "Doctors can read consented patient health data" ON health_data;
DROP POLICY IF EXISTS "Doctors can add health data for consented patients" ON health_data;

-- Les patients peuvent gérer leurs propres données de santé
CREATE POLICY "Patients can manage own health data" ON health_data
    FOR ALL
    USING (user_id = auth.uid());

-- Les médecins peuvent lire les données des patients consentants
CREATE POLICY "Doctors can read consented patient health data" ON health_data
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = health_data.user_id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR user_id = auth.uid()
    );

-- Les médecins peuvent ajouter des données pour leurs patients consentants
CREATE POLICY "Doctors can add health data for consented patients" ON health_data
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = health_data.user_id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR user_id = auth.uid()
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE HEALTH_GOALS
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can manage own health goals" ON health_goals;
DROP POLICY IF EXISTS "Doctors can manage consented patient health goals" ON health_goals;

-- Les patients peuvent gérer leurs propres objectifs de santé
CREATE POLICY "Patients can manage own health goals" ON health_goals
    FOR ALL
    USING (user_id = auth.uid());

-- Les médecins peuvent gérer les objectifs des patients consentants
CREATE POLICY "Doctors can manage consented patient health goals" ON health_goals
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = health_goals.user_id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR user_id = auth.uid()
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE MEAL_RECORDS
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can manage own meal records" ON meal_records;
DROP POLICY IF EXISTS "Doctors can read consented patient meal records" ON meal_records;

-- Les patients peuvent gérer leurs enregistrements de repas
CREATE POLICY "Patients can manage own meal records" ON meal_records
    FOR ALL
    USING (user_id = auth.uid());

-- Les médecins peuvent lire les repas des patients consentants
CREATE POLICY "Doctors can read consented patient meal records" ON meal_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = meal_records.user_id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR user_id = auth.uid()
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE AI_RECOMMENDATIONS
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can read own AI recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "System can create AI recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Patients can update own AI recommendations status" ON ai_recommendations;
DROP POLICY IF EXISTS "Doctors can read consented patient AI recommendations" ON ai_recommendations;

-- Les patients peuvent lire leurs propres recommandations
CREATE POLICY "Patients can read own AI recommendations" ON ai_recommendations
    FOR SELECT
    USING (user_id = auth.uid());

-- Le système peut créer des recommandations
CREATE POLICY "System can create AI recommendations" ON ai_recommendations
    FOR INSERT
    WITH CHECK (true); 

-- Les patients peuvent mettre à jour le statut de leurs recommandations
CREATE POLICY "Patients can update own AI recommendations status" ON ai_recommendations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Les médecins peuvent lire les recommandations des patients consentants
CREATE POLICY "Doctors can read consented patient AI recommendations" ON ai_recommendations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = ai_recommendations.user_id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR user_id = auth.uid()
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE CHAT_MESSAGES
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON chat_messages;

-- Les utilisateurs peuvent lire leurs propres messages de chat
CREATE POLICY "Users can read their own chat messages" ON chat_messages
    FOR SELECT
    USING (
        sender_id = auth.uid() 
        OR recipient_id = auth.uid()
        OR recipient_id IS NULL 
    );

-- Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Users can send chat messages" ON chat_messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND (
            -- Messages vers le chatbot IA
            recipient_id IS NULL
            OR
            -- Messages entre patient et médecin avec consentement
            EXISTS (
                SELECT 1 FROM consents
                WHERE (
                    (patient_id = sender_id AND doctor_id = recipient_id)
                    OR
                    (doctor_id = sender_id AND patient_id = recipient_id)
                )
                AND status = 'granted'
            )
        )
    );

-- Les utilisateurs peuvent marquer leurs messages comme lus
CREATE POLICY "Users can mark messages as read" ON chat_messages
    FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ===============================================================
-- POLITIQUES POUR LA TABLE CHAT_SESSIONS
-- ===============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;

-- Les utilisateurs peuvent lire leurs propres sessions de chat
CREATE POLICY "Users can read own chat sessions" ON chat_sessions
    FOR SELECT
    USING (
        patient_id = auth.uid()
        OR doctor_id = auth.uid()
        OR (doctor_id IS NULL AND patient_id = auth.uid()) 
    );

-- Les utilisateurs peuvent créer des sessions de chat
CREATE POLICY "Users can create chat sessions" ON chat_sessions
    FOR INSERT
    WITH CHECK (
        patient_id = auth.uid()
        OR doctor_id = auth.uid()
    );

-- Les utilisateurs peuvent mettre à jour leurs propres sessions
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
    FOR UPDATE
    USING (
        patient_id = auth.uid() 
        OR doctor_id = auth.uid()
    );