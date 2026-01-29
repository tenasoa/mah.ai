# Sprint Backlog - Mah.ai
**Date:** 29 janvier 2026  
**Sprint:** Améliorations Thème + Fonctionnalités Crédits + UX Mobile

---

## 📋 Résumé des Implémentations Précédentes (Hier et avant)

### ✅ Système de Formatage Markdown Complet
- **MarkdownRenderer.tsx** : Composant central pour le rendu markdown avec support KaTeX
- **AIResponseFormatter.tsx** : Formatage spécialisé des réponses IA
- **SubjectHeaderFormatter.tsx** : Affichage élégant des métadonnées de sujets
- Migration complète depuis ReactMarkdown vers système custom
- Support des équations mathématiques (LaTeX → KaTeX)
- 3 variantes de style : light, dark, minimal

### ✅ Architecture de Composants
- Refactoring des fichiers : SocraticSidekick, SubjectReader, SubjectAIResponse, SubjectResolver
- Documentation complète : FORMATTING_GUIDE.md, FORMATTING_EXAMPLES.md
- Tests unitaires pour les composants de formatage

---

## 🎯 Objectifs du Sprint Actuel

### 🔴 Priorité Haute
1. **Corrections Thème Dark** - Synchronisation complète des couleurs
2. **Système de Crédits** - Implémentation 2/3 crédits par réponse IA
3. **Analyse Thème** - Audit complet de l'état actuel

### 🟡 Priorité Moyenne  
4. **Améliorations Thème Light** - Fonds gris et corrections visuelles
5. **Restriction Socratic** - Réservé aux abonnés uniquement
6. **Navigation Onglets** - Pack crédit/abonnement sans refresh
7. **Mobile** - Bouton déconnexion et statut en ligne
8. **Messages** - Badge compteur non lus et historique sujets supprimés

### 🟢 Priorité Faible
9. **Animations** - Flash messages et titres dynamiques
10. **UI/UX** - Accordéon profil et icone admin navbar

---

## 📝 Détail des Tâches

### 🌙 Thème Dark Mode Corrections

#### Problèmes Identifiés:
- **Page lecture sujet** : Police couleur non blanche au chargement initial
- **Cartes actions** : Réponse IA, résoudre, socratic non synchronisées
- **Réponses IA générées** : Titres non synchronisés avec thème
- **Page profil** : Champs et boutons non synchronisés
- **Settings admin** : Couleurs non adaptées
- **Pages admin** : Analyste, paiements, tickets non synchronisées

#### Actions Requises:
- [ ] Audit complet des composants avec thème dark
- [ ] Correction des variables CSS/ Tailwind pour dark mode
- [ ] Tests de synchronisation sur toutes les pages

### ☀️ Thème Light Mode Améliorations

#### Modifications Demandées:
- **Fonds pages** : Ajouter gris foncé pour valoriser les cartes
- **Landing page** : Corriger carte "système de mérite" restée sombre
- **Cartes recharge** : Synchroniser couleurs "Recharge & plans" + solde

### 📱 Mobile UX

#### Fonctionnalités:
- **Bouton déconnexion** : Icône rouge uniquement pour mobile
- **Statut en ligne** : Logique de connexion utilisateur
- **Messages** : Badge rouge compteur pour non lus

### 💰 Système de Crédits

#### Implémentation:
- **Coûts** : Réponse directe = 2 crédits, réponse détaillée = 3 crédits
- **Restriction** : Socratic uniquement pour abonnés
- **Navigation** : Système d'onglets (crédits/abonnement) sans refresh page

### 🎨 UI/UX Enhancements

#### Animations & Interactions:
- **Flash messages** : Animation gauche→droite avec effet d'élan
- **Titres onglets** : Dynamique selon page consultée
- **Profil** : Bouton masquage accordéon (haut→bas)
- **Historique** : Conservation sujets supprimés
- **Admin navbar** : Ajustement icone profil

---

## 🔍 Analyse Technique Préliminaire

### Stack Actuel:
- **Frontend** : Next.js 16, Tailwind CSS 4
- **Thème** : ThemeProvider (contexte React)
- **Auth** : Supabase Auth
- **State** : Zustand
- **UI** : Composants custom avec Lucide icons

### Fichiers Clés à Examiner:
- `src/components/providers/ThemeProvider.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/app/subjects/[id]/page.tsx`
- `src/components/subjects/FloatingSubjectActions.tsx`
- `src/app/credits/page.tsx`
- `src/components/credits/*`

---

## 📊 Métriques de Succès

### Objectifs Qualitatifs:
- **Thème** : Synchronisation 100% dark/light sur toutes les pages
- **Mobile** : Expérience utilisateur fluide avec déconnexion accessible
- **Crédits** : Système fonctionnel et clair pour les utilisateurs
- **Performance** : Navigation sans refresh pour crédits/abonnement

### Objectifs Quantitatifs:
- **Zero bugs** de synchronisation thème
- **100%** des pages testées sur mobile
- **<2s** temps de réponse système crédits
- **<500ms** animation transitions

---

## ⏱️ Timeline Estimée

### Semaine 1 (29 Jan - 2 Fév):
- Audit thème complet
- Corrections dark mode prioritaires
- Implémentation système crédits

### Semaine 2 (3 Fév - 7 Fév):
- Améliorations light mode
- Fonctionnalités mobile
- Navigation onglets

### Semaine 3 (10 Fév - 14 Fév):
- Animations et UX finale
- Tests complets
- Documentation

---

## 🚦 Risques et Dépendances

### Risques:
- **Complexité thème** : Variables CSS multiples à synchroniser
- **Performance mobile** : Animations pourraient impacter vitesse
- **Logique crédits** : Intégration avec système existant

### Dépendances:
- **Design final** : Validation des choix couleurs/thème
- **Tests utilisateurs** : Feedback sur expérience mobile
- **Backend** : API crédits doit supporter nouvelles règles

---

## 📝 Notes de Révision

*Ce document sera mis à jour quotidiennement avec le progrès des tâches et les découvertes techniques.*

**Dernière mise à jour :** 29 janvier 2026  
**Statut :** À commencer
