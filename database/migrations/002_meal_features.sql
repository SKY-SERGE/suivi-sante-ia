-- Migration pour ajouter la table des recommandations de repas spécifiques
-- Cette table est différente de ai_recommendations pour être plus spécialisée

-- ==============================================================================
-- TABLE: RECOMMANDATIONS SPÉCIFIQUES AUX REPAS
-- ==============================================================================

CREATE TABLE meal_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES meal_records(id) ON DELETE CASCADE, -- Optionnel, lié à un repas spécifique
    category TEXT NOT NULL, -- 'nutrition', 'variety', 'portion', 'timing', 'balance'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful', 'very_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées pour l'IA
    ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    ai_metadata JSONB DEFAULT '{}'
);

-- ==============================================================================
-- AMÉLIORATION DE LA TABLE MEAL_RECORDS
-- ==============================================================================

-- Ajouter les colonnes manquantes pour correspondre à notre interface
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5);
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS hunger_level INTEGER CHECK (hunger_level >= 1 AND hunger_level <= 5);
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS foods JSONB DEFAULT '[]';
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS ai_identified_foods TEXT[];
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 1);
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Renommer meal_name en type pour correspondre à notre interface
ALTER TABLE meal_records RENAME COLUMN meal_type TO type;

-- Mettre à jour la colonne ai_analysis pour être TEXT au lieu de JSONB pour simplicité
ALTER TABLE meal_records ADD COLUMN IF NOT EXISTS ai_analysis_text TEXT;

-- ==============================================================================
-- INDEXES POUR PERFORMANCE DES NOUVELLES TABLES
-- ==============================================================================

-- Index sur les recommandations de repas
CREATE INDEX idx_meal_recommendations_user ON meal_recommendations(user_id);
CREATE INDEX idx_meal_recommendations_meal ON meal_recommendations(meal_id);
CREATE INDEX idx_meal_recommendations_category ON meal_recommendations(category);
CREATE INDEX idx_meal_recommendations_priority ON meal_recommendations(priority);
CREATE INDEX idx_meal_recommendations_read ON meal_recommendations(is_read);
CREATE INDEX idx_meal_recommendations_bookmarked ON meal_recommendations(is_bookmarked);
CREATE INDEX idx_meal_recommendations_created ON meal_recommendations(created_at);

-- Index sur les nouvelles colonnes de meal_records
CREATE INDEX idx_meal_records_datetime ON meal_records(datetime);
CREATE INDEX idx_meal_records_type ON meal_records(type);
CREATE INDEX idx_meal_records_satisfaction ON meal_records(satisfaction);

-- ==============================================================================
-- TRIGGERS POUR UPDATED_AT
-- ==============================================================================

-- Trigger pour meal_recommendations
CREATE TRIGGER update_meal_recommendations_updated_at 
    BEFORE UPDATE ON meal_recommendations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger pour meal_records
CREATE TRIGGER update_meal_records_updated_at 
    BEFORE UPDATE ON meal_records 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Activer RLS sur la nouvelle table
ALTER TABLE meal_recommendations ENABLE ROW LEVEL SECURITY;

-- Politiques pour les recommandations de repas
CREATE POLICY "Users can view own meal_recommendations" ON meal_recommendations 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_recommendations" ON meal_recommendations 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert meal_recommendations" ON meal_recommendations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- DONNÉES DE TEST POUR LE DÉVELOPPEMENT
-- ==============================================================================

-- Insérer quelques recommandations de test (optionnel)
-- Ces données ne seront insérées que si un utilisateur test existe déjà
/*
INSERT INTO meal_recommendations (user_id, category, title, description, priority, ai_confidence)
SELECT 
    id as user_id,
    'nutrition' as category,
    'Ajouter plus de légumes' as title,
    'Vos repas récents manquent de légumes verts. Essayez d''ajouter des épinards, brocolis ou courgettes à vos plats.' as description,
    'medium' as priority,
    0.85 as ai_confidence
FROM users 
WHERE role = 'patient' 
LIMIT 1
ON CONFLICT DO NOTHING;
*/
