import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

  // Validate query
  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { subjects: [], error: null },
      { status: 200 }
    );
  }

  try {
    const supabase = await createClient();
    const searchQuery = query.trim();

    // Try full-text search first
    let { data: subjects, error } = await supabase
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
        is_free,
        credit_cost,
        view_count
      `
      )
      .eq('status', 'published')
      .textSearch('search_vector', searchQuery, {
        type: 'websearch',
        config: 'french',
      })
      .order('view_count', { ascending: false })
      .limit(limit);

    // Fallback to ILIKE search if FTS returns no results or errors
    if (error || !subjects || subjects.length === 0) {
      const { data: fallbackSubjects, error: fallbackError } = await supabase
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
          is_free,
          credit_cost,
          view_count
        `
        )
        .eq('status', 'published')
        .or(
          `title.ilike.%${searchQuery}%,matiere_display.ilike.%${searchQuery}%,matiere.ilike.%${searchQuery}%,serie.ilike.%${searchQuery}%`
        )
        .order('view_count', { ascending: false })
        .limit(limit);

      if (fallbackError) {
        console.error('Search fallback error:', fallbackError);
        return NextResponse.json(
          { subjects: [], error: 'Erreur de recherche' },
          { status: 500 }
        );
      }

      subjects = fallbackSubjects;
    }

    // Get user access if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userAccess: Set<string> = new Set();

    if (user && subjects && subjects.length > 0) {
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

    // Add has_access field
    const subjectsWithAccess = (subjects || []).map((subject) => ({
      ...subject,
      has_access: subject.is_free || userAccess.has(subject.id),
    }));

    return NextResponse.json(
      {
        subjects: subjectsWithAccess,
        query: searchQuery,
        count: subjectsWithAccess.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json(
      { subjects: [], error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
