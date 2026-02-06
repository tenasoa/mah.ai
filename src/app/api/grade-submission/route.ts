import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const parseJsonObject = (raw: string) => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Réponse JSON invalide");
  }
  return JSON.parse(raw.slice(start, end + 1));
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const { unzipSync, strFromU8 } = await import("fflate");
  const archive = unzipSync(new Uint8Array(arrayBuffer));
  const documentXml = archive["word/document.xml"];
  if (!documentXml) return "";
  const xml = strFromU8(documentXml);
  return xml
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
};

const extractUploadedAnswer = async (
  client: OpenAI,
  file: File,
): Promise<string> => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type;

  if (mimeType.startsWith("text/") || fileName.endsWith(".txt") || fileName.endsWith(".md")) {
    return (await file.text()).trim();
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const text = await extractTextFromDocx(file);
    if (!text) throw new Error("Le document Word est vide ou illisible");
    return text;
  }

  if (mimeType === "application/msword" || fileName.endsWith(".doc")) {
    const dataUrl = `data:application/msword;base64,${await fileToBase64(file)}`;
    const response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extrais uniquement le texte lisible du document Word .doc ci-joint.",
            },
            {
              type: "input_file",
              filename: file.name,
              file_data: dataUrl,
            },
          ],
        },
      ],
    });

    const extracted = response.output_text?.trim();
    if (!extracted) throw new Error("Impossible d'extraire le texte du document Word (.doc)");
    return extracted;
  }

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    const dataUrl = `data:application/pdf;base64,${await fileToBase64(file)}`;
    const response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extrais uniquement le texte lisible du document PDF ci-joint.",
            },
            {
              type: "input_file",
              filename: file.name,
              file_data: dataUrl,
            },
          ],
        },
      ],
    });

    const extracted = response.output_text?.trim();
    if (!extracted) throw new Error("Impossible d'extraire le texte du PDF");
    return extracted;
  }

  if (mimeType.startsWith("image/")) {
    const dataUrl = `data:${mimeType || "image/png"};base64,${await fileToBase64(file)}`;
    const response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Lis l'image et retranscris fidèlement la réponse de l'élève.",
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high",
            },
          ],
        },
      ],
    });

    const extracted = response.output_text?.trim();
    if (!extracted) throw new Error("Impossible de lire le contenu de l'image");
    return extracted;
  }

  throw new Error("Format non supporté. Utilisez image, PDF, Word ou texte.");
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante dans la configuration serveur" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const subjectId = String(formData.get("subjectId") || "").trim();
    const subjectTitle = String(formData.get("subjectTitle") || "").trim();
    const subjectContent = String(formData.get("subjectContent") || "");
    const typedAnswer = String(formData.get("typedAnswer") || "").trim();
    const uploadedFile = formData.get("answerFile");

    if (!subjectId || !subjectContent) {
      return NextResponse.json({ error: "Sujet incomplet" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: openAIKey });

    let extractedAnswer = "";
    let source = "editor" as "editor" | "upload";

    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      source = "upload";
      extractedAnswer = await extractUploadedAnswer(client, uploadedFile);
    } else {
      extractedAnswer = typedAnswer;
    }

    if (!extractedAnswer.trim()) {
      return NextResponse.json(
        { error: "La réponse est vide. Saisissez un texte ou importez un fichier." },
        { status: 400 },
      );
    }

    const gradingPrompt = [
      "Tu es un correcteur pédagogique francophone.",
      "Évalue la réponse de l'élève par rapport au sujet.",
      "Réponds STRICTEMENT en JSON valide sans markdown.",
      "Format JSON:",
      '{"score":number,"summary":string,"global_feedback":string,"items":[{"label":string,"is_correct":boolean,"student_answer":string,"issue":string,"correction":string,"encouragement":string}],"conclusion":string}',
      "Contraintes:",
      "- score entre 0 et 100",
      "- Si une réponse est correcte, is_correct=true, issue vide, correction vide, encouragement obligatoire (félicitations).",
      "- Si une réponse est fausse, is_correct=false avec issue + correction claire.",
      "- Donne une conclusion motivante.",
      "---",
      `Titre du sujet: ${subjectTitle || "Sujet"}`,
      "Contenu du sujet:",
      subjectContent,
      "---",
      "Réponse de l'élève:",
      extractedAnswer,
    ].join("\n");

    const gradeResponse = await client.responses.create({
      model: MODEL,
      input: gradingPrompt,
    });

    const raw = gradeResponse.output_text || "";
    const parsed = parseJsonObject(raw);

    const {
      data: submission,
      error: insertError,
    } = await supabase
      .from("subject_submissions")
      .insert({
        subject_id: subjectId,
        user_id: user.id,
        answer: extractedAnswer,
        correction_type: "ai",
        status: "completed",
        correction: JSON.stringify(parsed.items || []),
        correction_score: Number(parsed.score || 0),
        correction_feedback: parsed.global_feedback || parsed.summary || "",
        corrected_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (insertError) {
      return NextResponse.json(
        { error: "Échec de sauvegarde de la soumission", details: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      submissionId: submission?.id,
      source,
      extractedAnswer,
      result: parsed,
    });
  } catch (error) {
    console.error("grade-submission error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur de correction IA" },
      { status: 500 },
    );
  }
}
