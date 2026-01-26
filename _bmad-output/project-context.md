---
project_name: 'mah.ai'
user_name: 'Tenasoa'
date: '2026-01-26'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'dont_miss_rules']
status: 'complete'
rule_count: 35
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email + OTP focus)
- **State Management:** Zustand (Global), React State (UI)
- **Markdown:** react-markdown, remark-gfm, remark-math, rehype-katex, remark-breaks
- **PDF:** marked (server-side) + KaTeX auto-render (Puppeteer)
- **PWA:** @serwist/next
- **Caching:** Upstash Redis (Semantic Cache)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)
- **Strict Mode:** `strict: true` is mandatory. No `any` types allowed.
- **Async Patterns:** Use `async/await` over `.then()`.
- **Interfaces:** Use `interface` for object definitions, `type` for unions/primitives.
- **Export:** Use Named Exports (`export const`) over Default Exports (`export default`) for better refactoring support (except for Next.js Pages).

### Framework-Specific Rules (Next.js & React)
- **Next.js 15+ Params:** `params` and `searchParams` in pages and metadata are PROMISES and must be awaited.
- **Client vs Server:**
  - Default to Server Components.
  - Add `'use client'` ONLY when interactivity (hooks, event listeners) is needed.
  - **Forbidden:** Putting sensitive DB logic/keys in Client Components.
- **Component Architecture:**
  - **UI Components:** "Dumb" (props only).
  - **Domain Components:** "Smart" (connect to Zustand/SWR).
  - **Pages:** Composition only (no logic).
- **Data Fetching:**
  - Use Server Actions for mutations and data updates.
  - Prefer Server Components for initial page data; in client-only pages (profile/notifications), use client Supabase reads.

### Testing Rules
- **Strategy:** Focus on "Critical User Journeys" (Editor, AI Chat, Trust Payment).
- **Unit Tests:** Mandatory for `lib/utils` (Pure functions).
- **Tooling:** Vitest.

### Code Quality & Style Rules
- **Formatting:** Prettier default config.
- **Linting:** `eslint:recommended` + `react-hooks/recommended`.
- **Comments:** Explain "WHY" not "WHAT".
- **Naming Conventions:**
  - **Data/DB:** ALWAYS use `snake_case` for database entities and matching TypeScript interfaces. NO mapping to camelCase.
  - **Components:** `PascalCase` (e.g., `SubjectReader.tsx`).
  - **Functions/Variables:** `camelCase` (e.g., `calculateGritScore`).
  - **Constants:** `UPPER_SNAKE_CASE`.

### Global Patterns & Boundaries
- **Logic Location:** Business logic MUST live in `src/components/domain/`, NOT in `src/app/` pages.
- **AI Proxy:** NEVER call OpenAI/Perplexity directement depuis le client. ALWAYS use server actions to leverage context injection.
- **Content Security:** Access is managed via Supabase RLS. Admins have automatic bypass.
- **Pricing:** 1 Credit = 500 Ar. Centralized consumption via `consumeCredits` server action or `check_and_consume_credits` RPC.
- **Pagination:** Use "Charger plus" by increasing `limit` in the URL (no page numbers) for long lists.

### Critical Don't-Miss Rules (Markdown & AI)
- **"The Snake Rule":** DB properties are ALWAYS snake_case.
- **Markdown Context:** AI Sidekick MUST always receive the `markdown_content` of the subject to provide accurate guidance.
- **Zen Reader:** The reading interface must remain "Zen" (no distractions) and support LaTeX via KaTeX.
- **Admin Access:** Administrators bypass all credit costs and locking mechanisms. RLS must handle admin checks via JWT app_metadata or SECURITY DEFINER functions to avoid recursion.
- **PWA Ready:** Use the `@serwist/sw` hooks for offline sync logic.
- **Math Rendering:** Extract LaTeX before `marked` on server (PDF) to avoid escaping; normalize `$$...$$` blocks in the Markdown renderer for display math.
- **Credit Purchases:** `credit_purchases` statuses are `pending | completed | failed`; admins validate and then update `profiles.credits_balance`.
- **Notifications:** Use `create_notification` RPC (fallback insert) and Realtime filtered by `user_id`. Users can update/delete own notifications; admins can insert.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-01-26

