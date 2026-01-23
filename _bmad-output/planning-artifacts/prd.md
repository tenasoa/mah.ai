---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - 'c:\Users\Tenasoa\Desktop\projetBmad\mah.ai\_bmad-output\analysis\brainstorming-session-2026-01-21.md'
  - 'c:\Users\Tenasoa\Desktop\projetBmad\mah.ai\_bmad-output\analysis\mah-ai-master-plan.md'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
classification:
  projectType: 'Web App (PWA - Mobile First)'
  domain: 'EdTech'
  complexity: 'Moyenne'
  projectContext: 'Greenfield'
strategicInsights:
  - 'AI Caching: Generate once, sell 10,000 times to minimize token costs.'
  - 'B2B Revenue: Selling qualified student leads to private universities.'
  - 'UX Advantage: Instant search speed as the primary differentiator from Facebook.'
  - 'Pedagogy: Socratic AI mode + Merit Points system to reward effort over shortcuts.'
  - 'Teacher Portal: Supervisor accounts for classroom tracking and engagement.'
  - 'Mentor Economy: Passive royalty system for mentors when their AI Clone is used.'
  - 'Success Indicator: Core UX element showing "Probability of Exam Success" based on progress.'
  - 'Parental Control: Budget management and progress alerts for parents (SMS/App).'
  - 'Quality Assurance: Human-in-the-loop validation for "Master" AI-generated solutions.'
  - 'Technical Constraint: Ultra-lightweight UI (<2MB) optimized for Opera Mini/low-end devices.'
  - 'Double League System: Separate rankings for Performance (grades) and Grit (effort/regularity).'
  - 'Grit Score Monetization: Selling resilience data to HR and scholarship providers.'
  - 'Structured Comments: Stack Overflow style utility-based threads to maintain a "Zen Garden" UX.'
  - 'Local AI Janitor: Browser-side moderation (TensorFlow.js) to filter spam and noise.'
  - 'Noise-to-Like Conversion: Automatically transforming short "Thank you" messages into non-intrusive likes.'
workflowType: 'prd'
---

# Product Requirements Document - mah.ai

**Author:** Tenasoa
**Date:** 2026-01-21
**Version:** 1.0 (Polished)

## 1. Executive Summary & Vision

**Vision:** Libérer et structurer l'intelligence collective de la jeunesse malgache pour transformer l'anxiété des examens (BACC) en **Sérénité**. Mah.ai n'est pas juste une bibliothèque de sujets, c'est un coach personnel de poche qui récompense l'effort ("Grit") autant que la performance.

**Différenciateur Clé:**
Contrairement aux groupes Facebook chaotiques et aux cours privés coûteux, Mah.ai offre une **structure instantanée** ("Sérénité") et une **pédagogie IA Socratique** qui guide sans donner la réponse, le tout optimisé pour l'Internet mobile malgache (PWA léger).

## 2. Success Criteria

### User Success (L'Impact)
- **North Star Metric:** Le taux de réussite au BACC des utilisateurs actifs Mah.ai doit être **significativement supérieur (+30%)** à la moyenne nationale.
- **Sentiment de Sérénité:** L'élève doit pouvoir accéder à une explication bloquante en **moins de 30 secondes** (Vitesse = Calme).
- **Engagement "Grit":** Un élève de la "Ligue Grit" revient sur la plateforme **4 jours consécutifs**, prouvant que la valorisation de l'effort fonctionne.

### Business Success (La Viabilité)
- **Adoption:** 10 000 utilisateurs actifs (3 lycées pilotes) dès le premier mois (Mai 2026).
- **Conversion:** 5% des utilisateurs gratuits achètent au moins un micro-forfait.
- **B2B:** Signature d'un partenariat "Data Recrutement" avec une université privée sous 6 mois.

### Technical Success (La Performance)
- **Vitesse:** Chargement initial < 2s sur réseau 3G.
- **Rentabilité IA:** 90% de "Cache Hit" (réutilisation des réponses IA déjà générées) pour minimiser les coûts d'API.
- **Disponibilité:** 99.9% durant le mois critique de Mai.

## 3. Strategie & Périmètre (Roadmap)

### Approche : "Sérénité & Vitesse"
Notre priorité absolue est d'être prêt pour le **Rush de Mai 2026**. Nous adoptons une stratégie MVP radicale qui exclut toute complexité technique non essentielle (pas d'API de paiement complexe, pas de mode offline lourd).

### Phase 1 : MVP (Lancement Mai 2026)
*L'essentiel pour réviser et payer.*
- **Catalogue:** Recherche instantanée (Année/Série/Matière).
- **Sujet Vivant:** Visionneuse PDF optimisée + Commentaires IA Socratique.
- **Paiement "Zéro Friction":** Validation manuelle assistée par script (Code SMS + Accès Immédiat de confiance).
- **Gamification V1:** Compteur de "Points de Mérite" personnel.
- **Sécurité:** Watermarking dynamique (Overlay CSS).

### Phase 2 : Growth (Septembre 2026)
*La viralité et la rétention.*
- **La Double Ligue:** Classements complets "Performance" vs "Grit" (Effort).
- **Clans de Lycée:** Tournois inter-établissements.
- **Gestion Famille:** Multi-profils sur un même compte.
- **A/B Testing:** Optimisation de la rétention des élèves en difficulté.

### Phase 3 : Expansion (2027)
*L'écosystème complet.*
- **Clone IA Mentor:** Revenus passifs pour les professeurs certifiés.
- **Marketplace B2B:** Vente de leads qualifiés aux universités.
- **Cartable Numérique:** Mode Offline complet (PWA avancée).
- **Paiement API:** Intégration native MVola/Orange Money.

## 4. User Journeys (Parcours Clés)

### Mialy (L'Élève Stressée) - Le Parcours "Sérénité"
1.  **22h00:** Mialy bloque sur un exercice de Physique, paniquée.
2.  **Action:** Elle ouvre Mah.ai. En 3 clics, elle est sur la question précise.
3.  **Interaction:** Elle demande de l'aide. L'IA Socratique ne lui donne pas la réponse mais l'indice qui débloque son raisonnement.
4.  **Résultat:** Elle comprend, gagne des points, et se couche rassurée.

### Le Paiement "Zéro Friction" (Parcours Critique)
1.  **Besoin:** Mialy veut activer un "Pass Semaine" mais n'a pas de carte bancaire.
2.  **Action:** Elle envoie 2000 Ar par Mobile Money et saisit juste le code de référence SMS dans l'appli.
3.  **Magie:** Elle reçoit un **Accès Immédiat (1h)** sans attendre la validation manuelle.
4.  **Back-office:** Le système valide le code en arrière-plan.

### Rivo (Le Mentor) - Le Parcours "Revenu Passif"
1.  **Action:** Rivo uploade ses corrigés certifiés et configure son style pédagogique.
2.  **Gain:** Son "Clone IA" répond aux questions basiques 24/7.
3.  **Impact:** Il touche des royalties à chaque utilisation, sans effort supplémentaire.

## 5. Functional Requirements (Le Contrat)

### Gestion Utilisateur & Accès
- **FR1:** Inscription simplifiée avec numéro de téléphone unique.
- **FR2:** Connexion par OTP (SMS) ou mot de passe.
- **FR3:** Profil basique (Pseudo, Lycée, Classe).

### Catalogue & Consommation
- **FR4:** Recherche/Filtrage (Année, Série, Matière).
- **FR5:** "Teaser" Hybride : Aperçu flouté avec 3 premières questions claires (SEO).
- **FR6:** Déblocage de sujet à l'unité ou activation de Pass Temps.
- **FR7:** Visionneuse PDF Mobile (Zoom, Scroll fluide).

### IA & Pédagogie ("Sujet Vivant")
- **FR8:** Fil de discussion contextuel par question (click-to-ask).
- **FR9:** IA Socratique : Fournit guide/indice, refuse la réponse directe immédiate.
- **FR10:** Attribution de "Points de Mérite" (Grit Score) pour l'effort.

### Paiement & Monétisation
- **FR11:** Déclaration manuelle de paiement (Saisie code ref SMS).
- **FR12:** Accès "Confiance" immédiat (1h) post-saisie.
- **FR13:** Validation/Révocation a posteriori par admin/script.

### Administration & Qualité
- **FR14:** Upload et indexation PDF par l'admin.
- **FR15:** Modération assistée par IA ("Janitor" local) des commentaires.
- **FR16:** Notifications de rappel et de réponses (Rétention).

## 6. Non-Functional Requirements (Qualité)

### Performance & Fiabilité
- **Chargement:** < 2s sur 3G. Poids page < 500 Ko.
- **Réactivité:** Navigation interne instantanée (< 100ms).
- **Disponibilité:** 99.9% en Mai.

### Sécurité & Compliance
- **Anonymat:** Hachage des numéros de téléphone (Base de données).
- **Protection:** URLs PDF signées et Watermarking CSS (Overlay Pseudo).
- **Juridique:** Consentement parental déclaratif ("+18 ou autorisé").

### Accessibilité & Contexte
- **Outdoor Mode:** Contraste élevé (Noir/Blanc) par défaut pour lisibilité au soleil/écrans low-cost.

## 7. Design System + UI Direction (Draft)

### Direction visuelle (fidèle au dashboard de référence)
- **Ambiance:** Dark + aurora, premium, focus, calme. Fond profond bleu nuit, halos colorés diffus, contraste net.
- **Signature:** Sidebar vitrifiée + bento grid dense + cards glassy.
- **Langage visuel:** angles doux (radius 16-24), gradients subtils, glow orange pour actions clés.

### Palette (tokens)
- **Background:** #0F172A (base), overlays #111827 / #1F2937.
- **Text:** principal #F8FAFC, secondaire #94A3B8, muted #64748B.
- **Accent:** Orange #F97316 (CTA + highlights), Cyan #06B6D4 (IA), Indigo #6366F1 (accent secondaire).
- **Borders:** white 8-12% opacity.
- **Glow:** orange 15-25% opacity.

### Typographie
- **Titres:** Outfit (bold, tracking serré).
- **Texte:** Inter (400-600).
- **Hiérarchie:** H1 30-36px, H2 20-24px, body 14-16px, labels 11-12px.
- **Règle:** titres courts, verbes d’action, chiffres mis en évidence.

### Layout & Grids
- **Structure:** Sidebar fixe (240-260px desktop), contenu scroll.
- **Bento grid:** 4 colonnes desktop, 2 colonnes tablette, 1 colonne mobile.
- **Rythme:** gaps 16-24px, padding cards 20-24px, sections 24-32px.
- **Mobile:** sidebar en topbar scroll horizontale.

### Composants clés
- **Sidebar:** état actif orange, hover léger, icônes fines.
- **Search bar:** translucide + bordure claire + icône.
- **Cards:** glassmorphism, hover lift minimal (-2px), bordure animée.
- **Hero card (Grit):** très grand chiffre + stats en grid.
- **PDF workspace:** card split, dots latérales, tooltip IA flottant.
- **Subject cards:** badge couleur + barre de progression.
- **Exam banner:** card wide avec bordure gauche orange + CTA secondaire.

### États & Interactions
- **Hover:** élévation légère + bordure plus brillante.
- **Focus:** ring orange discret.
- **Loaders:** spinner orange (12-24px) centré.
- **Empty states:** icône + message court + action primaire.

### Motion
- **Ambient:** blobs statiques ou lente pulsation (6-10s).
- **Cards:** micro-translate + shadow soft.
- **IA tooltip:** float léger (6s).

### Accessibilité & Performance UI
- **Contraste:** respect AA pour texte principal.
- **Taille:** UI < 2MB, pas d’images lourdes.
- **PWA:** rendu stable en 3G.

### Tonalités de contenu
- **Microcopy:** sobre, direct, motivation (“Focus”, “Progress”, “Ready?”).
- **Localisation:** FR par défaut, Malagasy possible pour CTA clés.

## 7. Innovation & Spécificités Techniques

### Innovations Majeures
- **Ligue Grit:** Valorisation de la persévérance vs performance pure.
- **Micro-Tutorat Flash:** Économie collaborative pour les élèves brillants.
- **Paiement Confiance:** Suppression de la friction d'attente.

### Architecture Technique (PWA Mobile First)
- **Stack:** Next.js (React) + SSR.
- **Offline:** Stratégie manuelle ("Télécharger ce sujet") pour économiser le stockage utilisateur.
- **SEO:** Teaser Hybride (Indexation partielle, Contenu flouté).
