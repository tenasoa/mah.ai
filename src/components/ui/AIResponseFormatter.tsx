"use client";

import { MarkdownRenderer } from "./MarkdownRenderer";

interface AIResponseFormatterProps {
  content: string;
  variant?: "sidekick" | "modal" | "inline";
  className?: string;
}

/**
 * Composant pour formater les réponses de l'IA de manière cohérente
 * - Masque les codes markdown bruts
 * - Formate correctement les équations mathématiques
 * - Applique des styles appropriés selon le contexte
 */
export function AIResponseFormatter({
  content,
  variant = "inline",
  className = "",
}: AIResponseFormatterProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "sidekick":
        return {
          container:
            "bg-violet-50 border border-violet-100 rounded-2xl px-4 py-2",
          label: "text-violet-400",
        };
      case "modal":
        return {
          container: "bg-white border border-slate-200 rounded-lg p-4",
          label: "text-slate-500",
        };
      default:
        return {
          container: "bg-transparent",
          label: "text-slate-600",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Label optionnel pour le contexte */}
      {variant === "sidekick" && (
        <div
          className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${styles.label}`}
        >
          Réponse du tuteur
        </div>
      )}

      {/* Contenu formaté */}
      <MarkdownRenderer content={content} variant="minimal" />
    </div>
  );
}
