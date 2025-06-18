-- Fonction RPC pour créer un profil utilisateur avec gestion des permissions
-- Date: 2025-06-18

CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_role user_role DEFAULT 'patient'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data JSON;
  new_user users%ROWTYPE;
BEGIN
  -- Vérifier que l'utilisateur authentifié correspond à l'ID fourni
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  IF auth.uid() != p_id THEN
    RAISE EXCEPTION 'Accès non autorisé - ID utilisateur ne correspond pas';
  END IF;
  
  -- Vérifier si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM users WHERE id = p_id) THEN
    RAISE EXCEPTION 'L''utilisateur existe déjà';
  END IF;
  
  -- Insérer le nouveau profil utilisateur
  INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_id,
    p_email,
    p_first_name,
    p_last_name,
    p_role,
    NOW(),
    NOW()
  ) RETURNING * INTO new_user;
  
  -- Retourner le profil créé en JSON
  SELECT row_to_json(new_user) INTO result_data;
  
  RETURN result_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la création du profil: %', SQLERRM;
END;
$$;

-- Accorder les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, user_role) TO authenticated;
