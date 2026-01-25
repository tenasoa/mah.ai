-- Ajouter une contrainte d'unicité sur question_id pour permettre l'UPSERT
ALTER TABLE selection_contexts 
ADD CONSTRAINT selection_contexts_question_id_key UNIQUE (question_id);
