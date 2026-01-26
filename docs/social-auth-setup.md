# Configuration de l'Authentification Sociale (Google)

## Étapes de Configuration

### 1. Configuration Supabase

1. Allez dans votre dashboard Supabase
2. Navigation : `Authentication` → `Providers`
3. Activez le fournisseur Google

### 2. Configuration Google OAuth

1. Créez un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activez l'API Google+ :
   - `APIs & Services` → `Library` → `Google+ API`
3. Configurez l'écran de consentement OAuth :
   - `APIs & Services` → `OAuth consent screen`
   - Choisissez `External` et remplissez les informations
4. Créez des identifiants OAuth :
   - `APIs & Services` → `Credentials` → `Create Credentials` → `OAuth client ID`
   - Type : `Web application`
   - URLs de redirection autorisées :
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```

### 3. Variables d'Environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Supabase (déjà existantes)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OAuth (optionnelles, Supabase les gère automatiquement)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Configuration dans Supabase

Dans votre dashboard Supabase, allez dans `Settings` → `API` → `Auth Settings` :

**Pour Google :**
- Activez `Google provider`
- Ajoutez votre `Client ID` et `Client Secret`
- URL de redirection : `https://your-project.supabase.co/auth/v1/callback`

## Fonctionnalités Implémentées

### Bouton d'Auth Sociale
- Bouton stylisé pour Google
- Gestion des états de chargement
- Messages d'erreur personnalisés
- Support du mode sombre/clair

### Flux d'Authentification
1. Utilisateur clique sur "Continuer avec Google"
2. Redirection vers le fournisseur OAuth
3. Authentification réussie → redirection vers `/auth/callback`
4. Le middleware traite la session et redirige vers `/dashboard`

### Gestion des Erreurs
- Erreurs de configuration fournisseur
- Erreurs d'authentification OAuth
- Messages d'erreur en français

### Sécurité
- Utilisation de `signInWithOAuth` de Supabase
- Validation des tokens côté serveur
- Middleware pour protéger les routes

## Test de l'Authentification

1. Démarrez votre application : `npm run dev`
2. Allez sur `http://localhost:3000/auth`
3. Cliquez sur "Continuer avec Google"
4. Suivez le flux d'authentification
5. Vérifiez la redirection vers le dashboard

## Dépannage

### Erreur "Provider not enabled"
- Vérifiez que le fournisseur Google est activé dans Supabase
- Vérifiez les identifiants OAuth sont corrects

### Erreur de redirection
- Vérifiez que l'URL de redirection correspond exactement
- Assurez-vous que le domaine est ajouté dans la configuration OAuth

### Erreur "Invalid login credentials"
- Les identifiants OAuth sont incorrects ou expirés
- Vérifiez la configuration dans Google Cloud Console

## Personnalisation

### Styles
Le bouton Google peut être personnalisé dans `src/components/auth/social-auth-buttons.tsx`

### Messages d'erreur
Les messages peuvent être modifiés dans la fonction `handleSocialAuth`

### Redirections
Les URLs de redirection peuvent être modifiées dans :
- `src/app/auth/callback/route.ts`
- `src/middleware.ts`
