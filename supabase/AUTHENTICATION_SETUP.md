# Configuration Authentification Supabase

## Problème résolu

L'authentification ne fonctionnait pas car :
1. Aucun profil n'était créé automatiquement quand un utilisateur vérifiait son email
2. Le code ne gérait pas le cas où le profil manquait à la connexion

## Solution implémentée

### 1. Trigger automatique (OBLIGATOIRE)

Un trigger PostgreSQL a été ajouté pour créer automatiquement un profil dans `public.profiles` quand un utilisateur est créé dans `auth.users`.

**À exécuter dans Supabase SQL Editor :**

```sql
-- Function to handle new user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, settings)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    '{"showProgressLabels": true, "enableAnimations": true, "levelSystemEnabled": false, "celebrationEffectsEnabled": true}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Améliorations du code

- **signUp()** : Le nom est maintenant passé via `options.data` pour être stocké dans `raw_user_meta_data`
- **fetchUser()** : Crée automatiquement un profil si il n'existe pas (fallback de sécurité)
- **ProtectedRoute** : Meilleure gestion d'erreur avec retry automatique

## Étapes pour mettre à jour Supabase

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Exécuter le script SQL**
   - Cliquez sur "SQL Editor" dans la barre latérale
   - Copiez le contenu de `supabase/migrations/001_auto_create_profiles.sql`
   - Ou copiez le SQL ci-dessus
   - Cliquez sur "Run"

3. **Vérifier que le trigger est créé**
   - Dans SQL Editor, exécutez :
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
   - Vous devriez voir une ligne avec `on_auth_user_created`

## Test de l'authentification

1. Créez un nouveau compte avec un email valide
2. Vérifiez votre email (cliquez sur le lien de confirmation)
3. Connectez-vous avec votre email et mot de passe
4. Le profil devrait être créé automatiquement

## Cas existants (utilisateurs déjà créés)

Si vous avez déjà des utilisateurs dans `auth.users` sans profil dans `public.profiles`, vous pouvez créer leurs profils avec :

```sql
INSERT INTO public.profiles (id, name, settings)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', email, 'Utilisateur'),
  '{"showProgressLabels": true, "enableAnimations": true, "levelSystemEnabled": false, "celebrationEffectsEnabled": true}'::jsonb
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

## Vérification

Pour vérifier que tout fonctionne :

```sql
-- Voir tous les utilisateurs et leurs profils
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
```

Tous les utilisateurs devraient avoir un profil correspondant.