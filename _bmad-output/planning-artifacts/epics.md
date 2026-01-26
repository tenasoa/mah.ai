---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/project-context.md
---

# mah.ai - Epic Breakdown (Pure Markdown Architecture)

## Requirements Inventory

### Functional Requirements

FR1: Inscription simplifiée avec numéro de téléphone unique (OTP SMS).
FR2: Connexion par OTP (SMS) ou mot de passe.
FR3: Profil basique (Pseudo, Lycée, Classe).
FR4: Recherche/Filtrage des sujets (Année, Série, Matière).
FR6: Déblocage de sujet à l'unité ou activation de Pass Temps.
FR7: Lecteur Zen HTML : Affichage natif et responsive du contenu Markdown.
FR8: IA Contextuelle : L'IA analyse le texte Markdown du sujet pour répondre.
FR9: IA Socratique : Fournit guide/indice, refuse la réponse directe immédiate.
FR10: Attribution de "Points de Mérite" (Grit Score) pour l'effort.
FR11: Déclaration manuelle de paiement (Saisie code ref SMS).
FR12: Accès "Confiance" immédiat (1h) post-saisie.
FR13: Validation/Révocation a posteriori par admin/script.
FR14: Édition Markdown : Interface d'édition avec Split View et synchronisation.
FR15: Modération assistée par IA ("Janitor" local) des commentaires.
FR16: Notifications de rappel et de réponses (Push/In-app).

## Epic List

### Epic 1: Fondation & Accès "Trust-First"
Établir le socle technique, l'authentification et le flux de paiement optimiste.
**Status:** In Progress

### Epic 2: Dashboard Bento & Exploration
Offrir une navigation instantanée via l'interface Bento.
**Status:** Completed

### Epic 3: Zen Reader & Socratic AI (Markdown)
Interface de lecture HTML et tutorat IA basé sur le texte structuré.
**Status:** Completed

### Epic 4: Ligue Grit & Gamification
Valoriser l'effort et la régularité via le Grit Score et les récompenses.
**Status:** Completed

### Epic 5: Gestion du Savoir (Admin & Editor)
Interface d'édition Markdown professionnelle pour les contributeurs et analyse stratégique.
**Status:** Completed

---

## Epic 1: Fondation & Accès "Trust-First"

### Story 1.1: Initialisation du Projet & PWA
Status: Completed
As a Développeur, I want initialiser le projet avec Next.js 16+, Tailwind 4 et Supabase.

### Story 1.4: Paiement "Confiance" (Optimistic UI)
Status: Completed
As a Élève, I want saisir mon code Mobile Money et accéder immédiatement au contenu.

---

## Epic 3: Zen Reader & Socratic AI (Markdown)

### Story 3.1: Lecteur Zen HTML
Status: Completed
As a Élève, I want lire mon sujet dans une interface HTML épurée avec support mathématique.

### Story 3.2: Sidekick IA Contextuel
Status: Completed
As a Élève, I want poser des questions à l'IA qui connaît déjà le texte de mon sujet.

### Story 3.4: Cache Sémantique Intelligent
Status: Completed
As a Développeur, I want que les réponses de l'IA soient mises en cache dans Redis (Upstash).

---

## Epic 4: Ligue Grit & Gamification
Valoriser l'effort et la régularité via le Grit Score et les récompenses.
**Status:** Completed

---

## Epic 5: Gestion du Savoir (Admin & Editor)

### Story 5.1: Éditeur Markdown "StackEdit Style"
Status: Completed
As a Administrateur, I want éditer les sujets avec un aperçu scindé et scroll synchronisé.

### Story 5.2: Gestion Administrative des Sujets
Status: Completed
As a Administrateur, I want créer et lister les sujets via une interface dédiée.

### Story 5.3: Tableau de Bord Analytics "Trust Gap"
Status: Completed
As a Administrateur, I want visualiser le taux d'utilisation réelle vs les paiements validés.
**Acceptance Criteria:**
- Calcul en temps réel du Trust Gap Index.
- Visualisation des revenus et de la conversion.
- Note stratégique pour l'ajustement du modèle de confiance.