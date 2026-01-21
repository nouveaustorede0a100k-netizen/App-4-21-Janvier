# Guide de Contribution

Merci pour votre intérêt à contribuer au projet Goal Tracker !

## 🚀 Démarrage rapide

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📋 Standards de code

- Utiliser TypeScript pour tous les nouveaux fichiers
- Suivre les conventions de nommage (PascalCase pour composants, camelCase pour fonctions)
- Ajouter des types TypeScript explicites
- Utiliser ESLint et corriger toutes les erreurs avant de commit

## 🧪 Tests

Avant de soumettre votre PR :
- Vérifier que `npm run build` fonctionne sans erreurs
- Vérifier que `npm run lint` ne retourne pas d'erreurs
- Tester manuellement les fonctionnalités ajoutées/modifiées

## 📝 Structure du projet

- `/src/components/ui` - Composants UI réutilisables
- `/src/components/features` - Composants métier spécifiques
- `/src/pages` - Pages de l'application
- `/src/stores` - Stores Zustand
- `/src/hooks` - Hooks personnalisés
- `/src/services` - Services (API, calculs)

## 🎨 Styling

- Utiliser Tailwind CSS pour tous les styles
- Suivre le design system défini dans `tailwind.config.js`
- Respecter le dark mode pour tous les nouveaux composants

## 📚 Documentation

- Commenter le code complexe
- Mettre à jour le README si nécessaire
- Documenter les nouvelles fonctionnalités