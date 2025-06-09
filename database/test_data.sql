-- ==============================================================================
-- DONNÉES DE TEST POUR SUIVI SANTÉ IA
-- ==============================================================================
-- Ce fichier contient des données de test pour le développement
-- À exécuter APRÈS schema.sql
-- ==============================================================================

-- ==============================================================================
-- UTILISATEURS DE TEST
-- ==============================================================================

-- Patient de test
INSERT INTO users (id, email, role, first_name, last_name, date_of_birth, phone) 
VALUES (
    gen_random_uuid(),
    'patient.test@example.com', 
    'patient', 
    'Jean', 
    'Dupont',
    '1985-03-15',
    '+33123456789'
) ON CONFLICT (email) DO NOTHING;

-- Médecin de test
INSERT INTO users (id, email, role, first_name, last_name, medical_license, specialization) 
VALUES (
    gen_random_uuid(),
    'docteur.martin@example.com', 
    'doctor', 
    'Dr. Marie', 
    'Martin',
    'FR123456789',
    'Médecine générale'
) ON CONFLICT (email) DO NOTHING;

-- Admin de test
INSERT INTO users (id, email, role, first_name, last_name) 
VALUES (
    gen_random_uuid(),
    'admin.test@example.com', 
    'admin', 
    'Admin', 
    'Test'
) ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- PROFILS UTILISATEURS DE TEST
-- ==============================================================================

-- Profil pour le patient de test
INSERT INTO user_profiles (user_id, bio, city, country, preferences)
SELECT 
    u.id,
    'Patient test pour le développement de l''application',
    'Paris',
    'France',
    '{"notifications": true, "language": "fr", "theme": "light"}'::jsonb
FROM users u 
WHERE u.email = 'patient.test@example.com'
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- DONNÉES DE SANTÉ DE TEST
-- ==============================================================================

-- Données de santé pour le patient de test
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
)
INSERT INTO health_data (user_id, data_type, value, unit, notes, recorded_at)
SELECT 
    p.id,
    'weight',
    75.5,
    'kg',
    'Poids du matin',
    NOW() - INTERVAL '1 day'
FROM patient p

UNION ALL

SELECT 
    p.id,
    'mood',
    8,
    'score',
    'Bonne humeur aujourd''hui',
    NOW() - INTERVAL '2 hours'
FROM patient p

UNION ALL

SELECT 
    p.id,
    'sleep',
    7.5,
    'hours',
    'Nuit reposante',
    NOW() - INTERVAL '1 day'
FROM patient p;

-- ==============================================================================
-- OBJECTIFS DE SANTÉ DE TEST
-- ==============================================================================

-- Objectifs pour le patient de test
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
)
INSERT INTO health_goals (user_id, title, description, target_value, current_value, unit, target_date)
SELECT 
    p.id,
    'Perdre du poids',
    'Objectif de perte de poids progressive',
    70,
    75.5,
    'kg',
    CURRENT_DATE + INTERVAL '3 months'
FROM patient p

UNION ALL

SELECT 
    p.id,
    'Marcher 10000 pas',
    'Objectif quotidien de pas',
    10000,
    6500,
    'pas',
    CURRENT_DATE
FROM patient p;

-- ==============================================================================
-- REPAS DE TEST
-- ==============================================================================

-- Repas enregistrés pour le patient de test
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
)
INSERT INTO meal_records (user_id, meal_name, meal_type, description, calories, recorded_at)
SELECT 
    p.id,
    'Salade de quinoa',
    'déjeuner',
    'Salade composée avec quinoa, légumes frais et vinaigrette légère',
    450,
    NOW() - INTERVAL '3 hours'
FROM patient p

UNION ALL

SELECT 
    p.id,
    'Petit-déjeuner équilibré',
    'petit-déjeuner',
    'Yaourt grec, fruits rouges et granola maison',
    320,
    NOW() - INTERVAL '8 hours'
FROM patient p;

-- ==============================================================================
-- RECOMMANDATIONS IA DE TEST
-- ==============================================================================

-- Recommandations pour le patient de test
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
)
INSERT INTO ai_recommendations (user_id, type, title, content, confidence_score)
SELECT 
    p.id,
    'meal',
    'Hydratation insuffisante',
    'Basé sur vos données, il semble que vous ne buvez pas assez d''eau. Essayez de boire au moins 2 litres par jour.',
    0.85
FROM patient p

UNION ALL

SELECT 
    p.id,
    'health',
    'Améliorer le sommeil',
    'Vos données de sommeil montrent une légère amélioration. Continuez à maintenir une routine de coucher régulière.',
    0.92
FROM patient p;

-- ==============================================================================
-- CONSENTEMENT DE TEST
-- ==============================================================================

-- Consentement entre le patient et le médecin de test
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
),
doctor AS (
    SELECT id FROM users WHERE email = 'docteur.martin@example.com'
)
INSERT INTO consents (patient_id, doctor_id, status, granted_at, notes)
SELECT 
    p.id,
    d.id,
    'granted',
    NOW() - INTERVAL '7 days',
    'Consentement accordé pour le suivi de santé général'
FROM patient p, doctor d
ON CONFLICT (patient_id, doctor_id) DO NOTHING;

-- ==============================================================================
-- SESSION DE CHAT DE TEST
-- ==============================================================================

-- Session de chat entre patient et médecin
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
),
doctor AS (
    SELECT id FROM users WHERE email = 'docteur.martin@example.com'
)
INSERT INTO chat_sessions (patient_id, doctor_id, title, is_ai_session)
SELECT 
    p.id,
    d.id,
    'Consultation de suivi',
    FALSE
FROM patient p, doctor d;

-- Messages de test dans la session
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
),
doctor AS (
    SELECT id FROM users WHERE email = 'docteur.martin@example.com'
)
INSERT INTO chat_messages (sender_id, recipient_id, message_text, created_at)
SELECT 
    p.id,
    d.id,
    'Bonjour Docteur, j''ai une question concernant mes dernières données de sommeil.',
    NOW() - INTERVAL '2 hours'
FROM patient p, doctor d

UNION ALL

SELECT 
    d.id,
    p.id,
    'Bonjour Jean, je vois une amélioration dans vos données. Pouvez-vous me dire comment vous vous sentez ?',
    NOW() - INTERVAL '1 hour'
FROM patient p, doctor d;

-- ==============================================================================
-- SESSION CHATBOT IA DE TEST
-- ==============================================================================

-- Session avec le chatbot IA
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
)
INSERT INTO chat_sessions (patient_id, doctor_id, title, is_ai_session)
SELECT 
    p.id,
    NULL,
    'Assistant IA Santé',
    TRUE
FROM patient p;

-- Messages avec le chatbot
WITH patient AS (
    SELECT id FROM users WHERE email = 'patient.test@example.com'
)
INSERT INTO chat_messages (sender_id, recipient_id, message_text, is_ai_message, ai_context, created_at)
SELECT 
    p.id,
    NULL,
    'Quels sont les bienfaits du quinoa pour la santé ?',
    FALSE,
    '{}',
    NOW() - INTERVAL '30 minutes'
FROM patient p

UNION ALL

SELECT 
    NULL,
    p.id,
    'Le quinoa est un excellent choix nutritionnel ! C''est une source complète de protéines végétales contenant tous les acides aminés essentiels. Il est riche en fibres, magnésium, fer et vitamines B. Il aide à maintenir une glycémie stable grâce à son index glycémique modéré.',
    TRUE,
    '{"confidence": 0.95, "sources": ["nutrition_database"], "generated_at": "2025-06-06"}'::jsonb,
    NOW() - INTERVAL '29 minutes'
FROM patient p;

-- ==============================================================================
-- FIN DES DONNÉES DE TEST
-- ==============================================================================
