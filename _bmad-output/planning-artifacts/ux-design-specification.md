---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/project-context.md
  - _bmad-output/analysis/mah-ai-master-plan.md
  - _bmad-output/analysis/brainstorming-session-2026-01-21.md
---

# UX Design Specification mah.ai

**Author:** Tenasoa
**Date:** 2026-01-22

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

mah.ai est une plateforme communautaire d'excellence académique conçue pour transformer l'apprentissage à Madagascar. En mettant l'accent sur la persévérance (Grit) et en offrant une expérience PWA ultra-rapide et décentralisée, elle vise à rendre l'éducation de haut niveau accessible, motivante et centrée sur l'humain.

### Target Users

- **L'Élève Aspirant** : Motivé par les défis, il cherche des outils clairs pour maîtriser ses sujets et aime voir son effort récompensé par des métriques tangibles (Grit/Success).
- **Le Parent Facilitateur** : Veut voir la progression réelle et la sécurité de l'environnement d'apprentissage.
- **La Communauté d'Excellence** : Mentors et pairs qui interagissent pour renforcer les connaissances.

### Key Design Challenges

- **Le Trust-First Onboarding** : Rendre l'entrée dans l'application instantanée tout en incitant à une authentification sécurisée sans friction.
- **La résilience PWA** : Maintenir une UX fluide et cohérente même en cas de réseau instable, avec des feedbacks clairs sur l'état de synchronisation.
- **La Hiérarchie de l'Information** : Gérer les 10 matières et les multiples types de contenus (PDF, Chat AI, Examens) sans surcharger l'utilisateur.

### Design Opportunities

- **Gamification de la Persévérance** : Faire du "Grit Score" l'élément central de l'identité de l'élève, valorisant le travail autant que la réussite.
- **Assistant IA Contextuel** : Intégrer l'IA non pas comme un outil externe, mais comme un tuteur bienveillant présent aux moments clés (blocages, fin d'examen).

## Core User Experience

### Defining Experience

L'expérience mah.ai est centrée sur le cycle "Apprendre, Questionner, Persévérer". L'interaction clé est la transition fluide entre la lecture de cours (PDF/Texte) et l'assistance intelligente (Chat AI), permettant de transformer la frustration face à un concept difficile en une victoire académique immédiate.

### Platform Strategy

- **PWA Responsive** : Optimisée pour le mobile, fluide sur desktop.
- **Offline Resilience** : Capacité de lire et de synchroniser les progrès (Grit/Success) sans connexion stable.
- **Micro-interactions tactiles** : Navigation intuitive par gestes pour le passage entre les matières et les leçons.

### Effortless Interactions

- **Navigation "Zero-Barrier"** : Accès direct aux matières dès l'ouverture de l'application sans authentification préalable.
- **Feedback de Score Automatique** : Calcul et affichage du Grit Score en temps réel sans intervention manuelle de l'utilisateur.
- **Recherche Sémantique** : Trouver un concept au sein de 10 matières différentes instantanément.

### Critical Success Moments

- **La première victoire assistée** : Réussir un quiz après avoir posé une question au Chat AI.
- **La Persévérance Visuelle** : Voir son "Grit Score" débloquer un succès symbolique après une longue session.
- **L'Authentification Fluide** : Synchronisation instantanée du profil après la saisie de l'OTP, renforçant la confiance.

### Experience Principles

- **Trust-First UI** : L'interface se déverrouille et réagit avant même la confirmation serveur.
- **Human-Centric AI** : L'IA parle comme un tuteur solidaire, pas comme une machine.
- **Grit as Currency** : L'effort fourni est la métrique la plus valorisée visuellement dans l'interface.
- **Contextual Simplicity** : N'afficher que ce qui est nécessaire au moment présent pour minimiser la charge cognitive.

## Desired Emotional Response

### Primary Emotional Goals

- **Empowered & Capable** : L'utilisateur doit ressentir qu'aucune matière n'est hors de portée avec le bon effort et le bon tuteur.
- **Calm Focus** : Une atmosphère de concentration profonde, minimisant l'anxiété liée aux examens.
- **Academic Pride** : Un sentiment de prestige associé à l'appartenance à mah.ai.

### Emotional Journey Mapping

- **Entry** : Surprise et Rapidité. L'absence de barrière crée une émotion positive immédiate.
- **Deep Work** : Concentration soutenue. L'interface s'efface au profit du contenu.
- **Support Moment** : Soulagement. L'IA intervient comme un filet de sécurité bienveillant.
- **Post-Session** : Satisfaction et Fierté. La visualisation du progrès transforme l'effort en succès tangible.

### Micro-Emotions

- **Trust over Skepticism** : Renforcé par l'Optimistic UI (Snake Rule).
- **Flow over Frustration** : Maintenu par l'accès immédiat à l'aide IA.
- **Excellence over Generic** : Transmise par une esthétique premium et soignée.

### Design Implications

- **Sérénité** : Utilisation d'espaces blancs généreux et de transitions douces.
- **Valorisation** : Micro-animations de "poussière d'étoiles" ou de reflets lors de l'augmentation du Grit Score.
- **Sécurité** : Indicateurs de statut hors-ligne subtils et rassurants (ex: "Travail sauvegardé localement ⚡").

### Emotional Design Principles

- **Dignity in Effort** : On ne gamifie pas pour amuser, mais pour honorer le travail.
- **Stability as a Feeling** : L'interface ne doit jamais sembler "cassée" ou "lente", même sans réseau.
- **Warm Intelligence** : L'IA doit sonner humaine, encourageante et jamais jugeante.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

- **Duolingo** : Référence pour la gamification de l'effort. Utilisation de feedbacks sonores et visuels pour rendre l'apprentissage addictif.
- **Brilliant.org** : Maîtrise de l'interactivité. Les concepts complexes sont décomposés en micro-actions gratifiantes.
- **ChatGPT** : Simplicité de l'interface de dialogue. L'IA doit être perçue comme un point de contact unique et polyvalent.

### Transferable UX Patterns

- **Bento Grid Navigation** : Utiliser une grille de type "Bento" pour présenter les matières, permettant une hiérarchie visuelle claire et moderne.
- **Skeleton Screens** : Charger instantanément la structure des pages pour renforcer l'impression de vitesse (PWA).
- **Sticky AI Assistant** : Un bouton d'appel à l'IA flottant ou contextuel qui suit la lecture sans l'obstruer.

### Anti-Patterns to Avoid

- **Barrier-First Access** : Éviter tout formulaire d'inscription avant la première interaction réussie.
- **Overwhelming Dashboards** : Ne pas surcharger l'écran d'accueil de statistiques complexes ; privilégier l'action immédiate.
- **Intrusive Gamification** : Ne pas infantiliser l'expérience ; le prestige académique doit rester la priorité.

### Design Inspiration Strategy

- **Visual Style** : "Neo-Academic" - Minimalisme moderne, typographie soignée (Inter/Outfit), et accents de couleurs vibrantes pour les call-to-actions.
- **Interaction Model** : Gesture-driven. Swipe pour naviguer entre les leçons, Tap prolongé pour interagir avec l'IA sur un mot spécifique.
- **Feedback Loop** : Chaque action (réussite d'un exercice) déclenche une micro-célébration visuelle élégante pour nourrir l'estime de soi de l'élève.

## Design System Foundation

### Design System Choice

**Shadcn/UI + Tailwind CSS**

### Rationale for Selection

- **Alignment Technique** : Correspond exactement au stack défini dans le project-context (Next.js 14, Tailwind).
- **Flexibilité & Unicité** : Permet de créer un design "Premium" sans les contraintes de frameworks UI rigides, tout en conservant une accessibilité exemplaire.
- **Performance PWA** : Architecture légère favorisant des temps de chargement ultra-rapides, essentiels pour la résilience offline.
- **Ownership** : Le code des composants réside dans le projet, facilitant la customisation profonde des éléments de gamification.

### Implementation Approach

- **Headless UI** : Utilisation de Radix UI pour la logique de comportement (accessibilité, clavier).
- **Styling Utility-First** : Application des styles via Tailwind CSS pour une maintenance simplifiée.
- **Dark Mode First** : Conception pensée pour le mode sombre dès le départ, pour réduire la fatigue visuelle lors des sessions d'étude prolongées.

### Customization Strategy

- **Design Tokens** : Définition d'une échelle de couleurs "Excellence" (Primaires : Slate-900, Indigo-600 ; Accents : Emerald-500 pour le Success, Amber-500 pour le Grit).
- **Typography** : Utilisation de la police 'Outfit' pour les titres (modernité) et 'Inter' pour le corps de texte (lisibilité).
- **UI Signature** : Introduction d'un système de "Glassmorphism" subtil pour les modales et l'assistant IA, renforçant l'aspect technologique et premium.

## 2. Core User Experience

### 2.1 Defining Experience

"Le Passage du Blocage à la Maîtrise" : La capacité pour un élève de transformer instantanément une difficulté académique en une victoire de compréhension grâce à une IA tuteur contextuelle et bienveillante, parfaitement intégrée à son flux de lecture.

### 2.2 User Mental Model

L'élève aborde mah.ai avec le stress d'un examen imminent ou la fatigue d'un sujet complexe. Son modèle mental est celui d'une recherche de "solution" rapide. mah.ai doit rediriger ce modèle vers une "maîtrise" gratifiante en rendant l'effort d'apprentissage plus stimulant que la simple recherche de réponses.

### 2.3 Success Criteria

- **Zéro Friction Contextuelle** : L'élève ne doit jamais copier-coller de texte ; l'IA connaît déjà sa position dans le cours.
- **Feedback Immédiat (60s Goal)** : Résolution complète d'un point d'ombre en moins d'une minute.
- **Clôture par la Maîtrise** : Chaque interaction IA doit se conclure par un mini-test réussi, transformant l'aide en compétence.

### 2.4 Novel UX Patterns

- **Context-Aware Sidebar** : Un assistant qui ne se contente pas de répondre, mais qui "surligne" et "commente" le matériel pédagogique en temps réel.
- **Trust-Integrated Gamification** : Le système de score n'est pas un panneau séparé, il est infusé dans chaque geste de l'utilisateur.

### 2.5 Experience Mechanics

1. **Focus Mode** : L'élève est en lecture plein écran.
2. **Support Trigger** : Sélection d'une zone complexe ou question directe.
3. **Tutoring Interaction** : Dialogue structuré (Socratique) : l'IA guide l'élève au lieu de donner la réponse.
4. **Validation Challenge** : Mini-quiz de 1 question.
5. **Dopamine Hit** : Mise à jour visuelle du Grit Score et animation de succès.

## Visual Design Foundation

### Color System

- **Direction : Grit Vibrant**
- **Palette Neutre Primary** : Slate (950 pour le Dark Mode, 50 pour le Light Mode) fournissant une base stable et sérieuse.
- **Accents Dynamiques** : 
  - **Grit Score** : Dégradé linéaire Amber-500 vers Red-500 (Énergie, chaleur, effort).
  - **Success Score** : Emerald-500 (Clarté, validation).
  - **AI & Systems** : Indigo-500 vers Violet-600 (Intelligence, profondeur).
- **Contraste** : Respect strict des normes WCAG 2.1 AA pour assurer la lisibilité en toutes conditions.

### Typography System

- **Titres (Titres de matières, Headlines)** : **Outfit** (Variable Weight). Moderne, ouverte et prestigieuse.
- **Corps de texte (Leçons, Chat IA)** : **Inter**. Maximise la lisibilité et réduit la fatigue visuelle lors de sessions de lecture prolongées.
- **Micro-copy & Data** : JetBrains Mono pour les chiffres et les scores, soulignant l'aspect précision/données.

### Spacing & Layout Foundation

- **Grille de Base** : Système 8px pour une harmonie spatiale totale.
- **Philosophie de Layout** : "Layered Interface". Utilisation de profondeurs de Z-index et de flous de précision (Glassmorphism) pour détacher l'assistant IA du contenu pédagogique.
- **Responsive Strategy** : Mobile-first bento grid. Les 10 matières sont présentées comme des tuiles interactives vibrantes s'adaptant à la taille de l'écran.

### Accessibility Considerations

- **Visual Cues only** : Ne jamais utiliser uniquement la couleur pour indiquer un succès ou une erreur (ajout d'icônes et de vibrations tactiles).
- **PWA High Contrast** : Mode haute visibilité activable pour une utilisation en plein soleil (fréquent à Madagascar).

## Design Direction Decision

### Design Directions Explored

- **V1: Bento Mastery** : Organisation par tuiles colorées, focus sur la navigation rapide.
- **V2: Zen Reader** : Minimalisme focalisé sur la lecture pure.
- **V3: Epic Clarity** : Version lumineuse de la gamification "Epic", utilisant des blancs purs et des dégradés vibrants.
- **V4: AI Sidekick** : Intégration hybride de l'IA en barre latérale.
- **V5: Bento Minimaliste** : Structure Bento épurée avec une hiérarchie d'information calme et structurée.

### Chosen Direction

**Synthèse "Epic Bento Minimaliste"**
Le projet retiendra une fusion entre la structure **Bento Minimaliste (V5)** pour le tableau de bord et la navigation, et le système de feedback visuel de **Epic Clarity (V3)** pour les moments de célébration et de calcul du "Grit Score".

### Design Rationale

- **Équilibre Académique & Motivation** : Le thème clair (Clarity) renforce le sérieux et le prestige de la plateforme, tandis que les éléments de gamification apportent l'énergie nécessaire pour maintenir l'effort (Grit).
- **Hiérarchie Claire** : Le format Bento permet de gérer les 10 matières sans surcharge cognitive.
- **Focus Utilisateur** : L'interface s'efface au profit du contenu pédagogique (Zen influence) mais devient vibrante lors des succès.

### Implementation Approach

- **Surface & Depth** : Utilisation de `bg-slate-50` avec des cartes `bg-white` aux ombres portées très douces (`shadow-sm`).
- **Color Accents** : Utilisation parcimonieuse mais intense des dégradés Amber/Red pour le Grit Score.
- **Interactive Layers** : Mise en œuvre du Glassmorphism pour les menus contextuels de l'IA (Sidekick) afin de ne pas masquer le cours.

## User Journey Flows

### 1. Apprentissage Actif (Le Cycle de Maîtrise)

Ce parcours est le cœur de mah.ai. Il transforme la lecture passive en une boucle de rétroaction intelligente. L'élève utilise l'IA pour débloquer des concepts complexes, concluant chaque aide par un test de compétence réel.

#### Flow Mechanics :
1. **Entry** : Lecture en Focus Mode.
2. **Help Request** : Surlignage ou clic Sidekick.
3. **Dialogue** : Échange structuré Socratique.
4. **Challenge** : Mini-quiz contextuel de 1-2 questions.
5. **Reward** : Mise à jour visuelle du Grit Score avec animation.

### 2. Onboarding "Trust-First"

Permettre à l'élève de "goûter" à la réussite académique avant même de créer un compte, réduisant ainsi la friction initiale.

#### Flow Mechanics :
1. **Landing** : Accueil Bento listant les 10 matières.
2. **Trial** : Accès direct à la première leçon d'une matière (Analyse Sémantique).
3. **Value Realization** : Premier défi réussi (+ Grit temporaire).
4. **Soft Gate** : Invitation à sauvegarder son progrès via OTP (Sign-up fluide).

### Journey Patterns

- **Pattern de Feedback** : Chaque interaction positive est suivie d'un retour visuel immédiat (Snake Rule / Optimistic UI).
- **Pattern de Sortie** : Toujours ramener l'utilisateur vers son activité principale (le cours) après une interaction IA ou un quiz.
- **Pattern de Résilience** : En cas de déconnexion, les actions sont mises en file d'attente localement avec un indicateur de statut discret.

## Component Strategy

### Design System Components

Utilisation intensive de la bibliothèque **Shadcn/UI** pour les éléments structurels :
- **OTP Input** : Pour l'authentification "Trust-First".
- **Skeleton** : Pour les chargements ultra-rapides (PWA).
- **Tabs & Accordions** : Pour la hiérarchie des 10 matières.
- **Dialog & Popover** : Pour les interactions IA sans perte de contexte.

### Custom Components

#### 1. Bento Dashboard Component
- **Purpose** : Organiser visuellement les matières et les scores de progression.
- **Usage** : Page d'accueil utilisateur.
- **Mechanism** : Grille CSS Grid / Bento personnalisée avec support du drag-and-drop futur.

#### 2. Contextual AI Sidekick
- **Purpose** : Assistant socratique intégré au lecteur de cours.
- **Anatomy** : Sidebar translucide (Glassmorphism) avec zone de chat et zone de défi.
- **Accessibility** : Support complet du lecteur d'écran et navigation clavier.

#### 3. Grit Progress Visualization
- **Purpose** : Matérialiser l'effort fourni.
- **Variants** : Barre de progression de matière (linéaire) et Anneau de score global (circulaire).
- **Feedback** : Micro-animations de "remplissage" lors d'un gain de point.

### Component Implementation Strategy

- **Design Tokens** : Tous les composants custom utiliseront les variables de couleurs (Slate, Indigo, Amber) définies à l'étape 8.
- **Reusability** : Les composants IA seront déconnectés de la logique métier pour être réutilisés dans les quiz et les leçons.
- **PWA Ready** : Optimisation des poids des composants pour un chargement instantané.

## UX Consistency Patterns

### Button Hierarchy

- **Action Primaire** : Utilise le "Grit Gradient" (Amber-Red). Réservé aux victoires d'apprentissage et aux examens.
- **Action Secondaire** : Indigo solide. Utilisé pour la navigation et les réglages système généraux.
- **AI Action ✨** : Background translucide (Glassmorphism) avec icône dédiée. Accessible à tout moment dans le flux de lecture.

### Feedback Patterns

- **Célébration du Progrès** : Utilisation de feedbacks haptiques (sur mobile) et de micro-animations de particules lors de l'augmentation du Grit Score.
- **Error Handling (Warm Intelligence)** : Les erreurs sont traitées comme des "étapes d'apprentissage". Pas de pop-up d'erreur bloquante ; l'IA Sidekick intervient pour proposer une explication simplifiée.

### Navigation Patterns

- **Bento-to-Reader Transition** : Animation de transition "Hero" où la carte de la matière s'étend pour remplir l'écran du lecteur.
- **Global Search** : Accessible via `Ctrl+K` ou une icône loupe omniprésente, utilisant un menu de commande rapide (CMD-K).

### Loading & State Patterns

- **Zero-Wait PWA** : Utilisation systématique de Skeleton screens alignés sur la structure Bento. 
- **Offline Sync Notification** : Un petit indicateur de chargement discret (nuage éclair) pour rassurer l'utilisateur sur la synchronisation de ses scores.

## Responsive Design & Accessibility

### Responsive Strategy

- **Mobile First** : La PWA est optimisée pour une utilisation à une main. Le Bento Dashboard s'empile verticalement et la navigation est située en bas de l'écran.
- **Adaptive Reader** : Sur mobile, l'IA est un "Sidekick" flottant ; sur tablette/desktop, elle devient une barre latérale fixe pour une étude plus confortable.

### Breakpoint Strategy

Utilisation des breakpoints Tailwind (`sm`, `md`, `lg`, `xl`) :
- **Tablette (md)** : Transition vers un layout à deux colonnes pour le dashboard.
- **Desktop (lg)** : Activation des interactions complexes et des annotations avancées.

### Accessibility Strategy (WCAG 2.1 AA)

- **Contrast Control** : Mode haute visibilité automatique en cas de forte luminosité ambiante (utilisant les contrastes élevés par défaut).
- **Inclusion Narrative** : Chaque micro-interaction de succès (Grit) possède un équivalent visuel et haptique clair.
- **Focus Management** : Indicateurs de focus indigo (`ring-2 ring-indigo-500`) clairement visibles pour la navigation au clavier.

### Testing Strategy

- **Responsive Testing** : Test sur simulateurs mobiles et tablettes pour valider les transitions de grille Bento.
- **Réseau** : Test en mode "Slow 3G" pour s'assurer que les Skeleton screens s'affichent correctement.
- **Accessibilité** : Utilisation de Lighthouse et audit manuel au clavier pour garantir le niveau AA.

### Implementation Guidelines

- **Relative Units** : Utilisation de `rem` pour la typographie et `%` pour les containers afin d'assurer la fluidité.
- **Aria Roles** : Emploi de `aria-live` pour annoncer les gains de score en temps réel.
- **Optimized Assets** : Chargement progressif des images pour ne pas pénaliser les utilisateurs mobiles.



