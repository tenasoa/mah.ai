import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let browser = null;
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

    const {
      subjectContent,
      subjectTitle,
      userAnswer,
      includeAnswer,
      aiResponse,
      includeAIResponse,
    } = await request.json();

    const stripSources = (text: string) =>
      text
        .replace(/\s*\[(\d+(\s*[-,]\s*\d+)*)\]\s*/g, " ")
        .replace(/^\s*Sources\s*:\s*[\s\S]*$/im, "")
        .trim();

    const cleanedAiResponse =
      includeAIResponse && aiResponse ? stripSources(aiResponse) : "";

    const aiResponseParts =
      includeAIResponse && cleanedAiResponse
        ? cleanedAiResponse
            .split(/\n{2,}---\n{2,}/)
            .map((part) => part.trim())
            .filter(Boolean)
        : [];
    const sections: { id: string; title: string; number: number; markdown: string }[] = [];
    sections.push({
      id: "subject",
      title: "📋 SUJET D'EXAMEN",
      number: 1,
      markdown: subjectContent || "",
    });
    if (includeAnswer && userAnswer) {
      sections.push({
        id: "user-answer",
        title: "✍️ VOTRE RÉPONSE",
        number: 2,
        markdown: userAnswer,
      });
    }
    const hasMultipleAiParts = includeAIResponse && aiResponseParts.length > 1;
    const aiStartIndex = includeAnswer ? 4 : 3;
    if (includeAIResponse && cleanedAiResponse) {
      if (hasMultipleAiParts) {
        aiResponseParts.forEach((part, index) => {
          sections.push({
            id: `ai-part-${index + 1}`,
            title: `🤖 RÉPONSE IA — PARTIE ${index + 1}/${aiResponseParts.length}`,
            number: aiStartIndex + index,
            markdown: part,
          });
        });
      } else {
        sections.push({
          id: "ai-part-1",
          title: "🤖 RÉPONSE IA",
          number: includeAnswer ? 3 : 2,
          markdown: cleanedAiResponse,
        });
      }
    }
    const milkdownSections = sections.map((section) => section.markdown);
    const aiResponseTocHtml = aiResponseParts
      .map(
        (_part, index) =>
          `<li><a class="toc-link" href="#ai-part-${index + 1}">Partie ${index + 1}/${aiResponseParts.length}</a></li>`
      )
      .join("");

    // Créer le document HTML complet
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subjectTitle)}</title>
  
  <!-- KaTeX + Milkdown (Crepe) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://unpkg.com/@milkdown/crepe@7.18.0/theme/common/style.css">
  <link rel="stylesheet" href="https://unpkg.com/@milkdown/crepe@7.18.0/theme/frame.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
  <style>
    /* Premium Design System */
    :root {
      --primary: #2563eb;
      --primary-light: #eff6ff;
      --secondary: #475569;
      --accent: #f59e0b;
      --success: #10b981;
      --success-light: #ecfdf5;
      --danger: #ef4444;
      --danger-light: #fef2f2;
      --surface: #ffffff;
      --background: #f8fafc;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--text-main);
      background: var(--background);
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    /* Elegant Header */
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid var(--border);
      position: relative;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 2px;
      background: var(--primary);
    }
    
    .header .logo {
      font-size: 24px;
      font-weight: 900;
      background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 15px;
      letter-spacing: -0.5px;
      display: inline-block;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      margin: 15px 0 10px;
      line-height: 1.2;
    }
    
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 15px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .header .meta span {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid var(--border);
      font-weight: 500;
    }
    
    /* Section Cards */
    .section {
      margin: 30px 0;
      break-inside: avoid;
      background: white;
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--background);
    }
    
    .section-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: white;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section-content {
      padding: 24px;
    }
    
    /* Special styling for User Answer */
    #user-answer .section-header {
      background: var(--primary-light);
    }
    
    #user-answer .section-number {
      background: var(--text-main);
    }

    /* Special styling for AI Response */
    [id^="ai-part"] .section-header {
      background: linear-gradient(to right, #fdfbf7, #fff);
    }

    [id^="ai-part"] .section-number {
      background: linear-gradient(135deg, var(--accent) 0%, #d97706 100%);
    }
    
    /* Typography within Content */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-main);
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
    }
    
    h1 { font-size: 1.8em; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.3em; }
    
    p { margin-bottom: 1em; text-align: justify; }
    
    ul, ol {
      margin-bottom: 1em;
      padding-left: 1.5em;
    }
    
    li { margin-bottom: 0.5em; }
    
    blockquote {
      border-left: 4px solid var(--primary);
      background: var(--primary-light);
      padding: 1em;
      border-radius: 0 8px 8px 0;
      margin: 1.5em 0;
      font-style: italic;
    }
    
    /* Code Blocks */
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5em 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
    }
    
    code {
      background: var(--border);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
      color: #dc2626;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.5em 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    
    th, td {
      padding: 12px 15px;
      border-bottom: 1px solid var(--border);
    }
    
    th {
      background: var(--background);
      font-weight: 600;
      text-align: left;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    tr:hover td {
      background: var(--primary-light);
    }

    /* Math Formula Enhancement */
    .katex-display {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border: 1px dashed var(--border);
      margin: 1.5em 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    
    /* Footer */
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 11px;
    }

    /* Print Tweaks */
    @page {
      margin: 20mm;
    }

    /* Helper Classes */
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    
    .badge-primary { background: var(--primary-light); color: var(--primary); }
    .badge-accent { background: #fffbeb; color: var(--accent); }

    /* Milkdown readonly */
    .milkdown-readonly .milkdown-toolbar {
      display: none;
    }
    .milkdown-paper .milkdown {
      --crepe-color-background: #fdfbf7;
      --crepe-color-on-background: #1f1b16;
      --crepe-color-surface: #f7f1e8;
      --crepe-color-surface-low: #efe7db;
      --crepe-color-on-surface: #2a231d;
      --crepe-color-on-surface-variant: #5c4f43;
      --crepe-color-outline: #cdbfae;
      --crepe-color-primary: #9b6b2f;
      --crepe-color-secondary: #eadcc9;
      --crepe-color-on-secondary: #2b1d0f;
      --crepe-color-inverse: #2b241e;
      --crepe-color-on-inverse: #f6efe6;
      --crepe-color-inline-code: #9c2f2f;
      --crepe-color-error: #9c2f2f;
      --crepe-color-hover: #f3eadf;
      --crepe-color-selected: #e6dbcc;
      --crepe-color-inline-area: #e8dccd;
      --crepe-font-title: Georgia, "Times New Roman", Times, serif;
      --crepe-font-default: Georgia, "Times New Roman", Times, serif;
      --crepe-font-code: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      --crepe-shadow-1: 0 8px 30px rgba(45, 31, 18, 0.08);
      --crepe-shadow-2: 0 18px 60px rgba(45, 31, 18, 0.12);
    }
    .milkdown-paper .milkdown {
      background:
        radial-gradient(1200px 500px at 20% 0%, rgba(255, 255, 255, 0.9), transparent 60%),
        linear-gradient(180deg, #fdfbf7 0%, #f8f1e7 100%);
      border-radius: 16px;
      border: 1px solid #eadfce;
      box-shadow: var(--crepe-shadow-1);
      padding: 10px 8px;
    }
    .milkdown-paper .ProseMirror {
      max-width: 100%;
      padding: 18px 22px 26px;
      font-size: 14px;
      line-height: 1.7;
      color: #2a231d;
    }
    .milkdown-paper .ProseMirror h1,
    .milkdown-paper .ProseMirror h2,
    .milkdown-paper .ProseMirror h3 {
      font-family: Georgia, "Times New Roman", Times, serif;
      color: #2b2016;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🎓 MAH.AI</div>
    <h1>${escapeHtml(subjectTitle)}</h1>
    <div class="meta">
      <span>
        📅 ${new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>
      <span>🤖 Tuteur IA</span>
      <span>📚 Document Pédagogique</span>
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">
      <div class="section-number">1</div>
      <div class="section-title">Sujet d'Examen</div>
    </div>
    <div class="section-content">
      <div class="milkdown-paper milkdown-readonly">
        <div id="md-0"></div>
      </div>
    </div>
  </div>
  
  ${
    includeAnswer && userAnswer
      ? `
  <div class="section page-break" id="user-answer">
    <div class="section-header">
      <div class="section-number">2</div>
      <div class="section-title">Votre Réponse</div>
    </div>
    <div class="section-content">
      <div class="milkdown-paper milkdown-readonly">
        <div id="md-1"></div>
      </div>
    </div>
  </div>
  `
      : ""
  }
  
  ${
    includeAIResponse && cleanedAiResponse
      ? aiResponseParts.length > 1
        ? `
  <div class="section page-break" id="ai-summary">
    <div class="section-header">
      <div class="section-number">${includeAnswer ? 3 : 2}</div>
      <div class="section-title">Sommaire de la Correction</div>
    </div>
    <div class="section-content">
      <ul>
        ${aiResponseTocHtml}
      </ul>
    </div>
  </div>
  ${sections
    .filter((section) => section.id.startsWith("ai-part-"))
    .map((section, index) => {
      const offset = (includeAnswer ? 1 : 0) + 1;
      const mdIndex = index + offset;
      return `
  <div class="section page-break" id="${section.id}">
    <div class="section-header">
      <div class="section-number">${section.number}</div>
      <div class="section-title">${section.title}</div>
    </div>
    <div class="section-content">
      <div class="milkdown-paper milkdown-readonly">
        <div id="md-${mdIndex}"></div>
      </div>
    </div>
  </div>
  `;
    })
    .join("")}
  `
        : `
  <div class="section page-break" id="ai-part-1">
    <div class="section-header">
      <div class="section-number">${includeAnswer ? 3 : 2}</div>
      <div class="section-title">Correction & Analyse IA</div>
    </div>
    <div class="section-content">
      <div class="milkdown-paper milkdown-readonly">
        <div id="md-${includeAnswer ? 2 : 1}"></div>
      </div>
    </div>
  </div>
  `
      : ""
  }
  
  <div class="footer">
    <div class="logo">MAH.AI</div>
    <p><strong>Plateforme d'Apprentissage Intelligent</strong></p>
    <p>Ce document a été généré automatiquement pour un usage pédagogique personnel.</p>
    <p>© ${new Date().getFullYear()} Mah.ai - Tous droits réservés</p>
  </div>
  
  <script type="module">
    import { Crepe } from "https://esm.sh/@milkdown/crepe@7.18.0?bundle";

    const sections = ${JSON.stringify(milkdownSections)};
    const rootIds = sections.map((_, index) => "md-" + index);

    const editors = rootIds.map((id, index) => {
      const root = document.getElementById(id);
      if (!root) return null;
      const crepe = new Crepe({
        root,
        defaultValue: sections[index] || "",
      });
      crepe.setReadonly(true);
      return crepe;
    }).filter(Boolean);

    Promise.all(editors.map((editor) => editor.create()))
      .then(() => {
        document.documentElement.setAttribute("data-rendered", "true");
      })
      .catch((error) => {
        console.error("Milkdown render error:", error);
        document.documentElement.setAttribute("data-rendered", "true");
      });
  </script>
</body>
</html>
    `;

    // Lancer Puppeteer pour convertir HTML en PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Attendre le rendu Milkdown côté navigateur
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-rendered") === "true",
      { timeout: 30000 }
    );

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
      printBackground: true,
      displayHeaderFooter: false,
    });
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF vide: génération interrompue ou contenu non rendu");
    }

    await browser.close();

    // Retourner le PDF
    const pdfData = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    const pdfBody = new Uint8Array(pdfData);
    return new Response(pdfBody, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${subjectTitle.replace(/[^a-z0-9]/gi, "_")}_mah_ai.pdf"`,
        "Content-Length": pdfData.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération PDF:", error);
    if (browser) {
      await browser.close();
    }
    return NextResponse.json(
      { error: "Erreur lors de la génération du document" },
      { status: 500 },
    );
  }
}

// Fonction pour échapper les caractères HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
