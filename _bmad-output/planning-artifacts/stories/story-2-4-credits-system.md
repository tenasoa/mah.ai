---
story_id: 2-4
epic_id: 2
title: "Système de Crédits / Déblocage"
status: "review"
assigned_to: "Dev Team"
created_at: 2026-01-23
updated_at: 2026-01-23
---

# Story 2.4: Système de Crédits / Déblocage

**Status:** Review 🔍
**Epic:** 2 - Dashboard Bento & Exploration
**Priority:** High
**Effort:** 5 points

## Objective

Permettre aux élèves de débloquer des sujets à l'unité en utilisant un solde de crédits virtuel, ou d'activer des pass temporaires. C'est le cœur du modèle économique "Freemium / Pay-as-you-go".

## Acceptance Criteria

- [x] **AC1:** Table `user_credits` et `transactions` existantes et sécurisées.
- [x] **AC2:** Affichage du solde de crédits dans la Navbar et le Dashboard.
- [x] **AC3:** Action serveur `unlockSubject(subjectId)` qui vérifie le solde et déduit les crédits.
- [x] **AC4:** Modal de confirmation de déblocage (coût vs solde actuel).
- [x] **AC5:** Mise à jour immédiate de l'accès (`user_access`) et redirection vers le contenu complet.
- [x] **AC6:** Gestion des erreurs (Solde insuffisant -> Redirection vers recharge).

## Implementation Details

### Database Schema

1.  **Table `profiles`** (update): Ajout colonne `credits_balance` (integer, default 0).
2.  **Table `transactions`**:
    *   `id` (uuid)
    *   `user_id` (uuid)
    *   `amount` (int, negatif pour dépense, positif pour achat)
    *   `type` (enum: 'unlock', 'purchase', 'bonus', 'refund')
    *   `reference_id` (uuid, ex: subject_id)
    *   `created_at` (timestamp)

### UI Components

1.  **`CreditBalance`**: Composant badge affichant le solde dans la navbar.
2.  **`UnlockModal`**: Dialog shadcn/ui pour confirmer l'achat.
3.  **`SubjectTeaser`** (Update): Brancher le bouton "Débloquer" sur le `UnlockModal`.

### Server Actions

- `getCreditsBalance()`
- `unlockSubject(subjectId)`: Transaction atomique (si possible via RPC Supabase ou transaction SQL).

## Technical Notes

- Utiliser une fonction PostgreSQL `purchase_subject` pour garantir l'atomicité : vérifier solde > déduire > ajouter accès > logger transaction.

## Testing Strategy

- Unit: Test du composant `UnlockModal`.
- Integration: Test de la fonction RPC `purchase_subject` avec divers cas (solde suffisant, insuffisant, déjà acheté).
