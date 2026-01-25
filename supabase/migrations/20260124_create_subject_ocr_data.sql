-- Table pour stocker les données OCR des sujets
CREATE TABLE IF NOT EXISTS subject_ocr_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  ocr_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_subject_ocr_data_subject_id ON subject_ocr_data(subject_id);

-- RLS (Row Level Security)
ALTER TABLE subject_ocr_data ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs peuvent voir les OCR des sujets auxquels ils ont accès
CREATE POLICY "Users can view OCR data for accessible subjects" ON subject_ocr_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_subject_access ua
      WHERE ua.subject_id = subject_ocr_data.subject_id
        AND ua.user_id = auth.uid()
        AND (ua.expires_at IS NULL OR ua.expires_at > NOW())
    )
    OR EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = subject_ocr_data.subject_id
        AND s.is_free = true
    )
  );

-- Politique : seul le système peut insérer des données OCR
CREATE POLICY "System can insert OCR data" ON subject_ocr_data
  FOR INSERT
  WITH CHECK (false); -- Désactivé en insertion directe, géré par le serveur

-- Politique : seul le système peut mettre à jour les données OCR
CREATE POLICY "System can update OCR data" ON subject_ocr_data
  FOR UPDATE
  WITH CHECK (false); -- Désactivé en mise à jour directe, géré par le serveur

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subject_ocr_data_updated_at
  BEFORE UPDATE ON subject_ocr_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
