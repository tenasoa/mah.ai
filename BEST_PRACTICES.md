# Best Practices - Formatage Markdown et Équations

## 🎯 Principes Généraux

### 1. Toujours Utiliser `MarkdownRenderer`

Ne jamais importer `ReactMarkdown`, `remarkGfm`, `rehypeKatex` directement. Utiliser plutôt:

```tsx
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

// ✅ BON
<MarkdownRenderer content={markdown} variant="light" />;

// ❌ MAUVAIS
import ReactMarkdown from "react-markdown";
<ReactMarkdown>{markdown}</ReactMarkdown>;
```

### 2. Choisir le Bon Variant

- **`light`**: Pour les affichages principaux (sujets, articles)
- **`dark`**: Pour les contenus sur fonds sombres
- **`minimal`**: Pour les espaces limités (sidebars, modales étroites)

```tsx
// Dans SubjectReader - affichage principal
<MarkdownRenderer content={subject} variant="light" />

// Dans SocraticSidekick - espace étroit
<MarkdownRenderer content={response} variant="minimal" />

// Dans les modales - fond blanc
<MarkdownRenderer content={content} variant="light" />
```

---

## 🧮 Format des Équations Mathématiques

### Inline Math (dans le texte)

```markdown
La formule $a^2 + b^2 = c^2$ est le théorème de Pythagore.
```

**Résultat:** La formule a² + b² = c² est le théorème de Pythagore.

### Display Math (centrée)

```markdown
$$
a^2 + b^2 = c^2
$$
```

**Résultat:** Équation centrée sur sa propre ligne

### Formats Acceptés Automatiquement

Le système convertit automatiquement:

```markdown
\(a^2 + b^2 = c^2\) → $a^2 + b^2 = c^2$
\[a^2 + b^2 = c^2\] → $$a^2 + b^2 = c^2$$
```

### Structures Complexes

**Fractions:**

```markdown
$\frac{numerateur}{denominateur}$
```

**Racines:**

```markdown
$\sqrt[n]{x}$ ou simplement $\sqrt{x}$
```

**Exposants et indices:**

```markdown
$a^2$ pour a au carré
$a_i$ pour a indice i
$x^{2n}$ pour x exposant 2n
```

**Limites:**

```markdown
$\lim_{x \to \infty} f(x)$
```

**Sommes et produits:**

```markdown
$$\sum_{i=1}^{n} i$$
$$\prod_{i=1}^{n} a_i$$
$$\int_0^{\infty} f(x)dx$$
```

---

## 📋 Structure du Contenu Markdown

### Ordre Recommandé

1. Titre principal (H1)
2. Contexte/Introduction
3. Sections principales (H2)
4. Détails dans chaque section (H3, H4)
5. Conclusion

```markdown
# Titre du Sujet

Introduction courte expliquant le contexte.

## Section 1

Contenu...

### Sous-section 1.1

Détails...

## Section 2

Contenu...

---

## Conclusion

Résumé final.
```

### Formatage du Texte

**Gras:**

```markdown
**texte important** ou **texte important**
```

**Italique:**

```markdown
_texte souligné_ ou _texte souligné_
```

**Code inline:**

```markdown
`code snippet`
```

**Listes à puces:**

```markdown
- Point 1
- Point 2
  - Sous-point 2.1
  - Sous-point 2.2
- Point 3
```

**Listes numérotées:**

```markdown
1. Premier
2. Deuxième
3. Troisième
```

**Blockquote:**

```markdown
> Citation importante
> sur plusieurs lignes
```

**Code block:**

````markdown
```python
def fonction():
    return "code"
```
````

**Table:**

```markdown
| Colonne 1 | Colonne 2 |
| --------- | --------- |
| Valeur 1  | Valeur 2  |
| Valeur 3  | Valeur 4  |
```

---

## ✅ Checklist pour les Sujets

Avant de publier un sujet, vérifier:

- [ ] **Titre clair et complet** (matière, année, type d'examen)
- [ ] **Structure logique** avec sections H2 et H3
- [ ] **Équations bien formatées**
  - [ ] Chaque équation importante en display (`$$...$$`)
  - [ ] Équations inline intégrées au texte
  - [ ] Pas de caractères spéciaux non échappés
- [ ] **Pas de markdown brut visible** (pas de `# ` ou `**` affichés)
- [ ] **Images/diagrammes** - utiliser des descriptions textuelles ou liens si nécessaire
- [ ] **Listes bien indentées** et formatées
- [ ] **Code blocks** avec langage spécifié (python, java, etc.)
- [ ] **Pas d'espaces excédentaires** autour des formules

---

## 🐛 Dépannage Courant

### Équations qui ne s'affichent pas

**Problème:** `$a^2$` s'affiche comme texte brut
**Solution:** S'assurer qu'il n'y a pas d'espaces: `$a^2$` et non `$ a^2 $`

### Markdown affiché brut

**Problème:** Voir `**texte**` au lieu de **texte**
**Solution:** Utiliser `MarkdownRenderer`, pas du rendu manuel

### Formules trop grandes

**Problème:** Équation display déborde de la page
**Solution:** Utiliser `\displaystyle` ou diviser en parties

### Accents français dans les équations

**Problème:** Les accents dans les labels math causent des erreurs
**Solution:** Éviter les accents dans les formules, les mettre en texte brut:

```markdown
Soit $x$ la vitesse (en m/s)
```

---

## 🎨 Exemples Complets

### Exemple 1: Sujet de Mathématiques

```markdown
# Baccalauréat Mathématiques 2025 - Série D

## Exercice 1: Algèbre Linéaire

Résoudre le système suivant:

$$
\begin{cases}
2x + 3y = 12 \\
x - y = 1
\end{cases}
$$

**Méthode:** Utiliser la substitution ou la décomposition.

### Solution

De la deuxième équation: $x = y + 1$

Substituer dans la première:
$$2(y+1) + 3y = 12$$
$$2y + 2 + 3y = 12$$
$$5y = 10$$
$$y = 2$$

Donc $x = 3$ et $y = 2$.

**Vérification:**

- $2(3) + 3(2) = 6 + 6 = 12$ ✓
- $3 - 2 = 1$ ✓
```

### Exemple 2: Réponse IA Socratique

```markdown
# Analyse de ta question

Excellente observation sur les équations !

## Étape 1: Comprendre la structure

Regarde bien cette équation: $2x + 3y = 12$

**Question pour toi:** Que représente le coefficient 2 devant $x$ ?

## Étape 2: La méthode de substitution

Pour résoudre le système:

$$
\begin{cases}
2x + 3y = 12 \\
x - y = 1
\end{cases}
$$

Tu pourrais:

1. Exprimer $x$ en fonction de $y$ depuis une équation
2. Substituer dans l'autre équation
3. Résoudre l'équation résultante

**Peux-tu essayer le processus avec la deuxième équation ?**
```

---

## 💡 Tips & Tricks

### Tip 1: Formules imbriquées

```markdown
Calculer: $\frac{\frac{a}{b}}{\frac{c}{d}}$
```

### Tip 2: Grec et symboles spéciaux

```markdown
$\alpha, \beta, \gamma$ pour les lettres grecques
$\leq, \geq, \neq$ pour les inégalités
$\times, \div, \cdot$ pour les opérations
$\in, \subset, \cup, \cap$ pour les ensembles
```

### Tip 3: Matrices et vecteurs

```markdown
Vecteur: $\vec{v} = (1, 2, 3)$

Matrice:

$$
A = \begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$
```

### Tip 4: Annotations dans les équations

```markdown
Soit $f(x) = x^2 \quad \text{pour } x > 0$
```

### Tip 5: Cas de figures

```markdown
$$
|x| = \begin{cases}
x & \text{si } x \geq 0 \\
-x & \text{si } x < 0
\end{cases}
$$
```

---

## 🔗 Ressources Utiles

- **KaTeX Documentation:** https://katex.org/docs/supported.html
- **Markdown Guide:** https://www.markdownguide.org/
- **LaTeX Symbols:** https://www.latex-project.org/help/documentation/
- **React Markdown:** https://github.com/remarkjs/react-markdown

---

## 📞 Contact pour Questions

En cas de problème ou de question:

1. Consulter d'abord `FORMATTING_GUIDE.md`
2. Vérifier les exemples dans `FORMATTING_EXAMPLES.tsx`
3. Regarder les composants source
4. Contacter l'équipe de développement

---

**Version:** 1.0  
**Date:** 26 janvier 2026  
**Statut:** Documenté et prêt pour utilisation
