import React from 'react';

interface MathTextProps {
  content: string;
  className?: string;
}

export function MathText({ content, className = "" }: MathTextProps) {
  const [renderedContent, setRenderedContent] = React.useState<React.ReactNode[]>([]);
  const [katexLoaded, setKatexLoaded] = React.useState(false);

  React.useEffect(() => {
    const loadKaTeX = async () => {
      if (typeof window !== 'undefined') {
        try {
          const katex = await import('katex');
          setKatexLoaded(true);
          
          // Parser le contenu et remplacer les formules mathématiques
          const parts = content.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/);
          const rendered = parts.map((part, index) => {
            if (part.match(/^\$\$[^$]+\$\$$/)) {
              // Formule display (centrée)
              const formula = part.slice(2, -2);
              try {
                const html = katex.default.renderToString(formula, {
                  displayMode: true,
                  throwOnError: false,
                });
                return (
                  <div 
                    key={index} 
                    className="katex-display my-4 text-center"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch (error) {
                return <div key={index} className="text-red-500 text-sm">Erreur de formule: {formula}</div>;
              }
            } else if (part.match(/^\$[^$]+\$$/)) {
              // Formule inline
              const formula = part.slice(1, -1);
              try {
                const html = katex.default.renderToString(formula, {
                  displayMode: false,
                  throwOnError: false,
                });
                return (
                  <span 
                    key={index} 
                    className="katex-inline"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch (error) {
                return <span key={index} className="text-red-500 text-sm">Erreur: {formula}</span>;
              }
            } else if (part.trim()) {
              // Texte normal - parser le markdown simple
              return parseTextBlock(part, index);
            }
            return null;
          });
          
          setRenderedContent(rendered.filter(Boolean));
        } catch (error) {
          console.error('Erreur lors du chargement de KaTeX:', error);
          // Fallback sans KaTeX
          setRenderedContent([parseSimpleText(content)]);
        }
      }
    };

    loadKaTeX();
  }, [content]);

  const parseTextBlock = (text: string, key: number) => {
    // Diviser en lignes pour traiter chaque bloc
    const lines = text.split('\n');
    const blocks: React.ReactNode[] = [];
    
    let currentParagraph = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Titres
      if (line.startsWith('### ')) {
        if (currentParagraph) {
          blocks.push(<p key={key + '_' + i + '_p'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
          currentParagraph = '';
        }
        blocks.push(
          <h3 key={key + '_' + i} className="text-md font-semibold text-slate-800 mb-2 mt-4 flex items-center gap-2">
            <span>📌</span> {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        if (currentParagraph) {
          blocks.push(<p key={key + '_' + i + '_p'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
          currentParagraph = '';
        }
        blocks.push(
          <h2 key={key + '_' + i} className="text-lg font-semibold text-slate-800 mb-2 mt-4 flex items-center gap-2">
            <span>🔹</span> {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        if (currentParagraph) {
          blocks.push(<p key={key + '_' + i + '_p'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
          currentParagraph = '';
        }
        blocks.push(
          <h1 key={key + '_' + i} className="text-xl font-semibold text-slate-800 mb-2 mt-4 flex items-center gap-2">
            <span>▶️</span> {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('- ')) {
        if (currentParagraph) {
          blocks.push(<p key={key + '_' + i + '_p'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
          currentParagraph = '';
        }
        blocks.push(
          <li key={key + '_' + i} className="text-slate-700 leading-relaxed ml-4 mb-1">
            {processInlineFormatting(line.slice(2))}
          </li>
        );
      } else if (line.match(/^\d+\. /)) {
        if (currentParagraph) {
          blocks.push(<p key={key + '_' + i + '_p'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
          currentParagraph = '';
        }
        blocks.push(
          <li key={key + '_' + i} className="text-slate-700 leading-relaxed ml-4 mb-1">
            {processInlineFormatting(line.replace(/^\d+\. /, ''))}
          </li>
        );
      } else if (line === '') {
        // Ligne vide - fin de paragraphe
        if (currentParagraph) {
          blocks.push(<p key={key + '_' + i + '_p'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
          currentParagraph = '';
        }
      } else {
        // Ligne de texte normal
        if (currentParagraph) {
          currentParagraph += ' ' + processInlineFormatting(line);
        } else {
          currentParagraph = processInlineFormatting(line);
        }
      }
    }
    
    // Ajouter le dernier paragraphe
    if (currentParagraph) {
      blocks.push(<p key={key + '_final'} className="mb-3 text-slate-700 leading-relaxed">{currentParagraph}</p>);
    }
    
    return <React.Fragment key={key}>{blocks}</React.Fragment>;
  };

  const processInlineFormatting = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-slate-800 text-sm font-mono">$1</code>');
  };

  const parseSimpleText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim()) {
        return (
          <p key={index} className="mb-3 text-slate-700 leading-relaxed">
            {processInlineFormatting(line)}
          </p>
        );
      }
      return <br key={index} />;
    });
  };

  if (!katexLoaded) {
    return (
      <div className={className}>
        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
          {content.replace(/\$\$[^$]+\$\$/g, '[Formule mathématique]')
                   .replace(/\$[^$]+$/g, '[Formule]')}
        </div>
      </div>
    );
  }

  return <div className={className}>{renderedContent}</div>;
}
