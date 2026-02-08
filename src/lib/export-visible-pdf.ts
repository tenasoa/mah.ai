import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const UNSUPPORTED_COLOR_FUNCTION_REGEX = /\b(color-mix|lab|lch|oklab|oklch|color)\(/i;

const COLOR_PROPERTIES = [
  "color",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "text-emphasis-color",
  "-webkit-text-fill-color",
  "-webkit-text-stroke-color",
  "caret-color",
  "column-rule-color",
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
] as const;

function normalizeColorValue(doc: Document, rawValue: string): string | null {
  const canvas = doc.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return null;

  try {
    context.fillStyle = "#000";
    context.fillStyle = rawValue;
    const normalized = context.fillStyle;
    if (!normalized) return null;
    if (UNSUPPORTED_COLOR_FUNCTION_REGEX.test(normalized)) return null;
    return normalized;
  } catch {
    return null;
  }
}

function applyCaptureSafeStyles(doc: Document, markerAttribute: string): void {
  const root = doc.querySelector<HTMLElement>(`[${markerAttribute}="1"]`);
  const view = doc.defaultView;
  if (!root || !view) return;

  const globalSafeStyle = doc.createElement("style");
  globalSafeStyle.textContent = `
    [${markerAttribute}="1"], [${markerAttribute}="1"] * {
      box-shadow: none !important;
      text-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  `;
  doc.head.appendChild(globalSafeStyle);

  const elements: HTMLElement[] = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement>("*")),
  ];

  for (const element of elements) {
    const computed = view.getComputedStyle(element);

    if (
      computed.backgroundImage &&
      UNSUPPORTED_COLOR_FUNCTION_REGEX.test(computed.backgroundImage)
    ) {
      element.style.backgroundImage = "none";
    }

    if (
      computed.boxShadow &&
      UNSUPPORTED_COLOR_FUNCTION_REGEX.test(computed.boxShadow)
    ) {
      element.style.boxShadow = "none";
    }

    if (
      computed.textShadow &&
      UNSUPPORTED_COLOR_FUNCTION_REGEX.test(computed.textShadow)
    ) {
      element.style.textShadow = "none";
    }

    if (computed.filter && UNSUPPORTED_COLOR_FUNCTION_REGEX.test(computed.filter)) {
      element.style.filter = "none";
    }

    for (const property of COLOR_PROPERTIES) {
      const raw = computed.getPropertyValue(property).trim();
      if (!raw || !UNSUPPORTED_COLOR_FUNCTION_REGEX.test(raw)) continue;

      const normalized = normalizeColorValue(doc, raw);
      element.style.setProperty(property, normalized || "#111827", "important");
    }
  }
}

function applyCaptureAggressiveStyles(doc: Document, markerAttribute: string): void {
  const root = doc.querySelector<HTMLElement>(`[${markerAttribute}="1"]`);
  if (!root) return;

  const style = doc.createElement("style");
  style.textContent = `
    [${markerAttribute}="1"], [${markerAttribute}="1"] * {
      color: #111827 !important;
      background-image: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border-color: #cbd5e1 !important;
      outline-color: #cbd5e1 !important;
      fill: #111827 !important;
      stroke: #111827 !important;
    }
  `;
  doc.head.appendChild(style);
}

function buildCanvas(source: HTMLElement, markerAttribute: string, aggressive: boolean) {
  return html2canvas(source, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (clonedDocument) => {
      if (aggressive) {
        applyCaptureAggressiveStyles(clonedDocument, markerAttribute);
        return;
      }
      applyCaptureSafeStyles(clonedDocument, markerAttribute);
    },
  });
}

export async function exportElementToPdf(
  source: HTMLElement,
  fileName: string,
): Promise<void> {
  const markerAttribute = "data-pdf-capture-root";
  source.setAttribute(markerAttribute, "1");

  try {
    let canvas: HTMLCanvasElement;
    try {
      canvas = await buildCanvas(source, markerAttribute, false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/unsupported color function/i.test(message)) {
        throw error;
      }
      canvas = await buildCanvas(source, markerAttribute, true);
    }

    if (!canvas.width || !canvas.height) {
      throw new Error("Le rendu capturé est vide.");
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const imageData = canvas.toDataURL("image/png", 1.0);

    let remainingHeight = imageHeight;
    let position = 0;

    pdf.addImage(
      imageData,
      "PNG",
      0,
      position,
      imageWidth,
      imageHeight,
      undefined,
      "FAST",
    );
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      position = remainingHeight - imageHeight;
      pdf.addPage();
      pdf.addImage(
        imageData,
        "PNG",
        0,
        position,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );
      remainingHeight -= pageHeight;
    }

    pdf.save(fileName);
  } finally {
    source.removeAttribute(markerAttribute);
  }
}
