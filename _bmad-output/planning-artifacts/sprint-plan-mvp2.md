---
title: "MVP 2 Sprint Plan"
date: "2026-01-26"
owner: "Tenasoa"
status: "proposed"
method: "BMAD"
---

# MVP 2 — Plan de sprints (priorisé)

Ce plan transforme les idées en sprints numérotés, avec priorité décroissante.  
Objectif : implémenter progressivement sans casser l’existant.

---

## Sprint 1 — Fondations rôles & gouvernance
**Objectif :** sécuriser les permissions, flux de validation, et règles business.
- **Rôles & règles**
  - SuperAdmin & Administrateurs = accès total, crédits illimités, gestion complète, ajout de sujets.
  - Contributeurs = ajout/modification de leurs sujets ; état "brouillon" jusqu'à validation.
  - Utilisateurs = consultation et achat de sujets (ne peuvent plus ajouter de sujets).
  - Visiteurs = consultation catalogue uniquement (pas de compte requis).
  - Validateurs = valider/refuser/retourner les sujets.
  - Correcteurs = corriger des sujets et vendre ces corrections.
- **Règles business**
  - Vente de sujets : 20% commission site (100% si sujet SuperAdmin).
  - Vente de corrections : 15% commission site.
- **Modèles de données**
  - Tables/colonnes nécessaires (sujets, statuts, rôles, ventes, commissions).
  - RLS + policies par rôle.
- **Admin UI**
  - Ajout des statuts et actions selon les rôles.

---

## Sprint 2 — Ticket “demande de sujet” + remboursement auto
**Objectif :** permettre la création de ticket avec frais et remboursement conditionnel.
- **Côté utilisateur**
  - Si pas de résultat → création ticket (coût 2 crédits).
  - Ticket lié à la recherche (matière, année, série).
- **Côté admin**
  - Page de gestion des tickets (liste, statuts, actions).
- **Remboursement**
  - Si aucun sujet correspondant en 3 jours → crédits remboursés automatiquement.

---

## Sprint 3 — Tableau de bord des membres
**Objectif :** visibilité complète par rôle.
- **Utilisateurs**
  - Historique mouvements crédits (ventes, achats sujets, achats crédits).
- **Contributeurs**
  - Sujets créés + statut.
- **Validateurs**
  - Sujets validés/refusés/retournés.
- **Correcteurs**
  - Réponses corrigées.
  - Réponses utilisateurs en attente de correction.
- **SuperAdmin**
  - Vue complète multi‑rôles.

---

## Sprint 4 — Messagerie instantanée
**Objectif :** communication directe entre utilisateurs
- Chat temps réel
- Historique type “WhatsApp”.
- Notifications sur nouveaux messages.

---

## Sprint 5 — Expérience lecture & découverte
**Objectif :** améliorer la consommation et la conversion.
- Accès Visiteur : Bouton "Consulter le catalogue" sur la Landing Page.
- UX Auth : Redirection automatique vers Login après confirmation email.
- UI : Nouvelle animation de chargement (design moderne).
- Design : Implémentation complète du Dark Mode.
- Mobile : Refonte Responsive "Native-like" (navigation, touch).
- Didacticiel onboarding (nouveaux utilisateurs).
- Lecteur “Focus” (plein écran + progression).
- Sauvegarde “Reprendre plus tard”.
- Aperçu corrigé teaser (IA flouté).

---

## Sprint 6 — Recherche intelligente & communauté
**Objectif :** découverte + engagement.
- Recherche autocomplete + filtres rapides.
- Commentaires/astuces par sujet (modération légère).

---

## Notes d’implémentation
- **Priorité** : Sprints 1 → 3 (structure + business).
- **Risques** : RLS, remboursements automatiques, transactions atomiques.
- **KPIs** : taux conversion ticket→sujet, % remboursements, engagement messagerie.

