/bmad-bmm-workflows-check-implementation-readiness---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/project-context.md
---

# mah.ai - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for mah.ai, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Inscription simplifiée avec numéro de téléphone unique (OTP SMS).
FR2: Connexion par OTP (SMS) ou mot de passe.
FR3: Profil basique (Pseudo, Lycée, Classe).
FR4: Recherche/Filtrage des sujets (Année, Série, Matière).
FR6: Déblocage de sujet à l'unité ou activation de Pass Temps.
FR7: Visionneuse PDF Mobile (Zoom, Scroll fluide).
FR8: Fil de discussion contextuel par question (click-to-ask).
FR9: IA Socratique : Fournit guide/indice, refuse la réponse directe immédiate.
FR10: Attribution de "Points de Mérite" (Grit Score) pour l'effort.
FR11: Déclaration manuelle de paiement (Saisie code ref SMS).
FR12: Accès "Confiance" immédiat (1h) post-saisie.
FR13: Validation/Révocation a posteriori par admin/script (Post-MVP pour l'auto).
FR14: Upload et indexation PDF par l'admin (Dashboard Admin).
FR15: Modération assistée par IA ("Janitor" local) des commentaires.
FR16: Notifications de rappel et de réponses (Push/In-app).

### NonFunctional Requirements

NFR1: Chargement initial < 2s sur réseau 3G (Budget < 500 Ko).
NFR2: Réactivité : Navigation interne instantanée (< 100ms).
NFR3: Disponibilité : 99.9% durant le rush de Mai.
NFR4: Sécurité : Hachage des numéros de téléphone et URLs signées.
NFR5: Protection : Watermarking dynamique CSS (Overlay pseudo).
NFR6: Accessibilité : Mode contraste élevé (Grit Clarity) pour lecture au soleil.
NFR7: PWA Resilience : Offline First (Cache sujets consultés).
NFR8: Cost Efficiency : 90% de Cache Hit sur l'IA (Semantic Cache).

### Additional Requirements

- **Starter Template**: Next.js 14 + Tailwind CSS + Serwist (PWA) + Supabase Gen 2.
- **Naming Convention**: `snake_case` obligatoire pour les données (The Snake Rule).
- **Architecture Flow**: Middleware IA -> Cache Sémantique Redis (Upstash) -> OpenAI.
- **UX Theme**: "Epic Bento Minimaliste" (Sleek dark mode first, vibrants accents).
- **Core Components**: Dashboard Bento, Reader Zen, AI Sidekick (Glassmorphism), Grit Score Progress Visualization.
- **Trust Gap**: State Machine pour le flux de paiement "Confiance" (Optimistic UI).

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

### Epic 1: Fondation & Accès "Trust-First"
Établir le socle technique, l'authentification par OTP et le flux de paiement optimiste basé sur la confiance.
**FRs couverts:** FR1, FR2, FR3, FR11, FR12, FR13.

### Epic 2: Dashboard Bento & Exploration
Offrir une navigation instantanée et séduisante dans le catalogue de sujets via l'interface Bento.
**FRs couverts:** FR4, FR5, FR6.

### Epic 3: Zen Reader & Socratic AI
Transformer les PDF en "Sujets Vivants" avec un tutorat IA socratique et un cache sémantique performant.
**FRs couverts:** FR7, FR8, FR9.

### Epic 4: Ligue Grit & Gamification
Valoriser l'effort et la régularité via le Grit Score et les notifications de rétention.
**FRs couverts:** FR10, FR16.

### Epic 5: Gestion du Savoir (Admin & Janitor)
Permettre l'upload massif de contenus et assurer la modération automatisée des échanges.
**FRs couverts:** FR14, FR15.

## Epic 1: Fondation & Accès "Trust-First"

L'objectif est d'initialiser le projet et de permettre aux élèves d'entrer sur la plateforme avec le moins de friction possible, en utilisant le flux de paiement "Zéro Friction".

### Story 1.1: Initialisation du Projet & PWA
Status: Completed
As a Développeur,
I want initialiser le projet avec Next.js 14, Tailwind CSS, Serwist (PWA) et Supabase,
So that j'ai une base solide respectant les contraintes de performance et d'offline-first.

**Acceptance Criteria:**
- **Given** Un répertoire de projet vide.
- **When** J'exécute la commande de création et configure Serwist.
- **Then** La page d'accueil s'affiche sur `localhost:3000`.
- **And** Le fichier `manifest.json` est valide et l'app est "installable".
- **And** Les types TypeScript sont générés depuis le schéma Supabase.

### Story 1.2: Authentification OTP SMS
Status: On Hold (Pending External SMS Provider Configuration)
As a Élève,
I want m'inscrire ou me connecter uniquement avec mon numéro de téléphone,
So that je n'ai pas de mot de passe à mémoriser dans un moment de stress.

**Acceptance Criteria:**
- **Given** Un utilisateur sur la page de login.
- **When** Il saisit son numéro de téléphone malgache.
- **Then** Il reçoit un code OTP (simulé ou réel via Supabase Auth).
- **And** Une fois le code validé, il est redirigé vers son Dashboard.

### Story 1.3: Gestion du Profil Élève
Status: Completed
As a Élève connecté,
I want renseigner mon Pseudo, mon Lycée et ma Série,
So that mes points Grit me soient attribués et que je puisse me comparer aux autres élèves de ma série.

**Acceptance Criteria:**
- **Given** Un utilisateur nouvellement inscrit.
- **When** Il remplit le formulaire de profil (Pseudo, Lycée, Série).
- **Then** Les données sont sauvegardées en `snake_case` dans la table `profiles` de Supabase.
- **And** L'utilisateur est bloqué tant que le profil n'est pas complet (sauf PSEUDO optionnel).

### Story 1.4: Paiement "Confiance" (Optimistic UI)
As a Élève,
I want saisir mon code de transfert Mobile Money et accéder immédiatement à mon contenu,
So that je n'ai pas à attendre qu'un humain valide mon paiement pour débloquer ma révision.

**Acceptance Criteria:**
- **Given** Un sujet verrouillé.
- **When** L'élève saisit un code de référence de 10 caractères.
- **Then** L'accès est marqué comme "TRUSTED" localement via Zustand (State Machine).
- **And** Le sujet se débloque instantanément pour une durée de 1h.
- **And** Une transaction est créée dans Supabase avec le statut `pending_trust`.

### Story 1.5: Dashboard de Validation Admin
As a Administrateur,
I want voir la liste des codes "Trusted" et les valider ou les révoquer,
So that je peux confirmer les vrais paiements et bannir les fraudeurs.

**Acceptance Criteria:**
- **Given** Un admin sur l'interface /admin/payments.
- **When** Il clique sur "Valider" pour un code de référence.
- **Then** Le statut passe à `confirmed` et l'accès devient permanent pour la durée achetée.
- **And** Si révoqué, l'accès est immédiatement coupé via les politiques RLS de Supabase.

## Epic 2: Dashboard Bento & Exploration

L'objectif est d'offrir une expérience de navigation premium et fluide, permettant de trouver n'importe quel sujet en moins de 30 secondes.

### Story 2.1: Interface Bento Responsive
As a Élève,
I want naviguer sur une grille "Bento" élégante et organisée,
So that je puisse identifier mes priorités de révision d'un seul coup d'œil.

**Acceptance Criteria:**
- **Given** Un élève sur le dashboard.
- **When** La page se charge.
- **Then** Les matières s'affichent sous forme de tuiles de tailles variées (système de grille asymétrique).
- **And** Le design suit les tokens "Epic Bento Minimaliste" (ombres portées douces, coins arrondis R3).
- **And** La mise en page est optimisée pour mobile (stack vertical fluide) et s'adapte sur desktop.

### Story 2.2: Moteur de Recherche Instantané
As a Élève,
I want filtrer les sujets par Année, Série et Matière,
So that je ne perde pas de temps à scroller pour trouver le BACC 2024 de Physique.

**Acceptance Criteria:**
- **Given** L'interface de recherche ouverte.
- **When** Je sélectionne une série (ex: D) et une matière.
- **Then** Les résultats se mettent à jour instantanément (< 100ms).
- **And** Le système utilise la recherche plein texte (FTS) de PostgreSQL/Supabase pour la performance.

### Story 2.3: Teaser Hybride (SEO/UX)
As a Utilisateur non-connecté,
I want voir un aperçu du sujet (3 premières questions claires, le reste flouté),
So that je sois convaincu de la qualité avant de m'inscrire ou de payer.

**Acceptance Criteria:**
- **Given** Une page sujet publique.
- **When** Je n'ai pas les droits d'accès.
- **Then** Une version "Teaser" du PDF est affichée (via overlay CSS ou génération d'image côté serveur).
- **And** Le texte des 3 premières questions est lisible par les moteurs de recherche (SEO).
- **And** Un bouton proéminent "Débloquer le sujet complet" est affiché.

### Story 2.4: Système de Crédits / Déblocage
As a Élève,
I want débloquer un sujet à l'unité ou activer un pass temporaire,
So that j'ai le plein accès au contenu protégé.

**Acceptance Criteria:**
- **Given** Un sujet verrouillé.
- **When** J'utilise un "Pass de déblocage" disponible sur mon compte.
- **Then** L'accès est enregistré dans la table `user_access` avec une date d'expiration.
- **And** La visionneuse PDF se débloque instantanément sans recharger la page.

## Epic 3: Zen Reader & Socratic AI

L'objectif est de transformer la lecture passive d'un PDF en un dialogue interactif et pédagogique, tout en optimisant les coûts d'IA.

### Story 3.1: Visionneuse PDF Zen
As a Élève,
I want lire mon sujet PDF dans une interface épurée et fluide,
So that je puisse me concentrer totalement sur mes exercices sans distractions.

**Acceptance Criteria:**
- **Given** Un sujet débloqué.
- **When** L'élève ouvre le sujet.
- **Then** Le PDF s'affiche en plein écran dans un lecteur optimisé pour mobile.
- **And** Les contrôles (zoom, recherche texte) sont discrets et s'effacent lors du scroll.
- **And** Un bouton "Sidekick IA" reste accessible dans un coin de l'écran (Glassmorphism).

### Story 3.2: Interaction "Click-to-Ask"
As a Élève,
I want cliquer sur une zone ou une question du PDF pour poser une question à l'IA,
So that l'IA comprenne immédiatement le contexte de mon blocage.

**Acceptance Criteria:**
- **Given** Le lecteur PDF ouvert.
- **When** J'effectue un appui long ou je clique sur une zone de texte.
- **Then** Une bulle de sélection apparaît pour confirmer la question.
- **And** L'ID de la question ou les coordonnées de la zone sont envoyés avec la requête IA.

### Story 3.3: Tuteur IA Socratique
As a Élève,
I want que l'IA me donne des indices au lieu de la solution directe,
So that je développe mes propres capacités de raisonnement nécessaires pour l'examen.

**Acceptance Criteria:**
- **Given** Une question posée sur un concept ("C'est quoi la force nucléaire forte ?").
- **When** L'IA génère la réponse.
- **Then** La réponse utilise une méthode socratique (questions en retour, indices progressifs).
- **And** Le ton est "Warm Intelligence" : encourageant, clair et pédagogique.
- **And** Si l'élève insiste pour la réponse brute, l'IA explique l'intérêt pédagogique de ne pas la donner tout de suite.

### Story 3.4: Cache Sémantique Intelligent
As a Développeur,
I want que les réponses IA soient mises en cache par sujet et par question,
So that nous puissions réduire les coûts d'API et offrir des réponses instantanées aux questions récurrentes.

**Acceptance Criteria:**
- **Given** Une requête vers l'API IA.
- **When** Le middleware vérifie dans Redis (Upstash) avec un hash (SubjectID + QuestionID).
- **Then** Si un "Hit" existe, la réponse est renvoyée en < 50ms sans appeler OpenAI.
- **And** Si un "Miss" survient, la nouvelle réponse est stockée dans Redis après génération.
- **And** Le système de cache est transparent pour l'utilisateur final.

## Epic 4: Ligue Grit & Gamification

L'objectif est d'utiliser les mécanismes du jeu pour encourager la régularité et l'effort intellectuel à long terme.

### Story 4.1: Algorithme du Grit Score
As a Système,
I want calculer des points basés sur le temps de lecture active et la pertinence des questions posées à l'IA,
So that je puisse récompenser l'effort réel plutôt que la simple réussite.

**Acceptance Criteria:**
- **Given** Un élève étudiant un sujet.
- **When** Le système détecte 5 minutes de lecture active ou une interaction socratique réussie.
- **Then** Le score de Grit est incrémenté dans Supabase (`grit_points`).
- **And** Le multiplicateur de score augmente si l'élève est présent plusieurs jours d'affilée.

### Story 4.2: Visualisation de Progression (Grit Ring)
As a Élève,
I want voir mes gains de points de manière spectaculaire (animations, compteurs fluides),
So that je ressente une satisfaction immédiate après chaque session de travail.

**Acceptance Criteria:**
- **Given** Un gain de points enregistré.
- **When** L'élève retourne sur le Dashboard.
- **Then** Le cercle de progression "Grit Ring" s'anime visuellement.
- **And** Les chiffres du score global défilent jusqu'à la nouvelle valeur.
- **And** Une micro-célébration (effet visuel discret) se déclenche lors du passage d'un palier.

### Story 4.4: Notifications de Rétention
As a Élève,
I want recevoir des rappels motivants et des alertes quand l'IA répond à une de mes questions,
So that je reste engagé dans mon parcours de révision quotidien.

**Acceptance Criteria:**
- **Given** Une absence de l'élève pendant 48h.
- **When** Le système de notification se déclenche.
- **Then** Une notification push ou in-app est envoyée : "Ton Grit Score baisse ! Viens consolider tes acquis sur la Physique-Chimie."
- **And** L'utilisateur peut désactiver ces notifications dans son profil.

### Story 4.5: Classement des Ligues (Anonymisé)
As a Élève,
I want voir ma position par rapport aux autres élèves de ma série,
So that l'esprit de compétition saine m'incite à travailler davantage.

**Acceptance Criteria:**
- **Given** La page de classement ouverte.
- **When** Je sélectionne ma série (ex: A2).
- **Then** Je vois mon rang basé sur mon Grit Score hebdomadaire.
- **And** Les autres élèves sont affichés par leur Pseudo pour préserver l'anonymat.
- **And** Je reçois un badge visuel si je suis dans le Top 10% de la semaine.

## Epic 5: Gestion du Savoir (Admin & Janitor)

L'objectif est d'assurer la pérennité et la qualité des contenus de la plateforme tout en minimisant la charge de modération humaine.

### Story 5.1: Interface d'Upload PDF Admin
As a Administrateur,
I want uploader et indexer facilement de nouveaux sujets BACC,
So that le catalogue reste à jour et complet.

**Acceptance Criteria:**
- **Given** Un administrateur sur /admin/upload.
- **When** Il uploade un fichier PDF et saisit les métadonnées (Année, Série, Matière).
- **Then** Le fichier est stocké dans Supabase Storage.
- **And** Une entrée est créée dans la table `subjects` avec toutes les métadonnées associées.
- **And** Une confirmation de succès est affichée.

### Story 5.2: IA Janitor (Modération Automatique)
As a Administrateur,
I want que les interactions sociales soient modérées par une IA,
So that la plateforme reste un environnement d'apprentissage sain (Zen Garden).

**Acceptance Criteria:**
- **Given** Un élève postant une question ou un commentaire.
- **When** Le contenu contient des insultes, du spam ou est hors-sujet.
- **Then** L'IA Janitor (via un hook Supabase ou Edge Function) masque le message.
- **And** Les messages purement de remerciement sont automatiquement convertis en "Likes" pour éviter de polluer le flux de discussion.
- **And** L'admin reçoit un rapport quotidien des interventions de l'IA.

### Story 5.3: Tableau de Bord Analytics "Trust Gap"
As a Administrateur,
I want visualiser le taux d'utilisation réelle vs les paiements validés,
So that je puisse ajuster le niveau de confiance du système de paiement.

**Acceptance Criteria:**
- **Given** L'écran Analytic Admin.
- **When** L'admin consulte les statistiques.
- **Then** Le système affiche le nombre d'accès "Trusted" qui n'ont jamais été suivis d'un vrai paiement (Trust Gap Index).
- **And** Le système liste les sujets les plus populaires pour orienter les futurs uploads.
- **And** Les données sont présentées sous forme de graphiques simples (Bento Style).
