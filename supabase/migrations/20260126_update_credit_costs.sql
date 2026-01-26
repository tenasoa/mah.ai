-- Migration: Update credit costs based on new requirements
-- Description: Sets specific costs for subjects, AI responses, and human corrections.

INSERT INTO public.pricing_config (action_type, cost_credits, description)
VALUES 
  ('UNLOCK_SUBJECT', 1, 'Déblocage d''un sujet d''examen'),
  ('AI_RESPONSE_COMPLETE', 2, 'Réponse de l''IA par sujet'),
  ('AI_RESPONSE_DETAILED', 4, 'Réponse de l''IA avec détails et explications'),
  ('HUMAN_CORRECTION', 5, 'Réponse de sujet par un humain')
ON CONFLICT (action_type) DO UPDATE SET 
  cost_credits = EXCLUDED.cost_credits,
  description = EXCLUDED.description;

-- Update the existing AI_RESPONSE_SHORT to be consistent if needed
UPDATE public.pricing_config 
SET cost_credits = 1 
WHERE action_type = 'AI_RESPONSE_SHORT';
