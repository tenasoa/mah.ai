# ✅ Checklist de Correction - Mah.ai MVP

**Branche**: `bugfix/ui-improvements-and-features`  
**Dernière mise à jour**: 2026-02-04

---

## 🎯 PHASE 1: QUICK WINS (1h30)

### ✅ Bug #4: Désactiver Route /auth (15 min)
- [ ] Modifier `src/app/auth/page.tsx`
- [ ] Ajouter redirection vers `/` avec paramètre `?auth=open`
- [ ] Modifier `src/app/page.tsx` pour détecter le paramètre
- [ ] Ouvrir automatiquement la modal d'authentification
- [ ] Tester la redirection
- [ ] Vérifier que la modal s'ouvre correctement

**Fichiers modifiés**: 2  
**Tests**: Accéder à `/auth` et vérifier la redirection

---

### ✅ Feature #1: 100 Crédits à l'Inscription (30 min)
- [ ] Identifier la fonction de création de profil
- [ ] Ajouter `credits: 100` lors de l'insertion
- [ ] Créer notification de bienvenue
- [ ] Ajouter mention sur landing page (section pricing)
- [ ] Tester l'inscription
- [ ] Vérifier que les crédits sont bien ajoutés
- [ ] Vérifier que la notification s'affiche

**Fichiers modifiés**: 2-3  
**Tests**: Créer un nouveau compte et vérifier les crédits

---

### ✅ Bug #5: Redirection Automatique (30 min)
- [ ] Créer `src/middleware.ts`
- [ ] Ajouter vérification de session
- [ ] Rediriger vers `/subjects` si connecté
- [ ] Configurer le matcher pour `/`
- [ ] Tester avec utilisateur connecté
- [ ] Tester avec utilisateur non connecté
- [ ] Vérifier que la landing page reste accessible si déconnecté

**Fichiers créés**: 1  
**Tests**: Se connecter et accéder à `/`

---

### ✅ Bug #6: Avatar Admin (20 min)
- [ ] Identifier le composant navbar admin
- [ ] Localiser l'avatar dans le code
- [ ] Ajuster padding/margin
- [ ] Vérifier la responsive
- [ ] Tester sur différentes tailles d'écran

**Fichiers modifiés**: 1  
**Tests**: Accéder au panel admin et vérifier l'avatar

---

## 🔥 PHASE 2: BUG CRITIQUE (1h30)

### ✅ Bug #3: Milkdown - Tableaux + LaTeX (1h30)

#### Étape 1: Installation des Plugins (5 min)
- [ ] Ouvrir terminal
- [ ] Exécuter: `npm install @milkdown/plugin-gfm @milkdown/plugin-math`
- [ ] Vérifier que l'installation s'est bien passée
- [ ] Vérifier `package.json`

#### Étape 2: Modifier MilkdownEditor.tsx (15 min)
- [ ] Ouvrir `src/components/ui/MilkdownEditor.tsx`
- [ ] Ajouter imports: `gfm` et `math`
- [ ] Modifier ligne 39: ajouter `.use(gfm).use(math)`
- [ ] Sauvegarder le fichier

#### Étape 3: Ajouter Styles CSS (30 min)
- [ ] Ouvrir `src/app/globals.css`
- [ ] Ajouter import KaTeX (ligne 5)
- [ ] Ajouter styles pour tables GFM
- [ ] Ajouter styles pour formules LaTeX
- [ ] Ajouter styles dark mode pour tables
- [ ] Ajouter styles dark mode pour math
- [ ] Sauvegarder le fichier

#### Étape 4: Tests (40 min)
- [ ] Créer un sujet de test avec tableau markdown
- [ ] Créer un sujet de test avec formule LaTeX
- [ ] Tester l'affichage en mode édition
- [ ] Tester l'affichage en mode lecture (readonly)
- [ ] Tester dans les réponses IA
- [ ] Vérifier en light mode
- [ ] Vérifier en dark mode
- [ ] Tester sur mobile

**Fichiers modifiés**: 3 (package.json, MilkdownEditor.tsx, globals.css)  
**Tests**: Créer réponse IA avec tableau et formule

---

## 🎨 PHASE 3: AMÉLIORATIONS VISUELLES (2h)

### ✅ Bug #2: Light Mode Moins Éclatant (45 min)

#### Étape 1: Modifier Variables CSS (15 min)
- [ ] Ouvrir `src/app/globals.css`
- [ ] Modifier `--background` (ligne 23)
- [ ] Modifier `--card` (ligne 25)
- [ ] Modifier `--border` (ligne 27)
- [ ] Modifier `--muted` (ligne 28)
- [ ] Modifier `--subtle-gradient` (ligne 36)
- [ ] Sauvegarder

#### Étape 2: Tests Visuels (30 min)
- [ ] Recharger l'application
- [ ] Vérifier la landing page
- [ ] Vérifier les pages de sujets
- [ ] Vérifier le dashboard
- [ ] Comparer avant/après
- [ ] Ajuster si nécessaire
- [ ] Valider avec testeurs

**Fichiers modifiés**: 1 (globals.css)  
**Tests**: Parcourir toutes les pages en light mode

---

### ✅ Bug #1: Dark Mode Admin (1h15)

#### Étape 1: Auditer Pages Admin (15 min)
- [ ] Ouvrir `src/app/admin/page.tsx`
- [ ] Ouvrir `src/app/admin/subjects/page.tsx`
- [ ] Ouvrir `src/app/admin/users/page.tsx`
- [ ] Ouvrir `src/app/admin/analytics/page.tsx`
- [ ] Ouvrir `src/app/admin/settings/page.tsx`
- [ ] Ouvrir `src/app/admin/payments/page.tsx`
- [ ] Ouvrir `src/app/admin/tickets/page.tsx`
- [ ] Identifier tous les éléments sans dark mode

#### Étape 2: Appliquer Classes Dark (45 min)
- [ ] Modifier dashboard admin
- [ ] Modifier gestion sujets
- [ ] Modifier gestion utilisateurs
- [ ] Modifier analytics
- [ ] Modifier paramètres
- [ ] Modifier paiements
- [ ] Modifier support/tickets
- [ ] Vérifier cohérence globale

#### Étape 3: Tests (15 min)
- [ ] Activer dark mode
- [ ] Parcourir toutes les pages admin
- [ ] Vérifier les cartes
- [ ] Vérifier les tableaux
- [ ] Vérifier les formulaires
- [ ] Vérifier les boutons
- [ ] Comparer avec le reste de l'app

**Fichiers modifiés**: 7 (toutes les pages admin)  
**Tests**: Parcourir panel admin en dark mode

---

## 📱 PHASE 4: PWA (1h30)

### ✅ Feature #2: Finaliser PWA (1h30)

#### Étape 1: Vérifier Service Worker (15 min)
- [ ] Ouvrir `src/sw.ts`
- [ ] Vérifier la configuration Serwist
- [ ] Vérifier que tout est correct
- [ ] Tester en mode production

#### Étape 2: Améliorer Manifest (20 min)
- [ ] Ouvrir `public/manifest.json`
- [ ] Mettre à jour le nom complet
- [ ] Mettre à jour la description
- [ ] Changer `start_url` vers `/subjects`
- [ ] Mettre à jour `theme_color` vers `#f59e0b`
- [ ] Mettre à jour `background_color` vers `#020617`
- [ ] Ajouter `categories`
- [ ] Sauvegarder

#### Étape 3: Générer Icônes PWA (30 min)
- [ ] Préparer l'icône source (512x512)
- [ ] Générer icône 72x72
- [ ] Générer icône 96x96
- [ ] Générer icône 128x128
- [ ] Générer icône 144x144
- [ ] Générer icône 152x152
- [ ] Générer icône 192x192
- [ ] Générer icône 384x384
- [ ] Générer icône 512x512
- [ ] Générer apple-touch-icon (180x180)
- [ ] Placer dans `public/icons/`
- [ ] Mettre à jour manifest.json

#### Étape 4: Ajouter Meta Tags (15 min)
- [ ] Ouvrir `src/app/layout.tsx`
- [ ] Ajouter `manifest: "/manifest.json"`
- [ ] Ajouter `appleWebApp` config
- [ ] Ajouter `icons` config
- [ ] Sauvegarder

#### Étape 5: Tests PWA (10 min)
- [ ] Builder en production: `npm run build`
- [ ] Lancer: `npm start`
- [ ] Ouvrir Chrome DevTools
- [ ] Aller dans Application > Manifest
- [ ] Vérifier que le manifest est détecté
- [ ] Vérifier les icônes
- [ ] Tester l'installation sur mobile
- [ ] Vérifier que l'app s'installe correctement

**Fichiers modifiés**: 3 (manifest.json, layout.tsx, sw.ts)  
**Fichiers créés**: ~10 (icônes)  
**Tests**: Installer l'app sur mobile

---

## 📞 PHASE 5: REFACTORISATION (45 min)

### ✅ Feature #3: Refactoriser Contact (45 min)

#### Étape 1: Créer Store Zustand (10 min)
- [ ] Créer dossier `src/store/`
- [ ] Créer `src/store/useContactStore.ts`
- [ ] Implémenter le store
- [ ] Exporter les fonctions

#### Étape 2: Créer Modal Contact (20 min)
- [ ] Créer dossier `src/components/contact/`
- [ ] Créer `src/components/contact/ContactModal.tsx`
- [ ] Implémenter le modal
- [ ] Ajouter formulaire de contact
- [ ] Styliser le modal

#### Étape 3: Remplacer Boutons (15 min)
- [ ] Identifier tous les boutons contact
- [ ] Remplacer dans `src/app/page.tsx`
- [ ] Remplacer dans footer
- [ ] Remplacer dans autres composants
- [ ] Supprimer les `window.dispatchEvent`
- [ ] Ajouter `<ContactModal />` dans layout

**Fichiers créés**: 2  
**Fichiers modifiés**: 3-5  
**Tests**: Cliquer sur tous les boutons contact

---

## 🧪 PHASE 6: TESTS FINAUX (1h)

### ✅ Tests Fonctionnels (30 min)
- [ ] Tester toutes les corrections de bugs
- [ ] Tester toutes les nouvelles features
- [ ] Vérifier la responsive
- [ ] Tester sur Chrome
- [ ] Tester sur Firefox
- [ ] Tester sur Safari
- [ ] Tester sur mobile (iOS)
- [ ] Tester sur mobile (Android)

### ✅ Tests Visuels (20 min)
- [ ] Vérifier light mode sur toutes les pages
- [ ] Vérifier dark mode sur toutes les pages
- [ ] Vérifier cohérence des couleurs
- [ ] Vérifier les animations
- [ ] Vérifier les transitions
- [ ] Comparer avec la version avant corrections

### ✅ Tests Utilisateurs (10 min)
- [ ] Faire tester par 2-3 personnes
- [ ] Recueillir feedback
- [ ] Noter les problèmes restants
- [ ] Prioriser les ajustements

---

## 📊 PROGRESSION GLOBALE

### Bugs (6 total)
- [ ] Bug #1: Dark mode admin
- [ ] Bug #2: Light mode éclatant
- [ ] Bug #3: Milkdown (tableaux + LaTeX)
- [ ] Bug #4: Route /auth
- [ ] Bug #5: Redirection auto
- [ ] Bug #6: Avatar admin

**Progression**: 0/6 (0%)

### Features (3 total)
- [ ] Feature #1: 100 crédits
- [ ] Feature #2: PWA
- [ ] Feature #3: Contact refacto

**Progression**: 0/3 (0%)

### Phases (6 total)
- [ ] Phase 1: Quick Wins
- [ ] Phase 2: Bug Critique
- [ ] Phase 3: Visuels
- [ ] Phase 4: PWA
- [ ] Phase 5: Refacto
- [ ] Phase 6: Tests

**Progression**: 0/6 (0%)

---

## ⏱️ TEMPS ESTIMÉ PAR PHASE

| Phase | Durée | Tâches |
|-------|-------|--------|
| Phase 1: Quick Wins | 1h30 | 4 tâches |
| Phase 2: Bug Critique | 1h30 | 1 tâche |
| Phase 3: Visuels | 2h00 | 2 tâches |
| Phase 4: PWA | 1h30 | 1 tâche |
| Phase 5: Refacto | 0h45 | 1 tâche |
| Phase 6: Tests | 1h00 | Tests |
| **TOTAL** | **8h15** | **9 tâches** |

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

### Jour 1 (3-4h)
1. ✅ Phase 1: Quick Wins (1h30)
2. ✅ Bug #2: Light mode (45 min)
3. ✅ Bug #1: Dark mode admin (1h15)

### Jour 2 (3-4h)
4. ✅ Phase 2: Milkdown (1h30)
5. ✅ Phase 4: PWA (1h30)
6. ✅ Phase 5: Contact (45 min)

### Jour 3 (1-2h)
7. ✅ Phase 6: Tests (1h)
8. ✅ Ajustements finaux (30 min - 1h)

---

## 📝 NOTES

### Après Chaque Phase
- [ ] Commit les changements
- [ ] Tester la phase complétée
- [ ] Mettre à jour cette checklist
- [ ] Passer à la phase suivante

### Avant de Merger
- [ ] Tous les tests passent
- [ ] Toutes les checkboxes cochées
- [ ] Code review effectué
- [ ] Validation client obtenue

---

## 🚀 COMMANDES UTILES

### Développement
```bash
npm run dev          # Lancer en mode dev
npm run build        # Builder pour production
npm start            # Lancer en production
npm run lint         # Vérifier le code
```

### Git
```bash
git status                                    # Voir les changements
git add .                                     # Ajouter tous les fichiers
git commit -m "fix: description"              # Commit
git push origin bugfix/ui-improvements-and-features  # Push
```

### Tests PWA
```bash
npm run build        # Builder
npm start            # Lancer
# Puis ouvrir Chrome DevTools > Application
```

---

## ✅ VALIDATION FINALE

Avant de considérer le travail terminé:

- [ ] Tous les bugs sont corrigés
- [ ] Toutes les features sont implémentées
- [ ] Tous les tests passent
- [ ] Le code est propre et documenté
- [ ] Les commits sont clairs
- [ ] La branche est prête à merger
- [ ] Le client a validé

---

**Bonne chance!** 🚀

*Cochez les cases au fur et à mesure de votre progression.*
