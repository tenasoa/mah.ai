-- Table pour stocker les échanges avec le tuteur IA socratique
CREATE TABLE IF NOT EXISTS socratic_exchanges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES subject_questions(id) ON DELETE CASCADE NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  selection_rect JSONB,
  zoom INTEGER,
  insisted_for_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_socratic_exchanges_user_subject ON socratic_exchanges(user_id, subject_id);
CREATE INDEX idx_socratic_exchanges_question ON socratic_exchanges(question_id);
CREATE INDEX idx_socratic_exchanges_created_at ON socratic_exchanges(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE socratic_exchanges ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne voient que leurs propres échanges
CREATE POLICY "Users can view their own socratic exchanges" ON socratic_exchanges
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent insérer leurs propres échanges
CREATE POLICY "Users can insert their own socratic exchanges" ON socratic_exchanges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
