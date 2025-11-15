# 🚀 Frontend GuinéeAvicole

## Description

Interface utilisateur React pour la plateforme GuinéeAvicole, permettant aux utilisateurs de naviguer, acheter des produits avicoles et gérer leurs comptes.

## 🛠️ Technologies

- **React 18** - Bibliothèque UI
- **Vite** - Outil de build et développement
- **React Router DOM** - Navigation entre pages
- **React Query** - Gestion des données et cache
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes
- **Axios** - Client HTTP

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Layout.jsx      # Layout principal avec header/footer
│   └── ProtectedRoute.jsx # Protection des routes
├── contexts/           # Contextes React
│   └── AuthContext.jsx # Gestion de l'authentification
├── pages/              # Pages de l'application
│   ├── Home.jsx        # Page d'accueil
│   ├── Login.jsx       # Connexion
│   ├── Register.jsx    # Inscription
│   ├── Products.jsx    # Catalogue des produits
│   ├── ProductDetail.jsx # Détail d'un produit
│   ├── Cart.jsx        # Panier d'achat
│   ├── Checkout.jsx    # Finalisation de commande
│   ├── Profile.jsx     # Profil utilisateur
│   └── Dashboard.jsx   # Tableau de bord producteur
├── services/           # Services API
│   └── api.js         # Configuration Axios et services
├── App.jsx            # Composant principal
├── main.jsx           # Point d'entrée
└── index.css          # Styles globaux
```

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 16+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Lancer les tests
npm run test
```

## 🌐 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement (port 3000)
- `npm run build` - Crée un build de production
- `npm run preview` - Prévisualise le build de production
- `npm run test` - Lance les tests avec Vitest
- `npm run lint` - Vérifie le code avec ESLint

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GuinéeAvicole
```

### Configuration Vite

Le fichier `vite.config.js` configure :

- Plugin React
- Proxy API vers le backend
- Configuration des tests
- Port de développement

## 📱 Pages Disponibles

### Publiques

- **Accueil** (`/`) - Présentation de la plateforme
- **Produits** (`/products`) - Catalogue avec filtres
- **Détail Produit** (`/products/:id`) - Informations détaillées
- **Connexion** (`/login`) - Authentification
- **Inscription** (`/register`) - Création de compte

### Protégées (Authentification requise)

- **Panier** (`/cart`) - Gestion du panier d'achat
- **Checkout** (`/checkout`) - Finalisation de commande
- **Profil** (`/profile`) - Gestion du profil utilisateur
- **Dashboard** (`/dashboard`) - Tableau de bord producteur

## 🔐 Authentification

L'application utilise un système d'authentification JWT avec :

- **Connexion** : Email + mot de passe
- **Inscription** : Formulaire complet avec validation
- **Protection des routes** : Composant `ProtectedRoute`
- **Gestion des tokens** : Stockage local + refresh automatique
- **Rôles utilisateur** : Client, Producteur, Admin

## 🎨 Interface Utilisateur

### Design System

- **Couleurs** : Palette verte (agriculture) avec accents bleus
- **Typographie** : Inter (Google Fonts)
- **Composants** : Design moderne avec ombres et arrondis
- **Responsive** : Mobile-first avec breakpoints Tailwind

### Composants Principaux

- **Header** : Navigation + actions utilisateur
- **Layout** : Structure commune à toutes les pages
- **Formulaires** : Validation côté client + gestion d'erreurs
- **Cartes** : Affichage des produits et informations

## 📊 Gestion des Données

### React Query

- **Cache intelligent** des données API
- **Synchronisation automatique** en arrière-plan
- **Gestion des états** de chargement et d'erreur
- **Optimistic updates** pour une UX fluide

### Services API

- **Configuration centralisée** Axios
- **Intercepteurs** pour tokens et erreurs
- **Services spécialisés** par domaine métier
- **Gestion des erreurs** globale

## 🧪 Tests

### Configuration

- **Vitest** comme runner de tests
- **React Testing Library** pour les composants
- **JSDOM** pour l'environnement DOM

### Exécution

```bash
# Tests en mode watch
npm run test

# Tests avec couverture
npm run test -- --coverage

# Tests en mode CI
npm run test -- --run
```

## 🚀 Déploiement

### Build de Production

```bash
npm run build
```

### Serveur Web

Le build génère des fichiers statiques dans `dist/` qui peuvent être servis par :

- Nginx
- Apache
- Serveur statique (serve, http-server)
- CDN (Cloudflare, AWS CloudFront)

### Variables d'Environnement de Production

```env
VITE_API_URL=https://api.guineeavicole.com
VITE_APP_NAME=GuinéeAvicole
```

## 🔧 Développement

### Ajout d'une Nouvelle Page

1. Créer le composant dans `src/pages/`
2. Ajouter la route dans `src/App.jsx`
3. Mettre à jour la navigation si nécessaire

### Ajout d'un Nouveau Composant

1. Créer le fichier dans `src/components/`
2. Importer et utiliser dans les pages
3. Ajouter les tests si nécessaire

### Styles

- Utiliser les classes Tailwind CSS
- Créer des composants personnalisés si besoin
- Respecter la palette de couleurs définie

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Documentation React Query](https://tanstack.com/query/latest)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation API

---

**GuinéeAvicole Frontend** - Développé avec ❤️ pour l'aviculture guinéenne
