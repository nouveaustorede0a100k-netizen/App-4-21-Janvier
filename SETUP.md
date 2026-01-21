# Guide de Configuration - Goal Tracker

## 📋 Prérequis

- Node.js 20+ 
- npm ou yarn
- Un compte Supabase

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. **Créer un projet Supabase**
   - Aller sur [supabase.com](https://supabase.com)
   - Créer un nouveau projet
   - Notez votre URL et votre anon key

2. **Créer le schéma de base de données**
   - Dans le dashboard Supabase, aller dans "SQL Editor"
   - Copier le contenu de `supabase/schema.sql`
   - Exécuter le script SQL

3. **Configurer les variables d'environnement**
   - Créer un fichier `.env.local` à la racine du projet
   - Ajouter vos credentials Supabase:
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_anon_key
   ```

### 3. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔐 Authentification

L'authentification utilise Supabase Auth. 

Pour créer un compte:
1. Aller sur `/auth`
2. Cliquer sur "Pas de compte ? S'inscrire"
3. Remplir le formulaire

## 📊 Structure de la base de données

Le schéma inclut:
- **profiles** - Informations utilisateur
- **categories** - Catégories d'objectifs
- **subcategories** - Sous-catégories
- **micro_objectives** - Micro-objectifs
- **objective_completions** - Historique des complétions
- **daily_notes** - Notes quotidiennes
- **progress_history** - Historique de progression

Toutes les tables ont Row Level Security (RLS) activé pour la sécurité.

## 🛠️ Commandes disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Builder pour la production
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Lancer ESLint

## 📝 Notes importantes

- Les micro-objectifs doivent toujours être dans une sous-catégorie
- Les notes quotidiennes sont filtrées par contexte (catégorie/date)
- Les animations reflètent la progression réelle (0-100%)
- Le mode dark est supporté automatiquement

## 🐛 Dépannage

**Erreur "Missing Supabase environment variables"**
- Vérifiez que `.env.local` existe et contient les bonnes variables
- Redémarrez le serveur de développement

**Erreurs d'authentification**
- Vérifiez que le RLS est bien configuré dans Supabase
- Vérifiez que les policies sont créées pour toutes les tables

**Erreurs de build TypeScript**
- Vérifiez que tous les imports sont corrects
- Exécutez `npm run lint` pour voir les erreurs