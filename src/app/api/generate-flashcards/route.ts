import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PERPLEXITY_CONFIG, callPerplexityAPI } from "@/lib/perplexity";

interface Flashcard {
  question: string;
  answer: string;
}

const MAX_FLASHCARDS = 10;
const MAX_CONTENT_LENGTH = 14000;

function cleanText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFlashcardsFromText(raw: string): Flashcard[] {
  const extractCandidate = () => {
    const fenced = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();

    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start >= 0 && end > start) return raw.slice(start, end + 1);

    return raw;
  };

  const candidate = extractCandidate();
  let parsed: unknown;

  try {
    parsed = JSON.parse(candidate);
  } catch {
    return [];
  }

  const items = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { cards?: unknown[] }).cards)
      ? (parsed as { cards: unknown[] }).cards
      : [];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = String((item as { question?: unknown }).question || "").trim();
      const answer = String((item as { answer?: unknown }).answer || "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is Flashcard => Boolean(item))
    .slice(0, MAX_FLASHCARDS);
}

function buildFallbackFlashcards(content: string): Flashcard[] {
  const sanitized = cleanText(content);
  const sentences = sanitized
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 24);

  const cards: Flashcard[] = [];

  for (let i = 0; i < sentences.length && cards.length < 6; i += 1) {
    const current = sentences[i];
    const next = sentences[i + 1];
    cards.push({
      question: `Explique cette idée: "${current.slice(0, 120)}${current.length > 120 ? "..." : ""}"`,
      answer: next || current,
    });
  }

  if (cards.length === 0) {
    cards.push({
      question: "Quel est l'objectif principal de ce sujet ?",
      answer: sanitized.slice(0, 220) || "Relis l'introduction du sujet pour identifier l'objectif.",
    });
  }

  return cards.slice(0, MAX_FLASHCARDS);
}

async function hasSubjectAccess(subjectId: string, userId: string) {
  const supabase = await createClient();

  const { data: subject } = await supabase
    .from("subjects")
    .select("is_free, uploaded_by")
    .eq("id", subjectId)
    .maybeSingle();

  if (!subject) return { ok: false, reason: "subject_not_found" as const };
  if (subject.is_free || subject.uploaded_by === userId) return { ok: true as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", userId)
    .maybeSingle();

  const roles = (profile?.roles as string[]) || [];
  const isPrivileged =
    roles.includes("admin") ||
    roles.includes("superadmin") ||
    roles.includes("validator");

  if (isPrivileged) return { ok: true as const };

  const { data: access } = await supabase
    .from("user_subject_access")
    .select("id")
    .eq("user_id", userId)
    .eq("subject_id", subjectId)
    .or("expires_at.is.null,expires_at.gt.now()")
    .maybeSingle();

  return { ok: Boolean(access), reason: "access_denied" as const };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const payload = await request.json();
    const subjectId = typeof payload.subjectId === "string" ? payload.subjectId : "";
    const subjectContent = typeof payload.subjectContent === "string" ? payload.subjectContent : "";

    if (!subjectId || !subjectContent.trim()) {
      return NextResponse.json(
        { error: "subjectId et subjectContent sont requis." },
        { status: 400 },
      );
    }

    const access = await hasSubjectAccess(subjectId, user.id);
    if (!access.ok) {
      const status = access.reason === "subject_not_found" ? 404 : 403;
      return NextResponse.json(
        { error: access.reason === "subject_not_found" ? "Sujet introuvable." : "Accès refusé." },
        { status },
      );
    }

    const truncatedContent = subjectContent.slice(0, MAX_CONTENT_LENGTH);

    if (!PERPLEXITY_CONFIG.apiKey) {
      const fallbackCards = buildFallbackFlashcards(truncatedContent);
      return NextResponse.json({
        cards: fallbackCards,
        source: "fallback",
        warning: "Génération locale utilisée (clé IA absente).",
      });
    }

    const prompt = `Transforme ce contenu en ${MAX_FLASHCARDS} flashcards pédagogiques maximum.

Exigences:
- Réponse strictement en JSON (sans texte autour)
- Format: [{"question":"...","answer":"..."}]
- Questions courtes, réponses claires (1 à 3 phrases)
- Français, niveau examen

Contenu:
${truncatedContent}`;

    const aiResponse = await callPerplexityAPI({
      model: PERPLEXITY_CONFIG.model,
      messages: [
        {
          role: "system",
          content:
            "Tu génères uniquement du JSON valide pour des flashcards. Aucune phrase hors JSON.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.4,
    });

    const content = aiResponse.choices?.[0]?.message?.content || "";
    const cards = parseFlashcardsFromText(content);

    if (cards.length === 0) {
      const fallbackCards = buildFallbackFlashcards(truncatedContent);
      return NextResponse.json({
        cards: fallbackCards,
        source: "fallback",
        warning: "Format IA invalide, fallback appliqué.",
      });
    }

    return NextResponse.json({
      cards,
      source: "ai",
    });
  } catch (error) {
    console.error("Flashcards generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération des flashcards." },
      { status: 500 },
    );
  }
}
