-- ==============================================================================
-- SUIVI SANTÉ IA - DATABASE SCHEMA
-- ==============================================================================
-- Ce fichier contient le schéma complet pour l'application de suivi de santé
-- Version: MVP
-- Date: 2025-06-06
-- ==============================================================================

-- ==============================================================================
-- TYPES ENUMS
-- ==============================================================================

-- Type de rôle utilisateur
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- Statut de consentement
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'revoked', 'expired');

-- Type de données de santé
CREATE TYPE health_data_type AS ENUM ('mood', 'sleep', 'activity', 'symptoms', 'weight', 'blood_pressure', 'heart_rate', 'temperature');

-- Statut d'objectif
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');

-- ==============================================================================
-- TABLE: UTILISATEURS
-- ==============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Champs spécifiques aux médecins
    medical_license TEXT, -- Pour les médecins
    specialization TEXT,  -- Pour les médecins
    
    -- Champs spécifiques aux patients
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT
);

-- ==============================================================================
-- TABLE: PROFILS UTILISATEURS (Informations détaillées)
-- ==============================================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    language_preference TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Europe/Paris',
    preferences JSONB DEFAULT '{}', -- Préférences diverses en JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- TABLE: CONSENTEMENTS (Patient-Médecin)
-- ==============================================================================

CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status consent_status NOT NULL DEFAULT 'pending',
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(patient_id, doctor_id)
);

-- ==============================================================================
-- TABLE: DONNÉES DE SANTÉ
-- ==============================================================================

CREATE TABLE health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_type health_data_type NOT NULL,
    value NUMERIC,
    unit TEXT,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées additionnelles en JSON
    metadata JSONB DEFAULT '{}'
);

-- ==============================================================================
-- TABLE: OBJECTIFS DE SANTÉ
-- ==============================================================================

CREATE TABLE health_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    unit TEXT,
    status goal_status DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- TABLE: REPAS ENREGISTRÉS
-- ==============================================================================

CREATE TABLE meal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meal_name TEXT,
    meal_type TEXT, -- petit-déjeuner, déjeuner, dîner, collation
    description TEXT,
    photo_url TEXT, -- URL de la photo dans Supabase Storage
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Données nutritionnelles (optionnel pour MVP)
    calories NUMERIC,
    proteins NUMERIC,
    carbohydrates NUMERIC,
    fats NUMERIC,
    
    -- Métadonnées de l'analyse IA
    ai_analysis JSONB DEFAULT '{}'
);

-- ==============================================================================
-- TABLE: RECOMMANDATIONS IA
-- ==============================================================================

CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'meal', 'health', 'goal', etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Référence optionnelle vers une donnée source
    source_table TEXT,
    source_id UUID,
    
    -- Métadonnées de l'IA
    ai_metadata JSONB DEFAULT '{}'
);

-- ==============================================================================
-- TABLE: MESSAGES CHAT (Patient-Médecin + Chatbot IA)
-- ==============================================================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL pour chatbot IA
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
    is_ai_message BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées pour les messages IA
    ai_context JSONB DEFAULT '{}',
    
    -- Pour les files/images
    attachment_url TEXT
);

-- ==============================================================================
-- TABLE: SESSIONS DE CHAT (Grouper les conversations)
-- ==============================================================================

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id), -- NULL pour chatbot IA
    is_ai_session BOOLEAN DEFAULT FALSE,
    title TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================================
-- TABLE: MESSAGES SÉCURISÉS (Patient-Médecin uniquement)
-- ==============================================================================

CREATE TABLE secure_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    subject TEXT,
    sender_role user_role NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
    is_read BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contraintes pour s'assurer que les rôles correspondent
    CONSTRAINT check_sender_role CHECK (
        (sender_role = 'patient' AND patient_id = (SELECT id FROM users WHERE id = patient_id AND role = 'patient')) OR
        (sender_role = 'doctor' AND doctor_id = (SELECT id FROM users WHERE id = doctor_id AND role = 'doctor'))
    )
);

-- ==============================================================================
-- TABLE: IMAGES DE REPAS (Métadonnées des photos uploadées)
-- ==============================================================================

CREATE TABLE meal_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL, -- Chemin dans Supabase Storage
    thumbnail_path TEXT, -- Chemin de la miniature
    original_file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées techniques
    metadata JSONB DEFAULT '{}',
    
    -- Associé à un repas (optionnel, peut être lié plus tard)
    meal_record_id UUID REFERENCES meal_records(id) ON DELETE SET NULL
);

-- ==============================================================================
-- INDEXES POUR PERFORMANCE
-- ==============================================================================

-- Index sur les utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Index sur les consentements
CREATE INDEX idx_consents_patient ON consents(patient_id);
CREATE INDEX idx_consents_doctor ON consents(doctor_id);
CREATE INDEX idx_consents_status ON consents(status);

-- Index sur les données de santé
CREATE INDEX idx_health_data_user ON health_data(user_id);
CREATE INDEX idx_health_data_type ON health_data(data_type);
CREATE INDEX idx_health_data_recorded ON health_data(recorded_at);

-- Index sur les objectifs
CREATE INDEX idx_health_goals_user ON health_goals(user_id);
CREATE INDEX idx_health_goals_status ON health_goals(status);

-- Index sur les repas
CREATE INDEX idx_meal_records_user ON meal_records(user_id);
CREATE INDEX idx_meal_records_recorded ON meal_records(recorded_at);

-- Index sur les images de repas
CREATE INDEX idx_meal_images_user ON meal_images(user_id);
CREATE INDEX idx_meal_images_meal_record ON meal_images(meal_record_id);
CREATE INDEX idx_meal_images_uploaded ON meal_images(uploaded_at);

-- Index sur les recommandations
CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(type);
CREATE INDEX idx_ai_recommendations_read ON ai_recommendations(is_read);

-- Index sur les messages
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient ON chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- Index sur les messages sécurisés
CREATE INDEX idx_secure_messages_patient ON secure_messages(patient_id);
CREATE INDEX idx_secure_messages_doctor ON secure_messages(doctor_id);
CREATE INDEX idx_secure_messages_sender ON secure_messages(sender_role);
CREATE INDEX idx_secure_messages_created ON secure_messages(created_at);
CREATE INDEX idx_secure_messages_read ON secure_messages(is_read);
CREATE INDEX idx_secure_messages_urgent ON secure_messages(is_urgent);

-- ==============================================================================
-- TRIGGERS POUR UPDATED_AT
-- ==============================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_consents_updated_at BEFORE UPDATE ON consents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON health_goals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_messages ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (peuvent voir, créer et modifier leur propre profil)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Politique pour les profils utilisateurs
CREATE POLICY "Users can view own user_profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own user_profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour les données de santé (uniquement le propriétaire et médecins avec consentement)
CREATE POLICY "Users can view own health_data" ON health_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health_data" ON health_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health_data" ON health_data FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les objectifs de santé
CREATE POLICY "Users can manage own health_goals" ON health_goals FOR ALL USING (auth.uid() = user_id);

-- Politique pour les repas
CREATE POLICY "Users can manage own meal_records" ON meal_records FOR ALL USING (auth.uid() = user_id);

-- Politique pour les images de repas
CREATE POLICY "Users can manage own meal_images" ON meal_images FOR ALL USING (auth.uid() = user_id);

-- Politique pour les recommandations IA
CREATE POLICY "Users can view own ai_recommendations" ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_recommendations" ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les messages sécurisés (patients et médecins peuvent voir leurs messages)
CREATE POLICY "Users can view own secure_messages" ON secure_messages FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() = doctor_id
);
CREATE POLICY "Patients can send secure_messages" ON secure_messages FOR INSERT WITH CHECK (
    auth.uid() = patient_id AND sender_role = 'patient'
);
CREATE POLICY "Doctors can send secure_messages" ON secure_messages FOR INSERT WITH CHECK (
    auth.uid() = doctor_id AND sender_role = 'doctor'
);
CREATE POLICY "Users can update own secure_messages" ON secure_messages FOR UPDATE USING (
    auth.uid() = patient_id OR auth.uid() = doctor_id
);

-- ==============================================================================
-- DONNÉES DE TEST (Optionnel pour développement)
-- ==============================================================================

-- Insérer un utilisateur administrateur par défaut
INSERT INTO users (email, role, first_name, last_name) 
VALUES ('admin@suivisante.fr', 'admin', 'Admin', 'System') 
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- FIN DU SCHÉMA
-- ==============================================================================
