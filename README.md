# Mah.ai — Tuteur IA Socratique & Catalogue d'Examens 🇲🇬

**Mah.ai** est une plateforme éducative innovante conçue pour transformer la préparation aux examens (CEPE, BEPC, BACC, Licence, Concours) à Madagascar. Elle combine un catalogue structuré de sujets d'examen avec une Intelligence Artificielle "Socratique" qui guide l'apprenant sans lui donner directement la réponse.

---

## 🌟 Fonctionnalités Clés

### 1. IA Socratique & Sidekick
*   **Tuteur Intelligent** : L'IA analyse le contenu Markdown du sujet pour répondre aux questions des élèves.
*   **Méthode Socratique** : Au lieu de donner la réponse brute, l'IA pose des questions de guidage pour aider l'élève à trouver la solution par lui-même.
*   **Context-Aware** : L'IA connaît exactement la partie du sujet sur laquelle vous travaillez.

### 2. Système de "Grit Score" (Mérite)
*   **Valorisation de l'effort** : Les élèves gagnent des points non pas sur leurs notes, mais sur leur persévérance et leur temps de lecture active.
*   **Gamification** : Système de "streaks" (séries) pour encourager une révision quotidienne.
*   **Ligue de Mérite** : Un classement basé sur la régularité et l'effort fourni.

### 3. Catalogue de Sujets Markdown
*   **Zéro PDF** : Tous les sujets sont convertis en Markdown/HTML pour un affichage ultra-léger et rapide, même sur les connexions 3G/Opera Mini.
*   **Éditeur Collaboratif** : Les contributeurs peuvent éditer les sujets directement sur le site avec un aperçu en temps réel.
*   **Tickets de Demande** : Si un sujet manque, l'utilisateur peut créer un ticket. S'il n'est pas trouvé sous 3 jours, les crédits sont remboursés automatiquement.

### 4. Économie Collaborative
*   **Système de Crédits** : Déblocage de sujets ou de corrections humaines via un portefeuille de crédits.
*   **Rémunération des Auteurs** : Les contributeurs reçoivent 80% des revenus sur leurs sujets, et les correcteurs 85% sur leurs solutions détaillées.
*   **Commissions Site** : Le site prélève une commission minime (15-20%) pour financer l'IA et l'infrastructure.

### 5. Administration & Gouvernance
*   **Multi-rôles** : SuperAdmin, Admin, Validateur, Correcteur, Contributeur et Étudiant.
*   **Flux de Validation** : Chaque sujet déposé par un contributeur passe par un validateur avant d'être publié.
*   **Gestion des Membres** : Outils de blocage, de changement de rôle et de suivi des soldes.

---

## 🚀 Stack Technique

*   **Frontend** : Next.js 16 (App Router), Tailwind CSS 4.
*   **Backend & DB** : Supabase (PostgreSQL, Auth, RLS).
*   **IA** : OpenAI / Perplexity API (avec cache sémantique Redis pour réduire les coûts).
*   **PWA** : Support complet du mode déconnecté et installation sur mobile via Serwist.

---

## 🛠️ Installation & Développement

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build pour la production
npm run build
```

---

## ❤️ Soutenir le Projet
Mah.ai est une initiative qui vise à réduire les inégalités scolaires. Vous pouvez soutenir le projet via des dons (disponibles sur la page d'accueil) pour nous aider à payer les jetons d'IA et les serveurs.

---
© 2025 Mah.ai - Fait avec passion pour la jeunesse malgache.