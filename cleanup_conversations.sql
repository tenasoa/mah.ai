-- Nettoyer toutes les conversations IA et questions

-- 1. Supprimer tous les échanges socratiques
DELETE FROM public.socratic_exchanges;

-- 2. Supprimer tous les contextes de sélection
DELETE FROM public.selection_contexts;

-- 3. Supprimer toutes les questions de sujets
DELETE FROM public.subject_questions;

-- 4. Réinitialiser les séquences si nécessaire (optionnel)
-- ALTER SEQUENCE public.socratic_exchanges_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.selection_contexts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.subject_questions_id_seq RESTART WITH 1;

-- 5. Vérifier le nettoyage
SELECT 
  (SELECT COUNT(*) FROM public.socratic_exchanges) as socratic_exchanges_count,
  (SELECT COUNT(*) FROM public.selection_contexts) as selection_contexts_count,
  (SELECT COUNT(*) FROM public.subject_questions) as subject_questions_count;
