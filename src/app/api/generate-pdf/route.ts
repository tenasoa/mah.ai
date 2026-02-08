import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer";
import { marked } from "marked";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfPayload = {
  subjectContent?: unknown;
  subjectTitle?: unknown;
  userAnswer?: unknown;
  includeAnswer?: unknown;
  aiResponse?: unknown;
  includeAIResponse?: unknown;
};

type PdfSection = {
  id: string;
  title: string;
  number: number;
  html: string;
};

marked.setOptions({
  gfm: true,
  breaks: true,
});

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function sanitizeMarkdownInput(markdown: string): string {
  return markdown
    .replace(/\r\n?/g, "\n")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(markdown: string): string {
  const safeMarkdown = sanitizeMarkdownInput(markdown);
  return marked.parse(safeMarkdown) as string;
}

function stripSources(text: string): string {
  return text
    .replace(/\s*\[(\d+(\s*[-,]\s*\d+)*)\]\s*/g, " ")
    .replace(/^\s*Sources\s*:\s*[\s\S]*$/im, "")
    .trim();
}

function safeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  return trimmed.length > 0 ? trimmed : "Document";
}

function buildFileName(title: string): string {
  return `${title.replace(/[^a-z0-9]/gi, "_")}_mah_ai.pdf`;
}

export async function POST(request: NextRequest) {
  let browser: Browser | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    const payload = (await request.json().catch(() => null)) as PdfPayload | null;
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Payload invalide pour la génération PDF." },
        { status: 400 },
      );
    }

    const subjectContent = toStringOrEmpty(payload.subjectContent);
    const subjectTitle = safeTitle(toStringOrEmpty(payload.subjectTitle));
    const userAnswer = toStringOrEmpty(payload.userAnswer);
    const aiResponse = toStringOrEmpty(payload.aiResponse);
    const includeAnswer = Boolean(payload.includeAnswer) && userAnswer.trim().length > 0;
    const includeAIResponse = Boolean(payload.includeAIResponse) && aiResponse.trim().length > 0;

    if (!subjectContent.trim()) {
      return NextResponse.json(
        { error: "Le contenu du sujet est requis." },
        { status: 400 },
      );
    }

    const cleanedAiResponse = includeAIResponse ? stripSources(aiResponse) : "";
    const aiParts =
      cleanedAiResponse.length > 0
        ? cleanedAiResponse
            .split(/\n{2,}---\n{2,}/)
            .map((part) => part.trim())
            .filter(Boolean)
        : [];

    const sections: PdfSection[] = [];
    let sectionNumber = 1;

    sections.push({
      id: "subject",
      title: "Sujet d'examen",
      number: sectionNumber,
      html: renderMarkdown(subjectContent),
    });
    sectionNumber += 1;

    if (includeAnswer) {
      sections.push({
        id: "user-answer",
        title: "Votre réponse",
        number: sectionNumber,
        html: renderMarkdown(userAnswer),
      });
      sectionNumber += 1;
    }

    if (includeAIResponse && cleanedAiResponse) {
      if (aiParts.length > 1) {
        aiParts.forEach((part, index) => {
          sections.push({
            id: `ai-part-${index + 1}`,
            title: `Réponse IA - Partie ${index + 1}/${aiParts.length}`,
            number: sectionNumber,
            html: renderMarkdown(part),
          });
          sectionNumber += 1;
        });
      } else {
        sections.push({
          id: "ai-part-1",
          title: "Réponse IA",
          number: sectionNumber,
          html: renderMarkdown(cleanedAiResponse),
        });
      }
    }

    const tocItems = sections
      .filter((section) => section.id.startsWith("ai-part-"))
      .map(
        (section) =>
          `<li><a href="#${section.id}">${escapeHtml(section.title)}</a></li>`,
      )
      .join("");

    const sectionsHtml = sections
      .map(
        (section, index) => `
      <section class="section ${index > 0 ? "page-break" : ""}" id="${section.id}">
        <header class="section-header">
          <div class="section-number">${section.number}</div>
          <h2 class="section-title">${escapeHtml(section.title)}</h2>
        </header>
        <div class="section-content markdown-content">${section.html}</div>
      </section>
    `,
      )
      .join("");

    const html = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subjectTitle)}</title>
    <style>
      :root {
        --border: #e2e8f0;
        --bg: #f8fafc;
        --surface: #ffffff;
        --text: #1e293b;
        --muted: #64748b;
        --primary: #2563eb;
        --accent: #f59e0b;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 36px;
        font-family: "Segoe UI", Arial, sans-serif;
        background: var(--bg);
        color: var(--text);
      }

      .doc-header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--border);
        margin-bottom: 24px;
      }

      .doc-header .brand {
        font-weight: 800;
        color: var(--primary);
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }

      .doc-header h1 {
        margin: 0;
        font-size: 28px;
        line-height: 1.25;
      }

      .doc-header p {
        margin-top: 10px;
        color: var(--muted);
        font-size: 13px;
      }

      .toc {
        margin: 18px 0 0;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: #fffaf2;
      }

      .toc h3 {
        margin: 0 0 8px;
        font-size: 13px;
        color: #7a4a00;
      }

      .toc ul {
        margin: 0;
        padding-left: 18px;
      }

      .toc a {
        color: #7a4a00;
        text-decoration: none;
      }

      .section {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        margin-top: 18px;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        background: #f1f5f9;
      }

      .section-number {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--primary);
        color: white;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      }

      .section-title {
        margin: 0;
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .section-content {
        padding: 16px;
      }

      .markdown-content p {
        margin: 0 0 12px;
        line-height: 1.65;
      }

      .markdown-content h1,
      .markdown-content h2,
      .markdown-content h3 {
        margin: 12px 0 8px;
      }

      .markdown-content ul,
      .markdown-content ol {
        margin: 0 0 12px;
        padding-left: 22px;
      }

      .markdown-content pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 12px;
        border-radius: 10px;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
        font-family: "Consolas", "Courier New", monospace;
      }

      .markdown-content code {
        background: #e2e8f0;
        border-radius: 4px;
        padding: 1px 4px;
        font-family: "Consolas", "Courier New", monospace;
      }

      .footer {
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid var(--border);
        text-align: center;
        font-size: 11px;
        color: var(--muted);
      }

      .page-break {
        break-inside: avoid;
      }

      @page {
        margin: 16mm;
      }
    </style>
  </head>
  <body>
    <header class="doc-header">
      <div class="brand">MAH.AI</div>
      <h1>${escapeHtml(subjectTitle)}</h1>
      <p>Généré le ${new Date().toLocaleDateString("fr-FR")} • Support pédagogique</p>
      ${
        tocItems
          ? `
      <div class="toc">
        <h3>Sommaire des réponses IA</h3>
        <ul>${tocItems}</ul>
      </div>
      `
          : ""
      }
    </header>

    ${sectionsHtml}

    <footer class="footer">
      Document généré automatiquement pour usage pédagogique personnel.
    </footer>
  </body>
</html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "14mm",
        bottom: "14mm",
        left: "12mm",
        right: "12mm",
      },
      printBackground: true,
      displayHeaderFooter: false,
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF vide: la génération n'a produit aucun contenu.");
    }

    await browser.close();
    browser = null;

    const pdfData = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);
    const fileName = buildFileName(subjectTitle);

    return new Response(new Uint8Array(pdfData), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfData.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération PDF:", error);
    if (browser) {
      await browser.close();
    }

    const details =
      error instanceof Error ? error.message : "Erreur inattendue du serveur";

    return NextResponse.json(
      { error: `Erreur lors de la génération du document: ${details}` },
      { status: 500 },
    );
  }
}
