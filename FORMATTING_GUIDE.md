# Guide de Formatage du Contenu - Mah.ai

## 📋 Aperçu

Ce guide explique comment utiliser les nouveaux composants de formatage pour afficher le contenu de manière professionnelle et lisible, sans exposer les codes markdown bruts.

## 🎯 Composants Disponibles

### 1. **MarkdownRenderer** - Rendu complet du markdown

Le composant principal pour afficher tout contenu markdown avec support complet des équations mathématiques.

**Localisation:** `src/components/ui/MarkdownRenderer.tsx`

**Utilisation:**

```tsx
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export function MyComponent() {
  const content = `
# Titre principal

## Sous-titre

Voici une équation: $E = mc^2$

Et une équation display:
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
`;

  return (
    <MarkdownRenderer
      content={content}
      variant="light" // 'light' | 'dark' | 'minimal'
    />
  );
}
```

**Variants disponibles:**

- `light`: Style par défaut avec prose complet
- `dark`: Pour les fonds sombres
- `minimal`: Compact, optimisé pour les sidebars et petits espaces

### 2. **AIResponseFormatter** - Réponses IA formatées

Formatage spécialisé pour les réponses de l'IA avec styles cohérents.

**Localisation:** `src/components/ui/AIResponseFormatter.tsx`

**Utilisation:**

```tsx
import { AIResponseFormatter } from "@/components/ui/AIResponseFormatter";

<AIResponseFormatter
  content={aiResponse}
  variant="sidekick" // 'sidekick' | 'modal' | 'inline'
/>;
```

**Variants:**

- `sidekick`: Panneau latéral (avec fond violet clair)
- `modal`: Fenêtre modale (blanc avec bordure)
- `inline`: Sans styling spécial

### 3. **SubjectHeaderFormatter** - En-tête du sujet

Formatage des titres et métadonnées du sujet.

**Localisation:** `src/components/ui/SubjectHeaderFormatter.tsx`

**Utilisation:**

```tsx
import { SubjectHeaderFormatter } from "@/components/ui/SubjectHeaderFormatter";

<SubjectHeaderFormatter
  title="Physique - Problème de Mécanique"
  subtitle="Analyse d'un système en mouvement"
  year={2025}
  series="D"
  subject="Physique"
/>;
```

## 🧮 Format des Équations Mathématiques

### Formats Acceptés

Le système accepte et convertit automatiquement les formats suivants:

**Inline (dans le texte):**

```markdown
Voici l'équation $E = mc^2$ dans le texte.
```

**Display (centré sur sa propre ligne):**

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

**Format LaTeX pur (convertis automatiquement):**

```markdown
\(E = mc^2\) → $E = mc^2$
\[E = mc^2\] → $$E = mc^2$$
```

### Exemples Courants

```markdown
# Formule quadratique

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

# Dérivée

La dérivée de $f(x) = x^2$ est $f'(x) = 2x$.

# Intégrale

$$
\int_0^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

# Matrice

$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6
\end{bmatrix}
$$

# Système d'équations

$$
\begin{cases}
x + y = 10 \\
2x - y = 5
\end{cases}
$$
```

## 🎨 Styles CSS Appliqués

### Titres

- H1: Gris foncé, 3xl, marge haut/bas
- H2: Gris foncé, 2xl, bordure inférieure
- H3-H4: Gris foncé, gras

### Texte

- Paragraphes: Gris 700, interligne relaxé
- Listes: Indentation normale, styling UL/OL
- Code inline: Fond gris, couleur violette, padding léger
- Code blocks: Fond gris sombre, couleur claire

### Équations

- Inline: Styles KaTeX natifs, intégrés au texte
- Display: Centrées, avec espace vertical
- Support complet des symboles et structures mathématiques

### Autres éléments

- Blockquotes: Bordure gauche violette, fond teinté
- Tables: Bordures, header gris, responsive
- Links: Couleur violette, souligné au hover
- Horizontal rule: Gris clair

## 🚀 Où Utiliser Quoi

| Situation                       | Composant                | Variant   |
| ------------------------------- | ------------------------ | --------- |
| Afficher le sujet principal     | `MarkdownRenderer`       | `light`   |
| Réponse IA dans le sidekick     | `MarkdownRenderer`       | `minimal` |
| Réponse IA dans une modale      | `AIResponseFormatter`    | `modal`   |
| Titre et infos du sujet         | `SubjectHeaderFormatter` | -         |
| Contenu formaté sur fond sombre | `MarkdownRenderer`       | `dark`    |

## ❌ Ce qui N'est Plus Nécessaire

Vous n'avez plus besoin de:

```tsx
// ❌ ANCIEN - Ne plus utiliser
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// ❌ Ancien composant
<div className="prose prose-slate prose-lg ...">
  <ReactMarkdown remarkPlugins={...}>
    {content}
  </ReactMarkdown>
</div>

// ❌ Ancien composant obsolète
<MathText content={content} />
```

**Utilisez plutôt:**

```tsx
// ✅ NOUVEAU - À utiliser
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

<MarkdownRenderer content={content} variant="light" />;
```

## 🔧 Configuration Personnalisée

### Ajouter des styles personnalisés

```tsx
<MarkdownRenderer
  content={content}
  variant="light"
  className="custom-prose-styles"
/>
```

Puis dans votre CSS:

```css
.custom-prose-styles {
  /* Vos styles additionnels */
}
```

### Modifier les thèmes

Pour modifier les styles globalement, éditez `MarkdownRenderer.tsx`:

```tsx
// Dans la section des styles prose
prose-h1:text-4xl  // Augmente la taille des H1
prose-p:text-lg    // Augmente la taille des paragraphes
```

## 📝 Recommandations

1. **Équations mathématiques**: Toujours utiliser `$...$` ou `$$...$$`
2. **Code blocks**: Toujours indiquer la langue: ` ```python `
3. **Listes**: Utiliser `-` pour les puces, `1.` pour les numérotées
4. **Mises en avant**: Utiliser `**gras**` et `*italique*`, pas de HTML brut
5. **Images**: Éviter les images inline, préférer les liens
6. **Liens**: Utiliser la syntaxe `[texte](url)` standard markdown

## 🐛 Dépannage

### Les équations ne s'affichent pas

- Vérifier que `$...$` ou `$$...$$` entoure bien la formule
- Vérifier qu'il n'y a pas d'espaces inutiles
- Essayer le format `\(...\)` au lieu de `$...$`

### Le markdown affiche du code brut

- Vérifier que vous utilisez `MarkdownRenderer` et non du HTML brut
- S'assurer que le contenu est une string, pas du JSX

### Styles incohérents

- Vérifier le variant utilisé (light/dark/minimal)
- S'assurer que les conteneurs parents n'ont pas de styles conflictuels

## 📚 Ressources

- **KaTeX Documentation**: https://katex.org/docs/supported.html
- **Markdown Guide**: https://www.markdownguide.org/
- **React Markdown**: https://github.com/remarkjs/react-markdown
