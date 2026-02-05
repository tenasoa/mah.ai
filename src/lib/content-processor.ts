/**
 * Utilitaire de traitement du contenu pour Mah.ai.
 * Version conservative: protège le code, normalise les délimiteurs LaTeX,
 * puis assainit uniquement les segments math explicites.
 */

const FENCED_CODE_BLOCK_REGEX = /```[\s\S]*?```/g;
const INLINE_CODE_REGEX = /`[^`\n]+`/g;
const MATH_SEGMENT_REGEX = /(\$\$[\s\S]*?\$\$|\$(?:\\.|[^$\n\\])+\$)/g;

const stashSegments = (
  input: string,
  regex: RegExp,
  prefix: string,
  store: string[],
) => {
  return input.replace(regex, (match) => {
    const token = `@@${prefix}_${store.length}@@`;
    store.push(match);
    return token;
  });
};

const restoreSegments = (input: string, prefix: string, store: string[]) => {
  const tokenRegex = new RegExp(`@@${prefix}_(\\d+)@@`, "g");
  return input.replace(tokenRegex, (_token, rawIndex: string) => {
    const index = Number(rawIndex);
    return store[index] ?? "";
  });
};

const escapeUnescapedHash = (value: string): string => {
  let result = "";
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const previous = i > 0 ? value[i - 1] : "";

    if (char === "#" && previous !== "\\") {
      result += "\\#";
      continue;
    }

    result += char;
  }
  return result;
};

const sanitizeMathSegments = (input: string): string => {
  return input.replace(MATH_SEGMENT_REGEX, (segment) => {
    const isBlock = segment.startsWith("$$");
    const delimiter = isBlock ? "$$" : "$";
    const inner = segment.slice(delimiter.length, -delimiter.length).trim();

    if (!inner) {
      return segment;
    }

    // Cas fréquent d'erreur IA: titres Markdown placés dans un bloc math.
    if (/^#{1,6}(\s+.*)?$/.test(inner)) {
      return `\n${inner}\n`;
    }

    const safeInner = escapeUnescapedHash(inner);

    // Un inline math contenant un saut de ligne devient un bloc.
    if (isBlock || /\n/.test(safeInner)) {
      return `$$\n${safeInner}\n$$`;
    }

    return `${delimiter}${safeInner}${delimiter}`;
  });
};

const removeCitationMarkers = (input: string): string => {
  // Supprime les citations style [1], [1,2], [1-3], y compris collées au texte.
  // On évite le contexte math ($[1,2]$) via lookbehind sur "$".
  return input
    .replace(/(?<![$\\])\[(\d+(?:\s*[-,]\s*\d+)*)\]/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/ {2,}/g, " ")
    .replace(/ +([,.;:!?])/g, "$1");
};

export const processContent = (
  content: string,
  isAiResponse: boolean = false,
): string => {
  if (!content) return "";

  let cleaned = content.replace(/\r\n?/g, "\n");

  // 1) Protéger d'abord les blocs de code et inline code.
  const fencedBlocks: string[] = [];
  const inlineCodes: string[] = [];
  cleaned = stashSegments(
    cleaned,
    FENCED_CODE_BLOCK_REGEX,
    "CODE_BLOCK",
    fencedBlocks,
  );
  cleaned = stashSegments(cleaned, INLINE_CODE_REGEX, "INLINE_CODE", inlineCodes);

  // 2) Nettoyage spécifique IA (citations [1], [1,2], "Sources: ...").
  if (isAiResponse) {
    cleaned = removeCitationMarkers(cleaned)
      .replace(/^\s*Sources\s*:\s*[\s\S]*$/im, "")
      .trim();
  }

  // 3) Normaliser les délimiteurs LaTeX explicites.
  cleaned = cleaned
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner: string) => {
      const value = inner.trim();
      return value ? `\n\n$$\n${value}\n$$\n\n` : "";
    })
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, inner: string) => {
      const value = inner.trim();
      return value ? `$${value}$` : "";
    })
    // OCR fréquent: "$$$x$" -> "$$x$$"
    .replace(/\$\$\$([^$]+)\$/g, (_match, inner: string) => {
      const value = inner.trim();
      return value ? `$$${value}$$` : "";
    });

  // 4) Assainir uniquement les segments math déjà délimités.
  cleaned = sanitizeMathSegments(cleaned);

  // 5) Nettoyage final léger.
  cleaned = cleaned
    .replace(/\*\*\s*(\$\$[\s\S]*?\$\$|\$(?:\\.|[^$\n\\])+\$)\s*\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 6) Restaurer le code.
  cleaned = restoreSegments(cleaned, "INLINE_CODE", inlineCodes);
  cleaned = restoreSegments(cleaned, "CODE_BLOCK", fencedBlocks);

  return cleaned;
};
