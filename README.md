# Mah.ai

Plateforme d'apprentissage assistée par IA (tuteur socratique) pour préparer les examens, avec parcours personnalisés, sujets corrigés et communauté.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Supabase (auth + data)
- Serwist (PWA/service worker)
- Zustand, Zod

## Démarrage rapide

1. Installer les dépendances

```bash
npm install
```

2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Lancer le dev server

```bash
npm run dev
```

L'app est disponible sur `http://localhost:3000`.

## Scripts

- `npm run dev` : développement
- `npm run build` : build production
- `npm run start` : serveur production
- `npm run lint` : linting

## PWA

Le service worker est généré via Serwist. En mode dev, il est désactivé. En prod, il est généré depuis `src/sw.ts` vers `public/sw.js`.

## Structure (résumé)

- `src/app` : pages et routes (App Router)
- `src/lib/supabase` : clients Supabase
- `src/stores` : stores Zustand
- `public` : assets statiques

## Déploiement

Déployez comme une app Next.js standard (Vercel, etc.). Assurez-vous que les variables d'environnement Supabase sont définies en production.
