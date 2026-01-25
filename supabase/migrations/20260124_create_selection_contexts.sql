-- Table simple pour stocker les contextes de sélection
CREATE TABLE IF NOT EXISTS selection_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES subject_questions(id) ON DELETE CASCADE,
  selection_rect JSONB NOT NULL,
  zoom INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_selection_contexts_question_id ON selection_contexts(question_id);
CREATE INDEX idx_selection_contexts_subject_id ON selection_contexts(subject_id);

-- RLS (Row Level Security)
ALTER TABLE selection_contexts ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs peuvent voir leurs propres sélections
CREATE POLICY "Users can view own selection contexts" ON selection_contexts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_subject_access ua
      WHERE ua.subject_id = selection_contexts.subject_id
        AND ua.user_id = auth.uid()
        AND (ua.expires_at IS NULL OR ua.expires_at > NOW())
    )
    OR EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = selection_contexts.subject_id
        AND s.is_free = true
    )
  );

-- Politique : les utilisateurs peuvent insérer leurs sélections
CREATE POLICY "Users can insert own selection contexts" ON selection_contexts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_subject_access ua
      WHERE ua.subject_id = selection_contexts.subject_id
        AND ua.user_id = auth.uid()
        AND (ua.expires_at IS NULL OR ua.expires_at > NOW())
    )
    OR EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = selection_contexts.subject_id
        AND s.is_free = true
    )
  );
