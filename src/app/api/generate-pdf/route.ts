import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let browser = null;
  try {
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: white;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    /* En-tête */
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3498db;
    }
    
    .header .logo {
      font-size: 18px;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 10px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #2c3e50;
      margin: 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .header .subtitle {
      font-size: 12px;
      color: #7f8c8d;
      font-style: italic;
      margin: 5px 0;
    }
    
    /* Sections */
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    
    .section-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      font-weight: bold;
      font-size: 12px;
      flex-shrink: 0;
    }
    
    .section-content {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 6px;
      border-left: 4px solid #3498db;
    }
    
    /* Typographie */
    h1 { font-size: 24px; margin: 20px 0 10px; font-weight: 700; color: #2c3e50; }
    h2 { font-size: 20px; margin: 18px 0 8px; font-weight: 700; color: #2c3e50; }
    h3 { font-size: 16px; margin: 16px 0 8px; font-weight: 700; color: #2c3e50; }
    h4 { font-size: 14px; margin: 14px 0 6px; font-weight: 700; color: #34495e; }
    
    p {
      margin: 10px 0;
      line-height: 1.8;
    }
    
    ul, ol {
      margin: 12px 0;
      padding-left: 30px;
    }
    
    li {
      margin: 6px 0;
      line-height: 1.6;
    }
    
    strong, b {
      font-weight: 700;
      color: #2c3e50;
    }
    
    em, i {
      font-style: italic;
      color: #34495e;
    }
    
    /* Code */
    code {
      background: #ecf0f1;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #c0392b;
    }
    
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      border-left: 4px solid #3498db;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      margin: 10px 0;
    }
    
    pre code {
      background: none;
      padding: 0;
      color: #ecf0f1;
    }
    
    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 0.95em;
    }
    
    th, td {
      border: 1px solid #bdc3c7;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background: #3498db;
      color: white;
      font-weight: 700;
    }
    
    tr:nth-child(even) {
      background: #ecf0f1;
    }

    /* Sommaire (PDF anchors) */
    .toc-link {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #bdc3c7;
      color: #7f8c8d;
      font-size: 10px;
      line-height: 1.6;
    }
    
    .footer .logo {
      font-size: 16px;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 8px;
    }
    
    /* Saut de page */
    .page-break {
      page-break-before: always;
    }
    
    /* Impression */
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }

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
    <div class="subtitle">Généré le ${new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</div>
    <div class="subtitle">Plateforme d'Apprentissage Intelligent - Votre Tuteur IA Socratique</div>
  </div>
  
  <div class="section">
    <div class="section-title">
      <div class="section-number">1</div>
      📋 SUJET D'EXAMEN
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
  <div class="section page-break">
    <div class="section-title">
      <div class="section-number">2</div>
      ✍️ VOTRE RÉPONSE
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
    <div class="section-title">
      <div class="section-number">${includeAnswer ? 3 : 2}</div>
      🧭 SOMMAIRE — RÉPONSE IA
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
    <div class="section-title">
      <div class="section-number">${section.number}</div>
      ${section.title}
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
    <div class="section-title">
      <div class="section-number">${includeAnswer ? 3 : 2}</div>
      🤖 RÉPONSE IA
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
    <p><strong>Document généré par Mah.ai</strong></p>
    <p>Plateforme d'Apprentissage Intelligent</p>
    <p style="margin-top: 10px; font-size: 9px; color: #95a5a6;">
      Ce document est à usage personnel et pédagogique
    </p>
    <p style="margin-top: 8px; font-size: 9px; color: #95a5a6;">
      © ${new Date().getFullYear()} Mah.ai - Tous droits réservés
    </p>
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
