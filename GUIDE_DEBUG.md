# Guide de Débogage - Authentification

## 🎯 Problème
L'authentification ne fonctionne pas après avoir validé votre email.

## ✅ Vérifications à faire AVANT de tester

### 1. Vérifier que le fichier `.env.local` existe

Créez un fichier `.env.local` à la racine du projet avec :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

**Où trouver ces valeurs :**
- Dans Supabase Dashboard → Settings → API
- Copiez "Project URL" pour `VITE_SUPABASE_URL`
- Copiez "anon public" key pour `VITE_SUPABASE_ANON_KEY`

### 2. Vérifier que les tables existent dans Supabase

Dans Supabase Dashboard → SQL Editor, exécutez :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Vous devriez voir au moins : `profiles`, `categories`, etc.

**Si les tables n'existent pas :**
- Ouvrez `supabase/schema.sql`
- Copiez TOUT le contenu
- Exécutez-le dans SQL Editor

### 3. Exécuter le trigger pour créer automatiquement les profils

**C'est TRÈS IMPORTANT !** Ce trigger crée automatiquement un profil quand un utilisateur s'inscrit.

Dans Supabase Dashboard → SQL Editor, exécutez le contenu de `supabase/migrations/001_auto_create_profiles.sql` :

```sql
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Vérifier que le trigger existe :**
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

Vous devriez voir une ligne avec `on_auth_user_created`.

### 4. Créer les profils pour les utilisateurs existants

Si vous avez déjà des utilisateurs sans profil, exécutez :
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

## 🧪 Test de l'authentification

### 1. Démarrer l'application

```bash
npm install  # Si ce n'est pas déjà fait
npm run dev
```

L'application devrait démarrer sur `http://localhost:5173`

### 2. Ouvrir la console du navigateur

- **Chrome/Edge :** F12 ou Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)
- **Firefox :** F12 ou Ctrl+Shift+K (Windows) / Cmd+Option+K (Mac)
- Allez dans l'onglet "Console"

### 3. Tester la connexion

1. Allez sur `/auth`
2. Essayez de vous connecter avec votre email et mot de passe
3. **Regardez la console** - vous devriez voir des logs `[DEBUG] ...`

### 4. Que regarder dans la console

**Si tout fonctionne, vous verrez :**
```
[DEBUG] signIn called { email: "..." }
[DEBUG] signInWithPassword result { hasError: false, hasUser: true, ... }
[DEBUG] calling fetchUser { userId: "..." }
[DEBUG] fetchUser called
[DEBUG] getUser result { hasAuthUser: true, ... }
[DEBUG] profile fetch result { hasError: false, hasData: true }
[DEBUG] fetchUser success
```

**Si ça ne fonctionne pas, cherchez les erreurs :**

- **"Missing Supabase environment variables"**
  → Le fichier `.env.local` n'existe pas ou les variables sont mal nommées
  
- **"Invalid login credentials"**
  → L'email ou le mot de passe est incorrect, OU l'email n'a pas été vérifié
  
- **"No rows returned" ou "PGRST116"**
  → Le profil n'existe pas. Le code devrait le créer automatiquement, mais si ça échoue, vérifiez les RLS policies
  
- **"permission denied" ou erreur de permissions**
  → Les RLS policies ne sont pas correctement configurées

## 🔍 Vérifications supplémentaires

### Vérifier que l'email est bien vérifié

Dans Supabase Dashboard → Authentication → Users, trouvez votre utilisateur et vérifiez que :
- L'email est confirmé (colonne "Confirmed")
- Le statut est "Active"

### Vérifier les RLS policies

Dans Supabase Dashboard → Authentication → Policies, vérifiez que les tables ont des policies. Pour `profiles`, vous devriez avoir :

**Policy SELECT :**
```sql
SELECT auth.uid() = id
```

**Policy INSERT :**
```sql
INSERT auth.uid() = id
```

**Policy UPDATE :**
```sql
UPDATE auth.uid() = id
```

## 📝 Informations à me donner

Si ça ne fonctionne toujours pas, copiez-moi :

1. **Les messages d'erreur de la console** (surtout ceux avec `[DEBUG]`)
2. **Le message d'erreur affiché à l'écran** (si il y en a un)
3. **Les résultats de ces requêtes SQL :**
   ```sql
   -- Vérifier utilisateurs et profils
   SELECT 
     u.id,
     u.email,
     u.email_confirmed_at,
     p.name,
     p.created_at as profile_created
   FROM auth.users u
   LEFT JOIN public.profiles p ON u.id = p.id;
   
   -- Vérifier le trigger
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

Avec ces informations, je pourrai identifier précisément le problème !
