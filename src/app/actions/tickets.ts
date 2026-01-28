'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SubjectRequest {
  id: string;
  user_id: string;
  matiere: string;
  year: number;
  serie?: string;
  level?: string;
  status: 'pending' | 'fulfilled' | 'expired' | 'refunded';
  created_at: string;
  fulfilled_at?: string;
  subject_id?: string;
  admin_comment?: string;
  profiles?: {
    pseudo: string;
    email: string;
  };
}

/**
 * Creates a new subject request (deducts 2 credits)
 */
export async function createSubjectRequest(params: {
  matiere: string;
  year: number;
  serie?: string;
  level?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('create_subject_request', {
    p_matiere: params.matiere,
    p_year: params.year,
    p_serie: params.serie || null,
    p_level: params.level || null
  });

  if (error) {
    console.error('Create request error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return data as { success: boolean; request_id?: string; error?: string; new_balance?: number };
}

/**
 * Gets all requests for the current user
 */
export async function getMyRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data, error } = await supabase
    .from('subject_requests')
    .select('*, subjects(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get my requests error:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

/**
 * Admin: Get all requests
 */
export async function getAllRequests(status?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('subject_requests')
    .select('*, user:user_id(pseudo, email), subjects(title)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Get all requests error:', JSON.stringify(error, null, 2));
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

/**
 * Admin: Get requests statistics
 */
export async function getRequestStats() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subject_requests')
    .select('status');

  if (error) return { pending: 0, fulfilled: 0, refunded: 0, expired: 0 };

  const stats = {
    pending: 0,
    fulfilled: 0,
    refunded: 0,
    expired: 0,
    total: data.length
  };

  data.forEach(req => {
    if (req.status === 'pending') stats.pending++;
    else if (req.status === 'fulfilled') stats.fulfilled++;
    else if (req.status === 'refunded') stats.refunded++;
    else if (req.status === 'expired') stats.expired++;
  });

  return stats;
}

/**
 * Admin: Mark a request as fulfilled
 */
export async function fulfillRequest(requestId: string, subjectId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('subject_requests')
    .update({
      status: 'fulfilled',
      subject_id: subjectId,
      fulfilled_at: new Date().toISOString()
    })
    .eq('id', requestId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/tickets');
  return { success: true };
}

/**
 * Admin: Refund a request
 */
export async function refundRequest(requestId: string, reason: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('refund_subject_request', {
    p_request_id: requestId,
    p_reason: reason
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/tickets');
  return data as { success: boolean; error?: string };
}

/**
 * Admin: Run batch auto-refund for expired tickets
 */
export async function runAutoRefund() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('process_expired_requests');

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/tickets');
  return data as { success: boolean; processed_count: number };
}
