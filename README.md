# Goal Tracker - Application Web de Suivi d'Objectifs

Application web React/TypeScript pour le suivi d'objectifs personnels avec animations de progression, gamification et notes quotidiennes.

## 🚀 Stack Technologique

- **Framework:** React 18 + Vite
- **Langage:** TypeScript
- **Routing:** React Router v6
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Base de données:** Supabase (PostgreSQL + Auth + Realtime)
- **Icônes:** Lucide React
- **Date utils:** date-fns
- **UI Components:** Headless UI

## 📦 Installation

1. **Installer les dépendances:**
```bash
npm install
```

2. **Configurer Supabase:**
   - Créer un projet Supabase
   - Exécuter le script SQL dans `supabase/schema.sql`
   - Créer un fichier `.env.local` avec vos credentials:
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_anon_key
   ```

3. **Lancer le serveur de développement:**
```bash
npm run dev
```

4. **Builder pour la production:**
```bash
npm run build
```

## 🗄️ Base de données Supabase

Le schéma SQL complet se trouve dans `supabase/schema.sql`. Il inclut:
- Tables (profiles, categories, subcategories, micro_objectives, etc.)
- Row Level Security (RLS) policies
- Indexes pour la performance

Exécutez ce script dans l'éditeur SQL de Supabase.

## 📁 Structure du Projet

```
/src
├── /pages          # Pages/Routes
├── /components     # Composants React
│   ├── /ui         # Composants UI réutilisables
│   ├── /features   # Composants métier
│   ├── /layout     # Composants de layout
│   └── /animations # Animations de progression
├── /hooks          # Hooks personnalisés
├── /stores         # Stores Zustand
├── /services       # Services (Supabase, calculs)
├── /utils          # Utilitaires
├── /constants      # Constantes
└── /types          # Types TypeScript
```

## ✨ Fonctionnalités

- ✅ Vue quotidienne avec timeline des objectifs
- ✅ Gestion de catégories et sous-catégories
- ✅ Micro-objectifs avec complétion
- ✅ Animations de progression personnalisables
- ✅ Notes quotidiennes contextuelles
- ✅ Calendrier mensuel
- ✅ 3 modes de progression (cumulative, weekly, monthly)
- ✅ Authentification Supabase
- ✅ Responsive design (mobile + desktop)

## 🎨 Modes de Progression

1. **Cumulative:** Objectif cumulatif avec valeur cible (ex: économiser 10 000€)
2. **Weekly:** Objectifs hebdomadaires avec jours planifiés
3. **Monthly:** Objectifs mensuels avec valeur cible

## 📱 Pages

- `/` - Vue quotidienne
- `/goals` - Liste des catégories
- `/category/:id` - Détails d'une catégorie
- `/calendar` - Vue calendrier
- `/settings` - Paramètres
- `/auth` - Authentification

## 🔧 Développement

Le projet utilise Vite pour un développement rapide. Les modifications sont rechargées automatiquement.

Pour le linting:
```bash
npm run lint
```

## 📝 Notes

- Les micro-objectifs DOIVENT être dans une sous-catégorie
- Les Daily Notes sont filtrées automatiquement selon le contexte
- Les animations reflètent la progression RÉELLE (0-100%)
- Le decay se calcule sur 7 jours glissants