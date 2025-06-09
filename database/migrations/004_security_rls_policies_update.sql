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

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Les médecins peuvent lire les profils des patients qui ont donné leur consentement
CREATE POLICY "Doctors can read consented patient profiles" ON users
    FOR SELECT
    USING (
        role = 'patient' AND
        EXISTS (
            SELECT 1 FROM consents
            WHERE patient_id = users.id
            AND doctor_id = auth.uid()
            AND status = 'granted'
        )
        OR auth.uid() = id
    );

-- Les admins peuvent tout lire (pour les cas d'urgence)
CREATE POLICY "Admins can read all user profiles" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users as u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- ===============================================================
-- POLITIQUES POUR LA TABLE USER_PROFILES
-- ===============================================================

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

-- Les patients peuvent gérer leurs consentements
CREATE POLICY "Patients can manage their consents" ON consents
    FOR ALL
    USING (patient_id = auth.uid());

-- Les médecins peuvent voir les consentements qui les concernent
CREATE POLICY "Doctors can view their consents" ON consents
    FOR SELECT
    USING (doctor_id = auth.uid() OR patient_id = auth.uid());

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

-- Les patients peuvent gérer leurs objectifs de santé
CREATE POLICY "Patients can manage own health goals" ON health_goals
    FOR ALL
    USING (user_id = auth.uid());

-- Les médecins peuvent lire et modifier les objectifs des patients consentants
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

-- Les patients peuvent lire leurs propres recommandations
CREATE POLICY "Patients can read own AI recommendations" ON ai_recommendations
    FOR SELECT
    USING (user_id = auth.uid());

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

-- Le système peut créer des recommandations
CREATE POLICY "System can create AI recommendations" ON ai_recommendations
    FOR INSERT
    WITH CHECK (true); -- Autoriser l'insertion depuis l'application

-- Les patients peuvent marquer leurs recommandations comme lues/archivées
CREATE POLICY "Patients can update own AI recommendations status" ON ai_recommendations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ===============================================================
-- POLITIQUES POUR LA TABLE CHAT_MESSAGES
-- ===============================================================

-- Les utilisateurs peuvent lire les messages qu'ils ont envoyés ou reçus
CREATE POLICY "Users can read their own chat messages" ON chat_messages
    FOR SELECT
    USING (
        sender_id = auth.uid() 
        OR recipient_id = auth.uid()
        OR recipient_id IS NULL -- Messages du chatbot IA
    );

-- Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Users can send chat messages" ON chat_messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        (
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

-- Les utilisateurs peuvent lire leurs propres sessions de chat
CREATE POLICY "Users can read own chat sessions" ON chat_sessions
    FOR SELECT
    USING (
        patient_id = auth.uid() 
        OR doctor_id = auth.uid()
        OR (doctor_id IS NULL AND patient_id = auth.uid()) -- Sessions avec IA
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

-- ===============================================================
-- FONCTIONS D'AIDE POUR LA SÉCURITÉ
-- ===============================================================

-- Fonction pour vérifier si un utilisateur est médecin
CREATE OR REPLACE FUNCTION is_doctor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id AND role = 'doctor'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier le consentement entre patient et médecin
CREATE OR REPLACE FUNCTION has_valid_consent(patient_id UUID, doctor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM consents
        WHERE consents.patient_id = has_valid_consent.patient_id
        AND consents.doctor_id = has_valid_consent.doctor_id
        AND status = 'granted'
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================
-- TRIGGERS POUR L'AUDIT DE SÉCURITÉ
-- ===============================================================

-- Table pour l'audit des accès aux données sensibles
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
    record_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}'
);

-- Activer RLS sur la table d'audit
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire les logs d'audit
CREATE POLICY "Only admins can read security audit logs" ON security_audit_log
    FOR SELECT
    USING (is_admin(auth.uid()));

-- Le système peut écrire des logs d'audit
CREATE POLICY "System can write security audit logs" ON security_audit_log
    FOR INSERT
    WITH CHECK (true);

-- Fonction pour logger l'accès aux données sensibles
CREATE OR REPLACE FUNCTION log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignorer les opérations système
    IF current_user = 'postgres' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    INSERT INTO security_audit_log (
        user_id,
        table_name,
        operation,
        record_id,
        details
    ) VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'changed_columns', (
                CASE WHEN TG_OP = 'UPDATE' THEN
                    ARRAY(
                        SELECT key FROM jsonb_each(to_jsonb(NEW))
                        WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
                    )
                ELSE NULL END
            )
        )
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers d'audit pour les tables sensibles
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'health_data', 
            'meal_records', 
            'chat_messages', 
            'ai_recommendations',
            'consents'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS audit_trigger_%s ON %s;
            CREATE TRIGGER audit_trigger_%s
                AFTER INSERT OR UPDATE OR DELETE ON %s
                FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- ===============================================================
-- VUES SÉCURISÉES POUR L'APPLICATION
-- ===============================================================

-- Vue pour les données de santé avec consentement
CREATE OR REPLACE VIEW patient_health_data_view AS
SELECT 
    hd.*,
    u.first_name,
    u.last_name,
    u.date_of_birth
FROM health_data hd
JOIN users u ON hd.user_id = u.id
WHERE 
    -- Patient voit ses propres données
    hd.user_id = auth.uid()
    OR
    -- Médecin voit les données des patients consentants
    (
        EXISTS (
            SELECT 1 FROM users doc 
            WHERE doc.id = auth.uid() AND doc.role = 'doctor'
        )
        AND has_valid_consent(hd.user_id, auth.uid())
    )
    OR
    -- Admin voit tout
    is_admin(auth.uid());

-- Vue pour les recommandations IA avec consentement
CREATE OR REPLACE VIEW patient_recommendations_view AS
SELECT 
    ar.*,
    u.first_name,
    u.last_name
FROM ai_recommendations ar
JOIN users u ON ar.user_id = u.id
WHERE 
    -- Patient voit ses propres recommandations
    ar.user_id = auth.uid()
    OR
    -- Médecin voit les recommandations des patients consentants
    (
        EXISTS (
            SELECT 1 FROM users doc 
            WHERE doc.id = auth.uid() AND doc.role = 'doctor'
        )
        AND has_valid_consent(ar.user_id, auth.uid())
    )
    OR
    -- Admin voit tout
    is_admin(auth.uid());

-- ===============================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ===============================================================

COMMENT ON TABLE security_audit_log IS 'Table d''audit pour tracer tous les accès aux données sensibles';
COMMENT ON FUNCTION has_valid_consent IS 'Vérifie si un consentement valide existe entre un patient et un médecin';
COMMENT ON FUNCTION log_sensitive_data_access IS 'Fonction trigger pour logger l''accès aux données sensibles';
COMMENT ON VIEW patient_health_data_view IS 'Vue sécurisée pour l''accès aux données de santé avec respect du consentement';
COMMENT ON VIEW patient_recommendations_view IS 'Vue sécurisée pour l''accès aux recommandations IA avec respect du consentement';
