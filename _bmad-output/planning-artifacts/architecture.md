---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-01-22'
inputDocuments:
  - c:/Users/Tenasoa/Desktop/projetBmad/mah.ai/_bmad-output/planning-artifacts/prd.md
  - c:/Users/Tenasoa/Desktop/projetBmad/mah.ai/_bmad-output/planning-artifacts/prd-validation-report.md
  - c:/Users/Tenasoa/Desktop/projetBmad/mah.ai/_bmad-output/analysis/mah-ai-master-plan.md
  - c:/Users/Tenasoa/Desktop/projetBmad/mah.ai/_bmad-output/analysis/brainstorming-session-2026-01-21.md
workflowType: architecture
project_name: mah.ai
user_name: Tenasoa
date: '2026-01-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Architecture must support a **Mobile-First PWA** focused on high-stakes exam preparation.
- **Core Loop:** "Socratic" AI interaction overlaying PDF content. The AI acts as a tutor, not an answering machine.
- **Access Control:** "Freemium" model with a unique "Trust-based" manual payment flow to eliminate transaction friction.
- **Gamification:** Dual tracking system (Performance vs. Grit) requiring persistent state tracking across sessions.
- **Content Security:** Dynamic watermarking to discourage sharing, handled at the presentation layer.

**Non-Functional Requirements:**
- **Performance (Critical):** strict budget of < 500KB initial load and < 2s TTI on 3G networks.
- **Cost Efficiency:** AI Architecture must prioritize caching (Semantic Cache) to maintain margin.
- **Resilience:** System must degrade gracefully on unstable connections (Optimistic UI updates).
- **Security:** Lightweight DRM (Signed URLs + Watermarking) balanced against performance.

**Scale & Complexity:**
- **Primary Domain:** EdTech SaaS (B2C).
- **Complexity Level:** Medium. High constraint environment (Network/Device) increases engineering complexity despite simple feature set.
- **Estimated Architectural Components:** ~12-15 Core Services (Auth, Payment State Machine, AI Gateway/Cache, PDF Service, User Progression, Admin/Moderation).

### Technical Constraints & Dependencies

- **Stack:** Defined as Next.js (React).
- **Network:** Must assume high latency / packet loss (3G Madagascar).
- **Budget:** Strict optimization of Compute and Token usage required.
- **Payment:** Dependency on manual verification processes (Human-in-the-loop).

### Cross-Cutting Concerns Identified

1.  **Semantic Caching:** A unified layer to intercept AI requests and serve cached responses for cost/speed.
2.  **Optimistic State Management:** For payment "trust" access and weak connections.
3.  **Observability:** Tracking the "Trust Gap" (Fraud rate on immediate access) and AI pedagogical quality.

## Starter Template Evaluation

### Primary Technology Domain

**Progressive Web Application (PWA)** based on project requirements analysis.

### Starter Options Considered

1.  **Standard Next.js + Hand-rolled PWA:**
    *   *Pros:* Maximum control, no bloat.
    *   *Cons:* High effort to configure caching, manifest, and service worker correctly for a robust PWA.
    
2.  **`next-pwa`:** 
    *   *Status:* **Deprecated / Unmaintained**.
    *   *Verdict:* Avoid.

3.  **`@serwist/next` (Recommended):**
    *   *Status:* The modern, maintained fork of Workbox/next-pwa.
    *   *Pros:* Robust caching strategies, excellent Next.js 14+ / App Router support, actively maintained.
    *   *Cons:* Requires some configuration wizardry initially.

### Selected Starter: Official Next.js + Serwist

**Rationale for Selection:**
We need rock-solid offline support and aggressive caching ("Semantic Caching") to meet the "Serenity" and "Speed" requirements. **Serwist** is currently the industry standard for Next.js PWAs, allowing complex service worker logic (critical for our "trust-based" offline access) while integrating seamlessly with the Next.js App Router.

**Initialization Command:**

```bash
npx create-next-app@latest mah-ai --typescript --eslint --tailwind --no-src-dir --app --import-alias "@/*"
# Followed by:
# npm install @serwist/next @serwist/precaching @serwist/sw
# npx @serwist/cli wizard

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-22
**Document Location:** c:/Users/Tenasoa/Desktop/projetBmad/mah.ai/_bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- **8** Critical architectural decisions made (Stack, DB, Auth, AI, State, PWA, Caching, Style)
- **4** Critical Consistency Pattern categories defined (Naming, Structure, State, Error)
- **12+** Core Architectural Components specified
- **16** Functional Requirements fully supported

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions (Next.js 14, Supabase Gen 2)
- Consistency rules that prevent implementation conflicts (e.g., The Snake Rule)
- Project structure with clear boundaries (Domain-Driven)
- Integration patterns and communication standards (Optimistic UI, Semantic Cache)

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing **mah.ai**. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
npx create-next-app@latest mah-ai --typescript --eslint --tailwind --no-src-dir --app --import-alias "@/*"
# Followed by:
# npm install @serwist/next @serwist/precaching @serwist/sw
# npx @serwist/cli wizard
```

**Development Sequence:**

1. Initialize project using documented starter template
2. Set up Supabase and Environment Variables
3. Implement core architectural foundations (Auth, RLS, Layouts)
4. Build features following established patterns (Socratic AI, Trust Payment)
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen starter template and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- **TypeScript:** Enforced for type safety, critical for the complex "Trust" state machine.
- **Node.js:** Standard Next.js server runtime.

**Styling Solution:**
- **Tailwind CSS:** Selected for the "Lightweight" requirement (<50k CSS bundles are easier with Tailwind than massive component libraries).

**Build Tooling:**
- **Webpack (via Next.js):** Standard, optimized for PWA asset generation.

**Testing Framework:**
- *Not included by default.* We will manually add **Vitest** later for unit testing the "Trust Machine" logic.

**Code Organization:**
- **App Router:** Using the `/app` directory structure for better layout nesting (important for the persistent player/chat overlay).

**Development Experience:**
- **Serwist Wizard:** Automates the creation of `sw.ts` and `manifest.json`, reducing PWA boilerplate fatigue.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data Architecture: **Supabase** (PostgreSQL + RLS)
- AI Cost Architecture: **Semantic Caching Middleware** (OpenAI + Redis)
- Payment/Access: **Optimistic "Trust-First" State Machine**

**Important Decisions (Shape Architecture):**
- Real-time Engine: Supabase Realtime (Native)
- CSS Framework: Tailwind CSS (Verified via Starter)
- Search: PostgreSQL Full Text Search (Native in Supabase)

**Deferred Decisions (Post-MVP):**
- Independent Auth Service (Using Supabase Auth for MVP)
- Specialized Vector DB (Redis/pgvector is sufficient for MVP)
- Native Mobile Apps (PWA focus first)

### Data Architecture

**Database Choice: Supabase (PostgreSQL)**
- **Rationale:** The "Firebase Killer" with SQL power. Critical for **Row Level Security (RLS)** which allows us to embed business logic ("Premium users only") directly into the data layer, saving massive backend boilerplate.
- **RLS Policy:** `auth.uid() = user_id` for user data, `role = 'premium'` for content access.
- **Version:** Latest stable SaaS version.
- **Integrations:** Native Auth & Storage included.

**Caching Strategy: Hybrid**
- **SWR/TanStack Query:** For client-side data freshness.
- **Redis (Upstash):** Specifically for Semantic AI Caching (Shared Key/Value).

### Authentication & Security

**Auth Method: Supabase Auth**
- **Flow:** Phone Number (OTP) focus for Madagascar market.
- **Session:** JWT persisted with RLS context.

**Payment Security: "The Trust Gap" Architecture**
- **Pattern:** Optimistic UI + Strict Rate Limiting.
- **Limit:** Max 3 attempts/hour per IP/Device ID.
- **Shadow banning:** Silent failure for repeat offenders.
- **Rationale:** Reducing friction > Potential 1h theft.

### API & Communication Patterns

**AI Gateway Pattern (Lite)**
- **Architecture:** `Next.js Middleware` -> `Redis Semantic Cache` -> `OpenAI`.
- **Logic:** Hash(Prompt + SubjectID) -> Check Redis.
  - *Hit:* Return Cached Response (Cost : $0).
  - *Miss:* Call LLM -> Store Response -> Return.
- **Constraint:** Streaming responses must be cached as complete text blocks for simplicity in MVP.

### Frontend Architecture

**State Management: Zustand**
- **Why:** Redux is too heavy, Context is too messy for complex state. Zustand is perfect for the **Grit Score** and **Optimistic Payment State**.
- **Performance:** Transient updates (animations of points) without re-rendering the whole tree.

### Infrastructure & Deployment

**Hosting: Vercel**
- **Why:** Integrated with Next.js & Supabase.
- **Edge Functions:** For the AI Proxy layer (lowest latency).

### Decision Impact Analysis

**Implementation Sequence:**
1.  **Project Init:** Next.js + Serwist + Tailwind.
2.  **Supabase Init:** Database Schema + RLS Policies.
3.  **Auth Flow:** OTP Login.
4.  **Core Feature:** PDF Viewer + Basic Questions.
5.  **AI Layer:** Semantic Cache + OpenAI Integration.
6.  **Trust Machine:** Payment State Machine + Rate Limiting.

**Cross-Component Dependencies:**
- *The AI Layer depends on the DB Schema for Subject Context.*
- *The Trust Machine depends on Auth for persistent banning.*

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
4 key areas where consistency is mandatory for multi-agent development: Data Naming, State Logic, Error Recovery, and Component Hierarchy.

### Naming Patterns

**Database & Data Naming Conventions (The "Snake" Rule):**
*   **Context:** Supabase generates TypeScript types directly from PostgreSQL schema.
*   **Rule:** **Use `snake_case` for ALL data properties**, even in Frontend TypeScript code.
*   **Rationale:** Avoids expensive and buggy O(n) mapping layers.
*   **Examples:**
    *   ✅ `user.first_name`
    *   ✅ `subject.pdf_url`
    *   ❌ `user.firstName` (Forbidden for DB entities)
    *   **Exception:** Component Props and internal UI variables use `camelCase`.

**Code Naming Conventions:**
*   **Components:** `PascalCase` (e.g., `PaymentModal.tsx`)
*   **Functions/Variables:** `camelCase` (e.g., `calculateGritScore`)
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_TRUST_ATTEMPTS = 3`)

### Structure Patterns

**Project Organization (Domain-Driven):**
*   `app/` -> Routes and Layouts ONLY. Minimal logic.
*   `components/ui/` -> Dumb, stylistic components (Buttons, Cards).
*   `components/domain/` -> Smart, business-aware components (e.g., `SubjectViewer`, `TrustPaymentForm`).
*   `lib/` -> Pure functions (Logic that can be unit tested without React).

**File Structure Patterns:**
*   **Colocation:** Keep related parts together.
*   ✅ `components/domain/chat/ChatWindow.tsx`
*   ✅ `components/domain/chat/chat.store.ts` (Zustand store specific to this domain)

### Format Patterns

**API Response Formats (Supabase Standard):**
*   Follow the native Supabase `PostgrestResponse` format.
*   Structure: `{ data: T | null, error: PostgrestError | null }`
*   **NEVER** wrap responses in custom envelopes like `{ status: "success", payload: ... }`.

### Communication Patterns

**State Management Patterns (The "Three Buckets" Rule):**
1.  **Server State:** Managed by `SWR` or Server Components. Source of truth is DB.
2.  **App State:** Managed by `Zustand`. Only for global interactive state (User Session, Grit Points, active Payment flow).
3.  **UI State:** Managed by `useState`. Local generic state (isModalOpen, activeTab).

**Event System Patterns:**
*   **Feature Flags:** Use `Zustand` flags for Optimistic UI updates.
*   **Action Naming:** `verbNoun` (e.g., `submitPaymentCode`, `unlockSubject`).

### Process Patterns

**Error Handling & Optimistic UI (The "Toast & Rollback"):**
*   **Pattern:** Trust Request -> **IMMEDIATE Success UI** -> Async Validation.
*   **On Failure:**
    1.  Trigger "Rollback" action (Lock content).
    2.  Show Toast Error: "Validation Failed: Invalid Code".
    3.  Log incident to "Trust Gap" tracker.

### Enforcement Guidelines

**All AI Agents MUST:**
1.  **Respect the Snake:** Do not refactor DB types to camelCase.
2.  **Separate Logic:** Do not write complex business logic inside `app/page.tsx` files. Move to `components/domain`.
3.  **Test the Trust:** Any change to the Payment flow requires updating the `TrustPayment` unit tests.

**Anti-Patterns (Forbidden):**
*   ❌ Putting database queries inside Client Components.
*   ❌ Using Redux or Context for complex state.
*   ❌ Creating "Utils" folders that become junk drawers (Name buckets by Domain instead).

## Project Structure & Boundaries

### Complete Project Directory Structure

```bash
mah-ai/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── serwist.config.ts        # PWA config (generated by wizard)
├── .env.local
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── manifest.json        # PWA Manifest
│   ├── sw.js                # Service Worker entry (generated)
│   └── icons/
├── src/
│   ├── app/                 # ROUTING LAYER (Minimal Logic)
│   │   ├── layout.tsx       # Root Layout (Theme/Fonts)
│   │   ├── loading.tsx      # Global Skeleton
│   │   ├── (public)/        # Landing Page & Marketing
│   │   │   └── page.tsx
│   │   ├── (auth)/          # Payment & Login Flow
│   │   │   ├── login/
│   │   │   └── trust/       # Payment "Trust" Flow
│   │   ├── (app)/           # Protected Application Area
│   │   │   ├── layout.tsx   # Shell (Navbar + Sidebar)
│   │   │   ├── dashboard/
│   │   │   └── subject/
│   │   │       └── [id]/    # PDF Viewer + AI Chat
│   │   └── api/             # API Handlers
│   │       ├── ai/          # AI Proxy + Semantic Cache
│   │       │   └── chat/route.ts
│   │       └── webhooks/    # Supabase/Payment Webhooks
│   ├── components/          # COMPONENT LAYER
│   │   ├── ui/              # Dumb UI (Radix/Shadcn)
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   └── domain/          # Smart Business Components (Logic lives here)
│   │       ├── auth/        # OTP Forms
│   │       ├── subject/     # PDF Viewer, Comments
│   │       ├── chat/        # AI Chat Window, Message Bubbles
│   │       ├── trust/       # Payment Modal, Status Badge
│   │       └── shared/      # Navbar, Footers
│   ├── lib/                 # UTILITY LAYER (Pure Functions)
│   │   ├── supabase/        # Database Clients
│   │   │   ├── client.ts    # Browser Client
│   │   │   └── server.ts    # Server Client
│   │   ├── redis/           # Upstash Client for Semantic Cache
│   │   ├── utils.ts         # CN helper etc.
│   │   └── types/           # TS Interfaces (Database Generated)
│   ├── stores/              # STATE MANAGEMENT (Zustand)
│   │   ├── use-auth-store.ts
│   │   ├── use-grit-store.ts   # Gamification State
│   │   └── use-trust-store.ts  # Optimistic Payment State
│   └── tests/               # TESTING LAYER
│       └── trust/           # Critical "Trust Machine" Tests
└── middleware.ts            # Auth & Security Headers
```

### Architectural Boundaries

**API Boundaries:**
*   **External:** NO direct usage of OpenAI SDK in Client Components. All AI traffic MUST optimize via `/api/ai/chat` for Semantic Caching.
*   **Internal:** `/api/` routes are strictly for Server-Side logic (Webhooks, AI Proxy). Data fetching uses Server Actions or direct DB calls in Server Components.

**Component Boundaries:**
*   **Dumb UI (ui/):** Pure styling, no business logic, no `useStore`.
*   **Smart Domain (domain/):** Connects to `Zustand` stores and `SWR` hooks. Contains the "How".
*   **Pages (app/):** Composition only. Contains the "What".

**Data Boundaries:**
*   **Server State:** Owned by Supabase (PostgreSQL). Fetched via Server Components / SWR.
*   **Client State:** Owned by Zustand. (Session, UI interactions).

### Requirements to Structure Mapping

**Epic: "Socratic AI Tutor"**
*   **Components:** `src/components/domain/chat/`
*   **Services:** `src/lib/redis/` (For semantic cache)
*   **API:** `src/app/api/ai/chat/route.ts`

**Epic: "Trust-Based Payment"**
*   **Components:** `src/components/domain/trust/`
*   **State:** `src/stores/use-trust-store.ts` (Optimistic Logic)
*   **Tests:** `src/tests/trust/`

### Integration Points

**Internal Communication:**
*   Components trigger Actions -> Actions update Zustand/Server -> UI Reacts.
*   `use-trust-store` broadcasts "Unlock" events to `SubjectViewer`.

**External Integrations:**
*   **Supabase:** Auth & DB via `lib/supabase`.
*   **Upstash (Redis):** Caching via `lib/redis`.
*   **OpenAI:** Intelligence via `/api/ai` Proxy.

**Data Flow:**
1.  **Read:** Server Comp -> Supabase -> UI.
2.  **Write:** UI -> Server Action -> Supabase -> Revalidate Path.
3.  **AI:** UI -> API Route -> Redis (Hit?) -> OpenAI -> Stream Response.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices form a cohesive "Vercel Stack" ecosystem (Next.js, Supabase, Upstash) that is widely tested and documented. The combination of **Supabase RLS** and **Next.js Server Actions** eliminates the need for a separate API backend, reducing architectural complexity by ~40%.

**Pattern Consistency:**
The **Domain-Driven** directory structure directly supports the **"Three Buckets"** state management pattern by physically separating UI components (local state) from Domain components (Zustand/Server state).

**Structure Alignment:**
The strict separation of `app/` (Routing) and `components/domain/` (Logic) enforcing the **"Separate Logic"** rule is baked into the file tree.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
*   **Socratic AI:** Supported by `/api/ai` Proxy + Redis Semantic Cache.
*   **Trust Payment:** Supported by `use-trust-store` (Optimistic UI) and Supabase RLS policies.
*   **Gamification:** Supported by `use-grit-store` (Zustand) and persistent Supabase tables.

**Functional Requirements Coverage:**
All 16 FRs are architecturally supported. The critical "Trust-based" access (FR11-13) is enabled by the Optimistic UI pattern defined in the Process Patterns.

**Non-Functional Requirements Coverage:**
*   **Performance:** <500KB goal supported by Tailwind + Next.js Dynamic Imports + Serwist.
*   **Cost:** "Semantic Cache" architecture directly addresses the Cost Efficiency NFR.
*   **Security:** RLS + Signed URLs cover the "Content Security" NFR.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions (DB, Auth, AI, State) are locked. Versions (Next.js 14, Supabase Gen 2) are current.

**Structure Completeness:**
The file tree is specific, strictly defined, and maps 1:1 to the required features.

**Pattern Completeness:**
Naming conventions (snake_case DB) and State patterns are explicit enough to prevent agent conflicts.

### Gap Analysis Results

**Accepted Gaps (Post-MVP):**
1.  **Mobile Native:** We are building a PWA first. Native wrappers (Capacitor/Expo) are deferred.
2.  **Complex Vector Search:** We are using simple Redis caching for AI, not a full vector DB (Pinecone/Milvus) yet. Sufficient for distinct exam questions.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH. The stack is standard, but the specific "Trust" and "AI Cache" patterns are tailored expertly to the unique project constraints (Madagascar connectivity/economy).

**Key Strengths:**
1.  **Semantic Caching:** Turns variable AI costs into fixed infrastructure costs.
2.  **Trust Machine:** User experience innovation backed by solid state machine architecture.
3.  **Snake_case Rule:** Eliminates an entire class of "mapping" bugs between DB and Frontend.

### Implementation Handoff

**AI Agent Guidelines:**
- **Respect the Snake:** `snake_case` for all data. No exceptions.
- **Domain First:** Logic lives in `components/domain/`, not `app/`.
- **Optimistic Default:** UI should feel faster than the network (Trust Flow).

**First Implementation Priority:**
Initialize project with: `npx create-next-app@latest mah-ai --typescript --eslint --tailwind` then `serwist` setup.
