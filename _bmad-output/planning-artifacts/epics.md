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
Interface d'édition Markdown professionnelle pour les contributeurs.
**Status:** Completed

---

## Epic 4: Ligue Grit & Gamification

### Story 4.1: Moteur de Score Grit
Status: Completed
As a Système, I want calculer des points basés sur le temps de lecture et l'interaction IA.

### Story 4.2: Visualisation de Progression
Status: Completed
As a Élève, I want voir mes gains de points s'animer en temps réel sur mon Dashboard.

### Story 4.3: Système de Badges et Succès
Status: Completed
As a Élève, I want débloquer des trophées visuels (ex: Oiseau de Nuit, Pionnier).

### Story 4.4: Notifications de Rétention
Status: Completed
As a Élève, I want recevoir des messages motivants pour maintenir mon effort.

### Story 4.5: Classement National (Leaderboard)
Status: Completed
As a Élève, I want voir ma position dans la ligue par rapport aux autres apprenants.

---

## Epic 5: Gestion du Savoir (Admin & Editor)

### Story 5.1: Éditeur Markdown "StackEdit Style"
Status: Completed
As a Administrateur, I want éditer les sujets avec un aperçu scindé et scroll synchronisé.

### Story 5.2: Gestion Administrative des Sujets
Status: Completed
As a Administrateur, I want créer et lister les sujets via une interface dédiée.