# 🔧 Fix: Erreur "Could not find the 'animation_type' column"

## Problème

L'erreur `Could not find the 'animation_type' column of 'categories'` indique que la colonne `animation_type` n'existe pas dans votre base de données Supabase, même si elle est définie dans le schéma SQL.

## Solution

### Option 1 : Exécuter la migration SQL (Recommandé)

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez SQL Editor**
   - Cliquez sur "SQL Editor" dans la barre latérale

3. **Exécutez la migration**
   - Copiez le contenu de `supabase/migrations/002_add_animation_type_to_categories.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run"

   Ou exécutez directement ce SQL :

```sql
-- Migration: Add animation_type column to categories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'animation_type'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN animation_type TEXT NOT NULL DEFAULT 'progress-bar';
        
        RAISE NOTICE 'Column animation_type added to categories table';
    ELSE
        RAISE NOTICE 'Column animation_type already exists in categories table';
    END IF;
END $$;
```

### Option 2 : Exécuter le schéma complet

Si vous préférez exécuter le schéma complet (attention : cela peut modifier d'autres tables) :

1. **Ouvrez SQL Editor dans Supabase**
2. **Copiez le contenu de `supabase/schema.sql`**
3. **Exécutez-le** (les `CREATE TABLE IF NOT EXISTS` et `ALTER TABLE` sont idempotents)

### Option 3 : Vérifier et ajouter manuellement

1. **Vérifiez si la colonne existe** :
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'categories'
AND column_name = 'animation_type';
```

2. **Si la colonne n'existe pas, ajoutez-la** :
```sql
ALTER TABLE public.categories 
ADD COLUMN animation_type TEXT NOT NULL DEFAULT 'progress-bar';
```

3. **Si la colonne existe mais avec un type différent, modifiez-la** :
```sql
ALTER TABLE public.categories 
ALTER COLUMN animation_type TYPE TEXT,
ALTER COLUMN animation_type SET DEFAULT 'progress-bar';
```

## Vérification

Après avoir exécuté la migration, vérifiez que la colonne existe :

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;
```

Vous devriez voir `animation_type` dans la liste avec :
- `data_type`: `text`
- `is_nullable`: `NO`
- `column_default`: `'progress-bar'`

## Valeurs possibles pour animation_type

Selon le code, les valeurs possibles sont :
- `'progress-bar'` (par défaut)
- `'progress-circle'`
- `'fill-container'`
- `'grow'`

Ces valeurs sont définies dans `src/constants/animations.ts` et `src/types/index.ts`.

## Après la migration

1. **Redémarrez votre application** si elle tourne
2. **Testez la création d'une catégorie** pour vérifier que l'erreur est résolue
3. **Vérifiez les catégories existantes** - elles devraient toutes avoir `animation_type = 'progress-bar'` par défaut

## Si l'erreur persiste

1. **Vérifiez le cache** : Redémarrez complètement votre application
2. **Vérifiez les permissions RLS** : Assurez-vous que les policies RLS permettent la lecture/écriture de cette colonne
3. **Vérifiez les logs Supabase** : Regardez les logs dans Supabase Dashboard pour voir les erreurs détaillées

## Notes importantes

- La migration est **idempotente** : vous pouvez l'exécuter plusieurs fois sans problème
- Les catégories existantes recevront automatiquement la valeur par défaut `'progress-bar'`
- Cette colonne est **requise** (NOT NULL) avec une valeur par défaut, donc aucune catégorie ne sera en erreur
