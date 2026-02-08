'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { awardContributionMilestones, tryAwardBadge } from './badges';
import type {
  Subject,
  SubjectCard,
  SubjectFilters,
  SubjectSortOptions,
  SubjectsResponse,
  SubjectWithAccess,
  SubjectMetadata,
  ExamType,
  SubjectStatus,
} from '@/lib/types/subject';

// =====================================================
// Get Subjects (Catalog)
// =====================================================

interface GetSubjectsParams {
  filters?: SubjectFilters;
  sort?: SubjectSortOptions;
  page?: number;
  limit?: number;
}

export async function getSubjects(params: GetSubjectsParams = {}): Promise<{
  data: SubjectsResponse | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { filters, sort, page = 1, limit = 12 } = params;

  const getErrorMessage = (err: unknown) => {
    if (!err) return 'Erreur inconnue';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || err.name;
    if (typeof err === 'object') {
      const message =
        (err as { message?: string }).message ||
        (err as { details?: string }).details ||
        (err as { hint?: string }).hint ||
        (err as { code?: string }).code;
      if (message) return message;
      try {
        return JSON.stringify(err);
      } catch {
        return String(err);
      }
    }
    return String(err);
  };

  try {
    console.log('🔍 Starting getSubjects with params:', { filters, sort, page, limit });
    
    // Build query
    let query = supabase
      .from('subjects')
      .select(
        `
        id,
        title,
        exam_type,
        year,
        matiere,
        matiere_display,
        serie,
        niveau,
        thumbnail_url,
        content_markdown,
        is_free,
        credit_cost,
        view_count,
        status,
        uploaded_by,
        created_at
      `,
        { count: 'exact' }
      );

    // Get current user's access and role if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    let userProfile = null;
    if (user) {
      const { data } = await supabase.from('profiles').select('roles').eq('id', user.id).maybeSingle();
      userProfile = data;
    }
    const roles = (userProfile?.roles as string[]) || [];
    const isAdmin = roles.includes('admin') || roles.includes('superadmin') || roles.includes('validator');

    // Default behavior for catalog (students only see published)
    if (!isAdmin) {
      query = query.eq('status', 'published');
    } else if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Apply other filters
    if (filters) {
      if (filters.exam_type) {
        if (Array.isArray(filters.exam_type)) {
          query = query.in('exam_type', filters.exam_type);
        } else {
          query = query.eq('exam_type', filters.exam_type);
        }
      }

      if (filters.year) {
        if (Array.isArray(filters.year)) {
          query = query.in('year', filters.year);
        } else {
          query = query.eq('year', filters.year);
        }
      }

      if (filters.matiere) {
        if (Array.isArray(filters.matiere)) {
          query = query.in('matiere', filters.matiere);
        } else {
          query = query.eq('matiere', filters.matiere);
        }
      }

      if (filters.serie) {
        if (Array.isArray(filters.serie)) {
          query = query.in('serie', filters.serie);
        } else {
          query = query.eq('serie', filters.serie);
        }
      }

      if (filters.niveau) {
        if (Array.isArray(filters.niveau)) {
          query = query.in('niveau', filters.niveau);
        } else {
          query = query.eq('niveau', filters.niveau);
        }
      }

      if (filters.is_free !== undefined) {
        query = query.eq('is_free', filters.is_free);
      }

      if (filters.search) {
        query = query.textSearch('search_vector', filters.search, {
          type: 'websearch',
          config: 'french',
        });
      }

      if (filters.uploaded_by) {
        query = query.eq('uploaded_by', filters.uploaded_by);
      }
    }

    // Apply sorting
    const sortField = sort?.field || 'year';
    const sortDirection = sort?.direction || 'desc';
    query = query.order(sortField, { ascending: sortDirection === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: subjects, error, count } = await query;

    console.log('📊 Query executed:', { 
      hasError: !!error, 
      errorDetails: error,
      dataLength: subjects?.length,
      count 
    });

    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error('❌ Error fetching subjects:', errorMessage, error);
      return { data: null, error: errorMessage };
    }

    // Reuse existing user variable for access check
    let userAccess: Set<string> = new Set();
    const authorProfiles: Record<string, { pseudo: string }> = {};

    if (subjects && subjects.length > 0) {
      // 1. Fetch access
      if (user) {
        const subjectIds = subjects.map((s) => s.id);
        const { data: accessData } = await supabase
          .from('user_subject_access')
          .select('subject_id')
          .eq('user_id', user.id)
          .in('subject_id', subjectIds)
          .or('expires_at.is.null,expires_at.gt.now()');
  
        if (accessData) {
          userAccess = new Set(accessData.map((a) => a.subject_id));
        }
      }

      // 2. Fetch profiles manually
      const uploadedByList = subjects
        .map(s => s.uploaded_by)
        .filter((id): id is string => !!id);
        
      if (uploadedByList.length > 0) {
        const uniqueIds = Array.from(new Set(uploadedByList));
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, pseudo')
          .in('id', uniqueIds);
          
        if (profilesData) {
          profilesData.forEach(p => {
            authorProfiles[p.id] = { pseudo: p.pseudo };
          });
        }
      }
    }

    // Add has_access to subjects and map profiles
    const subjectsWithAccess: SubjectCard[] = (subjects || []).map((subject) => ({
      ...subject,
      has_access: subject.is_free || userAccess.has(subject.id),
      profiles: subject.uploaded_by ? authorProfiles[subject.uploaded_by] : null
    }));

    return {
      data: {
        subjects: subjectsWithAccess,
        total: count || 0,
        page,
        limit,
        has_more: count ? from + subjects!.length < count : false,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    console.error('Error in getSubjects:', errorMessage, err);
    return { data: null, error: errorMessage };
  }
}

// =====================================================
// Get Subject Metadata (for filters)
// =====================================================

export async function getSubjectMetadata(): Promise<{
  data: SubjectMetadata | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const getErrorMessage = (err: unknown) => {
    if (!err) return 'Erreur inconnue';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || err.name;
    if (typeof err === 'object') {
      const message =
        (err as { message?: string }).message ||
        (err as { details?: string }).details ||
        (err as { hint?: string }).hint ||
        (err as { code?: string }).code;
      if (message) return message;
      try {
        return JSON.stringify(err);
      } catch {
        return String(err);
      }
    }
    return String(err);
  };

  try {
    console.log('🔍 Starting getSubjectMetadata...');
    
    // Get all published subjects for metadata
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('exam_type, year, matiere, matiere_display, serie, niveau')
      .eq('status', 'published');

    console.log('📊 Subjects query result:', { error, count: subjects?.length });

    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error('❌ Error in subjects query:', errorMessage, error);
      return { data: null, error: errorMessage };
    }

    // Process metadata
    const examTypeCounts = new Map<ExamType, number>();
    const yearCounts = new Map<number, number>();
    const matiereCounts = new Map<string, { label: string; count: number }>();
    const serieCounts = new Map<string, number>();
    const niveauCounts = new Map<string, number>();

    console.log('📈 Processing metadata for', subjects?.length, 'subjects...');
    
    subjects?.forEach((subject) => {
      // Exam types
      examTypeCounts.set(
        subject.exam_type,
        (examTypeCounts.get(subject.exam_type) || 0) + 1
      );

      // Years
      yearCounts.set(subject.year, (yearCounts.get(subject.year) || 0) + 1);

      // Matieres
      const matiereData = matiereCounts.get(subject.matiere);
      if (matiereData) {
        matiereData.count++;
      } else {
        matiereCounts.set(subject.matiere, {
          label: subject.matiere_display,
          count: 1,
        });
      }

      // Series
      if (subject.serie) {
        serieCounts.set(subject.serie, (serieCounts.get(subject.serie) || 0) + 1);
      }

      // Niveaux
      if (subject.niveau) {
        niveauCounts.set(subject.niveau, (niveauCounts.get(subject.niveau) || 0) + 1);
      }
    });

    console.log('✅ Metadata processing completed');

    const examTypeLabels: Record<ExamType, string> = {
      cepe: 'CEPE',
      bepc: 'BEPC',
      baccalaureat: 'Baccalauréat',
      licence: 'Licence',
      master: 'Master',
      doctorat: 'Doctorat',
      dts: 'DTS',
      bts: 'BTS',
      concours: 'Concours',
      other: 'Autre',
    };

    return {
      data: {
        exam_types: Array.from(examTypeCounts.entries())
          .map(([value, count]) => ({
            value,
            label: examTypeLabels[value] || value,
            count,
          }))
          .sort((a, b) => b.count - a.count),

        years: Array.from(yearCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.value - a.value),

        matieres: Array.from(matiereCounts.entries())
          .map(([value, data]) => ({
            value,
            label: data.label,
            count: data.count,
          }))
          .sort((a, b) => b.count - a.count),

        series: Array.from(serieCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value)),

        niveaux: Array.from(niveauCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    console.error('Error in getSubjectMetadata:', errorMessage, err);
    return { data: null, error: errorMessage };
  }
}

// =====================================================
// Get Single Subject
// =====================================================

export async function getSubjectById(
  id: string,
  options: { incrementView?: boolean } = {}
): Promise<{
  data: SubjectWithAccess | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const shouldIncrementView = options.incrementView !== false;

  try {
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*, status, revision_comment')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('❌ getSubjectById Error:', error.message, error.code, 'ID:', id);
      return { data: null, error: error.message };
    }

    if (!subject) {
      return { data: null, error: 'Sujet non trouvé' };
    }

    // Check user access
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let hasAccess = subject.is_free;
    let accessExpiresAt: string | null = null;

    if (user) {
      // 1. Check if user is admin (Automatic access)
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();

      const roles = (profile?.roles as string[]) || [];
      if (
        roles.includes('admin') ||
        roles.includes('superadmin') ||
        roles.includes('validator') ||
        subject.uploaded_by === user.id
      ) {
        hasAccess = true;
      } 
      // 2. Check regular access if not admin and not free
      else if (!subject.is_free) {
        const { data: accessData } = await supabase
          .from('user_subject_access')
          .select('expires_at')
          .eq('user_id', user.id)
          .eq('subject_id', id)
          .or('expires_at.is.null,expires_at.gt.now()')
          .maybeSingle();

        if (accessData) {
          hasAccess = true;
          accessExpiresAt = accessData.expires_at;
        }
      }
    }

    if (shouldIncrementView) {
      // Increment view count
      // Pass user ID to ensure unique counting per user (logic handled in SQL function)
      const { error: viewError } = await supabase.rpc('increment_subject_view', {
        p_subject_id: id,
        p_user_id: user?.id || null,
      });

      if (viewError) {
        const { error: fallbackError } = await supabase.rpc('increment_subject_view', {
          p_subject_id: id,
        });
        if (fallbackError) {
          console.error('❌ Error incrementing view count:', fallbackError);
        }
      }

      // If we just incremented (or tried to), the returned subject data might be stale 
      // because we fetched it BEFORE the RPC call.
      // However, fetching again is expensive.
      // Ideally, the RPC should return the new count or a "did_increment" boolean.
      // For now, let's just leave it as is - the count will update on next refresh.
      // Or we could optimistically increment if no error occurred (but we don't know if it was deduped).
      
      // To be perfectly accurate without refetching, we would need the RPC to return "incremented: true".
      // Let's refetch just the view_count to be safe and accurate for the UI.
      const { data: updatedCount } = await supabase
        .from('subjects')
        .select('view_count')
        .eq('id', id)
        .maybeSingle();
        
      if (updatedCount) {
          subject.view_count = updatedCount.view_count;
      }
    }

    return {
      data: {
        ...subject,
        has_access: hasAccess,
        access_expires_at: accessExpiresAt,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error in getSubjectById:', err);
    return { data: null, error: 'Erreur lors du chargement du sujet' };
  }
}

// =====================================================
// Update Subject Content
// =====================================================

export async function saveSubjectMarkdown(
  id: string,
  content: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentification requise' };
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle();

    const roles = (profile?.roles as string[]) || [];
    const isAdmin =
      roles.includes('admin') ||
      roles.includes('superadmin') ||
      roles.includes('validator');
    const isContributor = roles.includes('contributor');

    if (isAdmin) {
      // Admins can edit anything
      const { error } = await supabase
        .from('subjects')
        .update({ content_markdown: content, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
    } else if (isContributor) {
      // Contributors can only edit their own subjects.
      // If a published subject is edited, it is sent back to pending validation.
      const { data: subject } = await supabase
        .from('subjects')
        .select('uploaded_by, status')
        .eq('id', id)
        .maybeSingle();

      if (!subject) {
        return { success: false, error: 'Sujet introuvable' };
      }

      if (subject.uploaded_by !== user.id) {
        return {
          success: false,
          error: 'Vous pouvez consulter ce sujet, mais vous ne pouvez pas le modifier.',
        };
      }

      let newStatus = subject.status;
      if (subject.status === 'published' || subject.status === 'rejected') {
        newStatus = 'pending';
      }

      const { error } = await supabase
        .from('subjects')
        .update({ 
            content_markdown: content, 
            updated_at: new Date().toISOString(), 
            status: newStatus 
        })
        .eq('id', id);

      if (error) return { success: false, error: error.message };

      // Reward contribution badges without blocking save flow.
      await awardContributionMilestones(user.id);
    } else {
      return { success: false, error: 'Permission refusée' };
    }

    revalidatePath('/admin/subjects');
    revalidatePath(`/subjects/${id}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('Error saving markdown:', err);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}

const slugifyMatiere = (label: string): string =>
  label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export async function updateSubjectMetadata(
  id: string,
  params: {
    title: string;
    exam_type: ExamType;
    year: number;
    matiere_display: string;
    level?: string;
    concours_type?: string;
    serie_departement?: string;
    is_free?: boolean;
  },
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentification requise' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle();

    const roles = (profile?.roles as string[]) || [];
    const isAdminLike =
      roles.includes('admin') ||
      roles.includes('superadmin') ||
      roles.includes('validator');
    const isContributor = roles.includes('contributor');

    if (!isAdminLike && !isContributor) {
      return { success: false, error: 'Permission refusée' };
    }

    const { data: subject } = await supabase
      .from('subjects')
      .select('uploaded_by, status, exam_metadata')
      .eq('id', id)
      .maybeSingle();

    if (!subject) {
      return { success: false, error: 'Sujet introuvable' };
    }

    if (isContributor && !isAdminLike) {
      if (subject.uploaded_by !== user.id) {
        return { success: false, error: 'Permission refusée' };
      }

      // Note: On autorise l'édition des métadonnées même si publié, 
      // mais cela changera le statut en 'pending' plus bas.
    }

    const level = params.level?.trim() || '';
    const concoursType = params.concours_type?.trim() || '';
    const serieDepartement = params.serie_departement?.trim() || '';

    const nextExamMetadata: Record<string, any> = {
      ...(subject.exam_metadata || {}),
    };

    if (level) {
      nextExamMetadata.level = level;
    } else {
      delete nextExamMetadata.level;
    }

    if (concoursType) {
      nextExamMetadata.concours_type = concoursType;
    } else {
      delete nextExamMetadata.concours_type;
    }

    if (serieDepartement) {
      nextExamMetadata.serie_departement = serieDepartement;
    } else {
      delete nextExamMetadata.serie_departement;
    }

    const nextStatus = isAdminLike ? subject.status : 'pending';

    const { error } = await supabase
      .from('subjects')
      .update({
        title: params.title,
        exam_type: params.exam_type,
        year: params.year,
        matiere_display: params.matiere_display,
        matiere: slugifyMatiere(params.matiere_display),
        serie: serieDepartement || null,
        niveau: level || null,
        is_free: Boolean(params.is_free),
        exam_metadata: nextExamMetadata,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/subjects');
    revalidatePath(`/subjects/${id}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('Error updating metadata:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour',
    };
  }
}

export async function duplicateSubject(
  sourceId: string,
): Promise<{ data: Subject | null; error: string | null }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Authentification requise' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle();

    const roles = (profile?.roles as string[]) || [];
    const canDuplicate =
      roles.includes('admin') ||
      roles.includes('superadmin') ||
      roles.includes('validator') ||
      roles.includes('contributor');

    if (!canDuplicate) {
      return { data: null, error: 'Permission refusée' };
    }

    const { data: source, error: sourceError } = await supabase
      .from('subjects')
      .select(
        'title, description, exam_type, year, session, matiere, matiere_display, serie, niveau, exam_metadata, content_markdown, content_html, thumbnail_url, preview_text, is_free, credit_cost, tags'
      )
      .eq('id', sourceId)
      .maybeSingle();

    if (sourceError) {
      return { data: null, error: sourceError.message };
    }

    if (!source) {
      return { data: null, error: 'Sujet source introuvable' };
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        ...source,
        title: `${source.title} (copie)`,
        status: 'draft',
        uploaded_by: user.id,
        view_count: 0,
      })
      .select('*')
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/admin/subjects');
    return { data, error: null };
  } catch (err) {
    console.error('Error duplicating subject:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Erreur lors de la duplication',
    };
  }
}

// =====================================================
// Create New Subject
// =====================================================

export async function createSubject(params: {
  title: string;
  exam_type: ExamType;
  year: number;
  matiere: string;
  matiere_display: string;
  serie?: string;
  niveau?: string;
  is_free?: boolean;
  credit_cost?: number;
  exam_metadata?: any;
  status?: SubjectStatus;
  requestId?: string;
}): Promise<{ data: Subject | null; error: string | null }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Authentification requise' };
    }

    // Check roles
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle();

    const roles = (profile?.roles as string[]) || [];
    const isContributor = roles.includes('contributor');
    const isAdmin =
      roles.includes('admin') ||
      roles.includes('superadmin') ||
      roles.includes('validator');

    if (!isContributor && !isAdmin) {
      return { data: null, error: 'Permission refusée' };
    }

    // Contributors can only create drafts
    const status = isAdmin ? (params.status || 'published') : 'draft';

    // Extract requestId from params to avoid inserting it into subjects table
    const { requestId, ...subjectData } = params;

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        ...subjectData,
        status,
        uploaded_by: user.id,
      })
      .select('*')
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    // If there is a requestId, fulfill it
    if (requestId && data) {
      const { data: requestData } = await supabase
        .from('subject_requests')
        .update({
          status: 'fulfilled',
          subject_id: data.id,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select('user_id')
      .maybeSingle();

      // Create notification for the user
      if (requestData?.user_id) {
        await supabase.from('notifications').insert({
          user_id: requestData.user_id,
          title: 'Sujet disponible !',
          content: `Le sujet "${params.title}" que vous avez demandé est maintenant disponible sur mah.ai.`,
          type: 'info',
          metadata: { subject_id: data.id, request_id: requestId }
        });
      }
    }

    await awardContributionMilestones(user.id);

    return { data, error: null };
  } catch (err) {
    console.error('Error creating subject:', err);
    return { data: null, error: 'Erreur lors de la création' };
  }
}

// =====================================================
// Subject Validation Workflow
// =====================================================

export async function updateSubjectStatus(
  id: string,
  status: SubjectStatus,
  comment?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle();

    const roles = profile?.roles || [];
    const canValidate = roles.includes('admin') || roles.includes('superadmin') || roles.includes('validator');

    if (!canValidate) {
      return { success: false, error: 'Permission refusée' };
    }

    const { error } = await supabase
      .from('subjects')
      .update({ 
        status, 
        revision_comment: comment || null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    if (status === 'published') {
      await tryAwardBadge(user.id, 'quality_guardian');
    }

    revalidatePath('/admin/subjects');
    revalidatePath(`/subjects/${id}`);
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Validation Exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erreur de validation' };
  }
}

export async function deleteSubject(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Authentification requise' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle();

    const roles = (profile?.roles as string[]) || [];
    const isAdmin =
      roles.includes('admin') ||
      roles.includes('superadmin') ||
      roles.includes('validator');

    if (!isAdmin) return { success: false, error: 'Permission refusée' };

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Soft delete : on change le statut au lieu de supprimer la ligne
    const { error } = await supabaseAdmin
      .from('subjects')
      .update({
        status: 'rejected',
        revision_comment: 'Sujet supprimé depuis le catalogue maître',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/subjects');
    revalidatePath('/subjects');
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
