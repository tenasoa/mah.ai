/**
 * Exemples d'utilisation des nouveaux composants de formatage
 * Ces exemples montrent comment intégrer les composants dans vos pages
 */

// ============================================
// EXEMPLE 1: Afficher un sujet complet
// ============================================

import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { SubjectHeaderFormatter } from "@/components/ui/SubjectHeaderFormatter";

export function SubjectDisplayExample() {
  const subjectContent = `
# Épreuve de Mathématiques - BAC 2025

## Exercice 1: Algèbre

Résoudre l'équation suivante:
$$
x^2 + 5x + 6 = 0
$$

**Solution:**
- Utiliser la formule quadratique: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
- Avec $a = 1$, $b = 5$, $c = 6$:
$$
x = \frac{-5 \pm \sqrt{25 - 24}}{2} = \frac{-5 \pm 1}{2}
$$

Les solutions sont $x_1 = -2$ et $x_2 = -3$.

## Exercice 2: Géométrie

Calculer l'aire du triangle avec sommets $A(0,0)$, $B(3,0)$, $C(0,4)$.

L'aire est donnée par:
$$
A = \frac{1}{2} |base \times hauteur| = \frac{1}{2} \times 3 \times 4 = 6
$$
`;

  return (
    <div className="space-y-6">
      <SubjectHeaderFormatter
        title="Mathématiques"
        subtitle="Épreuve du Baccalauréat 2025"
        year={2025}
        series="D"
        subject="Mathématiques"
      />

      <MarkdownRenderer content={subjectContent} variant="light" />
    </div>
  );
}

// ============================================
// EXEMPLE 2: Afficher une réponse IA
// ============================================

import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export function AIResponseExample() {
  const aiResponse = `
# Analyse de votre question

Excellente question sur les équations quadratiques !

## Étape 1: Identification
Tu dois identifier les coefficients:
- $a = 1$ (coefficient de $x^2$)
- $b = 5$ (coefficient de $x$)
- $c = 6$ (terme constant)

## Étape 2: Formule quadratique
La formule générale pour résoudre $ax^2 + bx + c = 0$ est:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Étape 3: Calcul du discriminant
$$
\Delta = b^2 - 4ac = 25 - 24 = 1
$$

## Étape 4: Trouver les solutions
$$
x = \frac{-5 \pm 1}{2}
$$

Ce qui donne:
- $x_1 = \frac{-5 + 1}{2} = -2$
- $x_2 = \frac{-5 - 1}{2} = -3$

## Vérification
Substitue dans l'équation originale pour vérifier:
- Pour $x = -2$: $(-2)^2 + 5(-2) + 6 = 4 - 10 + 6 = 0$ ✓
- Pour $x = -3$: $(-3)^2 + 5(-3) + 6 = 9 - 15 + 6 = 0$ ✓

**As-tu compris pourquoi le discriminant est important ?**
`;

  return (
    <div className="max-w-2xl">
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
        <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">
          Réponse du tuteur
        </div>
        <MarkdownRenderer content={aiResponse} variant="minimal" />
      </div>
    </div>
  );
}

// ============================================
// EXEMPLE 3: Intégration dans SocraticSidekick
// ============================================

import { useState } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function SocraticSidekickExample() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: `Bonjour ! Je suis ton tuteur Socratique. 

Je ne vais pas te donner les réponses directement, mais plutôt te poser des questions pour que tu trouves toi-même.

Par exemple, pour résoudre $x^2 - 4 = 0$, je pourrais te demander:
- Qu'est-ce que tu remarques dans cette équation?
- Peux-tu factoriser le côté gauche?

Comment puis-je t'aider aujourd'hui ?`,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      // Simuler une réponse IA
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              "C'est une bonne observation ! Réfléchis maintenant à la prochaine étape...",
          },
        ]);
      }, 500);
      setInput("");
    }
  };

  return (
    <aside className="flex flex-col h-screen bg-slate-900 text-white p-4 rounded-xl">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              {msg.role === "ai" && (
                <MarkdownRenderer content={msg.content} variant="minimal" />
              )}
              {msg.role === "user" && <p>{msg.content}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question..."
          className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="p-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

// ============================================
// EXEMPLE 4: Formatage personnalisé
// ============================================

import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export function CustomFormattingExample() {
  const complexContent = `
# Analyse Complexe

## Formules avec structures mathématiques

### Matrices
$$
\\begin{bmatrix}
1 & 2 & 3 \\\\
4 & 5 & 6 \\\\
7 & 8 & 9
\\end{bmatrix}
$$

### Système d'équations
$$
\\begin{cases}
2x + 3y = 12 \\\\
x - y = 1
\\end{cases}
$$

### Fractions imbriquées
$$
\\frac{\\frac{a}{b}}{\\frac{c}{d}} = \\frac{a}{b} \\times \\frac{d}{c}
$$

### Code avec syntaxe highlighting
\`\`\`python
def solve_quadratic(a, b, c):
    discriminant = b**2 - 4*a*c
    x1 = (-b + discriminant**0.5) / (2*a)
    x2 = (-b - discriminant**0.5) / (2*a)
    return x1, x2
\`\`\`

## Autres éléments

> **Note importante:** Toujours vérifier tes résultats !

- Point 1
- Point 2
  - Sous-point 2.1
  - Sous-point 2.2
- Point 3

| Opération | Symbole |
|-----------|---------|
| Addition | $+$ |
| Multiplication | $\\times$ |
| Division | $\\div$ |
`;

  return (
    <div className="p-6 bg-white rounded-lg">
      <MarkdownRenderer
        content={complexContent}
        variant="light"
        className="max-w-4xl"
      />
    </div>
  );
}

// ============================================
// EXEMPLE 5: Gestion des erreurs et cas limites
// ============================================

export function ErrorHandlingExample() {
  const emptyContent = "";
  const mathOnlyContent = "$$E = mc^2$$";
  const mixedContent = `
Voici une formule simple: $a = b + c$

Et une plus complexe:
$$
\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}
$$
`;

  return (
    <div className="space-y-4">
      {/* Contenu vide */}
      <div>
        <h3 className="font-bold mb-2">Contenu vide:</h3>
        <MarkdownRenderer content={emptyContent} variant="light" />
      </div>

      {/* Formules uniquement */}
      <div>
        <h3 className="font-bold mb-2">Formules uniquement:</h3>
        <MarkdownRenderer content={mathOnlyContent} variant="light" />
      </div>

      {/* Contenu mixte */}
      <div>
        <h3 className="font-bold mb-2">Contenu mixte:</h3>
        <MarkdownRenderer content={mixedContent} variant="light" />
      </div>
    </div>
  );
}
