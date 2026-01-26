-- Table pour les soumissions de sujets par les utilisateurs
CREATE TABLE IF NOT EXISTS subject_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    correction_type VARCHAR(10) NOT NULL CHECK (correction_type IN ('human', 'ai')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    correction TEXT,
    correction_score INTEGER,
    correction_feedback TEXT,
    corrected_by UUID REFERENCES profiles(id),
    corrected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les réponses IA générées
CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    subject_content TEXT NOT NULL,
    response_type VARCHAR(10) NOT NULL CHECK (response_type IN ('direct', 'detailed')),
    response TEXT NOT NULL,
    credits_used INTEGER NOT NULL DEFAULT 0,
    model_used VARCHAR(50),
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_subject_submissions_user_id ON subject_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_subject_submissions_subject_id ON subject_submissions(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_submissions_status ON subject_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_subject_id ON ai_responses(subject_id);

-- RLS (Row Level Security) pour subject_submissions
ALTER TABLE subject_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions" ON subject_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON subject_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON subject_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" ON subject_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (roles && ARRAY['admin', 'superadmin', 'validator'])
        )
    );

CREATE POLICY "Admins can update all submissions" ON subject_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (roles && ARRAY['admin', 'superadmin', 'validator'])
        )
    );

-- RLS (Row Level Security) pour ai_responses
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI responses" ON ai_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI responses" ON ai_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI responses" ON ai_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (roles && ARRAY['admin', 'superadmin'])
        )
    );

-- Fonction pour déduire des crédits (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
    -- Vérifier si l'utilisateur est premium
    DECLARE 
        user_sub TEXT;
        user_credits INTEGER;
    BEGIN
        SELECT subscription_status, credits_balance INTO user_sub, user_credits
        FROM profiles 
        WHERE id = deduct_credits.user_id;
        
        -- Si l'utilisateur est premium, ne pas déduire
        IF user_sub = 'premium' THEN
            RETURN QUERY SELECT true, 'Utilisateur premium, aucun crédit déduit'::TEXT;
            RETURN;
        END IF;
        
        -- Vérifier si l'utilisateur a assez de crédits
        IF user_credits < amount THEN
            RETURN QUERY SELECT false, 'Crédits insuffisants'::TEXT;
            RETURN;
        END IF;
        
        -- Déduire les crédits
        UPDATE profiles 
        SET credits_balance = credits_balance - amount,
            updated_at = NOW()
        WHERE id = deduct_credits.user_id;
        
        RETURN QUERY SELECT true, 'Crédits déduits avec succès'::TEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subject_submissions_updated_at
    BEFORE UPDATE ON subject_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
