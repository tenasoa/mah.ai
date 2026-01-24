'use server';

import { createClient } from '@/lib/supabase/server';

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function createSubjectQuestion(params: {
  subjectId: string;
  questionText: string;
  selectionRect: SelectionRect | null;
  zoom: number;
}) {
  const supabase = await createClient();
  const { subjectId, questionText, selectionRect, zoom } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'auth_required' };
  }

  const { data, error } = await supabase
    .from('subject_questions')
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      question_text: questionText,
      selection_rect: selectionRect,
      zoom,
    })
    .select('id, question_text, selection_rect, zoom, created_at')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function listSubjectQuestions(subjectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'auth_required' };
  }

  const { data, error } = await supabase
    .from('subject_questions')
    .select('id, question_text, selection_rect, zoom, created_at')
    .eq('subject_id', subjectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}
