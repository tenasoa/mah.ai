"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  variant?: "light" | "dark" | "minimal";
  className?: string;
}

/**
 * Composant MarkdownRenderer amélioré pour afficher le contenu markdown
 * sans exposer les codes markdown bruts, avec support complet des équations.
 */
export function MarkdownRenderer({
  content,
  variant = "light",
  className = "",
}: MarkdownRendererProps) {
  // Prétraiter le contenu pour normaliser les formats mathématiques
  const processedContent = content
    // Convertir les formats LaTeX courants en format $ ... $
    .replace(/\\\((.*?)\\\)/g, "$$$1$$") // \( ... \) → $ ... $
    .replace(/\\\[([\s\S]*?)\\\]/g, "$$\n$1\n$$") // \[ ... \] → $$ ... $$
    // Normaliser les blocs $$...$$ pour forcer un rendu display
    .replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      const trimmed = String(formula).trim();
      return `\n\n$$\n${trimmed}\n$$\n\n`;
    })
    // Nettoyer les espaces autour des formules inline seulement
    .replace(/\$(?!\$)\s*([^$\n]+?)\s*\$(?!\$)/g, (match, formula) => {
      return `$${String(formula).trim()}$`;
    })
    .replace(/\n{3,}/g, "\n\n");

  // Styles personnalisés selon le variant
  const baseStyles = {
    light:
      "prose prose-slate prose-lg [&_*]:text-slate-900 [&_strong]:text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_h1]:text-slate-900 [&_h2]:text-slate-900 [&_h3]:text-slate-900 [&_h4]:text-slate-900",
    dark: "prose-invert prose-slate prose-lg dark:[&_*]:text-slate-100",
    minimal:
      "prose prose-slate prose-sm [&_*]:text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900",
  };

  return (
    <div
      className={`
      ${baseStyles[variant]}
      max-w-none
      font-sans
      leading-relaxed
      selection:bg-violet-100
      selection:text-violet-900
      dark:selection:bg-violet-900
      dark:selection:text-violet-100
      ${className}
    `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              output: "mathml",
              leqno: false,
              fleqn: false,
              throwOnError: false,
              strict: "warn",
            },
          ],
          rehypeRaw,
        ]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                <div className="bg-slate-700 text-slate-300 px-4 py-2 text-xs font-semibold">
                  {match[1]}
                </div>
                <pre className="m-0!">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return (
              <p className="my-3 leading-relaxed text-slate-900 dark:text-slate-100">
                {children}
              </p>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-3xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold mt-5 mb-3 border-b border-slate-300 dark:border-slate-700 pb-2 text-slate-900 dark:text-slate-100">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-lg font-bold mt-3 mb-2 text-slate-900 dark:text-slate-100">
                {children}
              </h4>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-bold text-slate-900 dark:text-slate-100">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return (
              <em className="italic text-slate-900 dark:text-slate-100">
                {children}
              </em>
            );
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-inside my-3 space-y-1">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside my-3 space-y-1">
                {children}
              </ol>
            );
          },
          li({ children }) {
            // eslint-disable-next-line jsx-a11y/no-li-without-preceding-ul-or-ol
            return (
              <li className="text-slate-900 dark:text-slate-100">{children}</li>
            );
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-violet-500 bg-violet-50 dark:bg-violet-950 pl-4 py-2 my-3 italic text-slate-900 dark:text-slate-100">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
                <table className="w-full">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-100 dark:bg-slate-800">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left font-bold text-slate-900 dark:text-slate-100">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100">
                {children}
              </td>
            );
          },
          hr() {
            return (
              <hr className="my-4 border-slate-300 dark:border-slate-700" />
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>

      {!content?.trim() && (
        <div className="text-center py-8 text-slate-500">
          <p>Aucun contenu à afficher</p>
        </div>
      )}
    </div>
  );
}
