import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { marked } from "marked";

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

    // Fonction pour convertir Markdown en HTML avec support KaTeX
    async function markdownToHtml(markdown: string): Promise<string> {
      // Extraire les équations avant marked pour éviter l'échappement
      const mathBlocks: { token: string; html: string }[] = [];
      let tokenIndex = 0;

      const stashMath = (html: string) => {
        const token = `@@MATH_${tokenIndex}@@`;
        tokenIndex += 1;
        mathBlocks.push({ token, html });
        return token;
      };

      let text = markdown;

      // Équations display $$...$$
      text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
        return stashMath(`<div class="math-display">$$${equation}$$</div>`);
      });

      // LaTeX format \[...\]
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, equation) => {
        return stashMath(`<div class="math-display">$$${equation}$$</div>`);
      });

      // LaTeX format \(...\)
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, equation) => {
        return stashMath(`<span class="math-inline">$${equation}$</span>`);
      });

      // Équations inline $...$ (après avoir retiré $$...$$)
      text = text.replace(/\$(?!\$)([^\n$]+?)\$/g, (match, equation) => {
        return stashMath(`<span class="math-inline">$${equation}$</span>`);
      });

      // Configuration de marked pour support du markdown enrichi
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      let html = await marked.parse(text);

      // Réinjecter les équations dans le HTML généré
      for (const block of mathBlocks) {
        html = html.replace(block.token, block.html);
      }

      return html;
    }

    // Convertir le contenu markdown en HTML
    const subjectHtml = await markdownToHtml(subjectContent);
    const userAnswerHtml =
      includeAnswer && userAnswer ? await markdownToHtml(userAnswer) : "";
    const aiResponseHtml =
      includeAIResponse && aiResponse ? await markdownToHtml(aiResponse) : "";

    // Créer le document HTML complet
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subjectTitle)}</title>
  
  <!-- KaTeX CSS pour les équations mathématiques -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <!-- KaTeX JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  
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
    
    /* Équations mathématiques */
    .math-display {
      text-align: center;
      margin: 15px 0;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .math-inline {
      margin: 0 2px;
    }
    
    .katex {
      font-size: 1em;
    }
    
    .katex-display {
      margin: 0;
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
      ${subjectHtml}
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
      ${userAnswerHtml}
    </div>
  </div>
  `
      : ""
  }
  
  ${
    includeAIResponse && aiResponse
      ? `
  <div class="section page-break">
    <div class="section-title">
      <div class="section-number">${includeAnswer ? 3 : 2}</div>
      🤖 RÉPONSE IA
    </div>
    <div class="section-content">
      ${aiResponseHtml}
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
  
  <script>
    // Rendre les équations mathématiques avec KaTeX au chargement
    document.addEventListener('DOMContentLoaded', function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ]
      });
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

    // Attendre le rendu de KaTeX
    await page.evaluate(() => {
      return new Promise((resolve) => setTimeout(resolve, 2000));
    });

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

    await browser.close();

    // Retourner le PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${subjectTitle.replace(/[^a-z0-9]/gi, "_")}_mah_ai.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
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
