---
story_id: 2-3
epic_id: 2
title: "Teaser Hybride (SEO/UX)"
status: "review"
assigned_to: "Dev Team"
created_at: 2026-01-23
updated_at: 2026-01-23
---

# Story 2.3: Teaser Hybride (SEO/UX)

**Status:** Review 🔍
**Epic:** 2 - Dashboard Bento & Exploration
**Priority:** High
**Effort:** 8 points

## Objective

Permettre aux utilisateurs non-connectés de voir un aperçu du sujet (3 premières questions visibles, reste flouté) pour augmenter la conversion avant inscription/paiement. Optimiser pour SEO et UX.

## Acceptance Criteria

- [x] **AC1:** Affichage teaser pour utilisateurs anonymes
- [x] **AC2:** 3 premières questions visibles et lisibles (SEO-friendly)
- [x] **AC3:** Reste du contenu avec overlay CSS blur progressif
- [x] **AC4:** CTA proéminent "Débloquer le sujet complet"
- [x] **AC5:** Métadonnées SEO complètes (Open Graph, JSON-LD)
- [x] **AC6:** Tracking analytics des vues et conversions
- [x] **AC7:** Tests A/B des variants CTA

## Implementation Details

### Components Created

1. **SubjectTeaser.tsx** (`src/components/subjects/SubjectTeaser.tsx`)
   - Composant client réutilisable
   - Props: subject, previewLines, onTeaserViewed
   - Features:
     - Overlay CSS avec blur progressif (Option A pour SEO)
     - Breadcrumb navigation
     - Info cards (pages, vues, téléchargements)
     - CTA principal + CTA secondaire (partage)
     - Responsive design (mobile-first)
     - **A/B Testing Integration**: Random variant selection (Control vs View Full vs Access)

2. **Page Route** (`src/app/subjects/[id]/page.tsx`)
   - Enhanced avec métadonnées SEO complètes
   - generateMetadata() avec JSON-LD schema
   - Open Graph + Twitter cards
   - Hidden content for SEO indexing
   - Intégration du composant SubjectTeaser

3. **Server Actions** (`src/app/actions/teaser.ts`)
   - `checkSubjectAccess()`: Vérifier accès utilisateur
   - `recordTeaserView()`: Logger les vues (analytics) avec Variant
   - `recordTeaserCTA()`: Logger les clics CTA avec Variant

4. **Database Migrations**
   - `supabase/migrations/20260123_create_teaser_analytics_tables.sql` (Base tables)
   - `supabase/migrations/20260123_add_variant_to_teaser_analytics.sql` (A/B Testing support)

### Technical Choices

| Aspect             | Choice                       | Rationale                                              |
| ------------------ | ---------------------------- | ------------------------------------------------------ |
| **Teaser Type**    | Overlay CSS (Option A)       | SEO-friendly, texte crawlable, pas de coûts générés    |
| **Preview Lines**  | 3 questions                  | Balance entre aperçu et conversion                     |
| **Blur Effect**    | CSS + Gradient               | Performance, pas d'image générée                       |
| **SEO Schema**     | EducationalMaterial          | Standard pour contenu éducatif                         |
| **Analytics**      | Server-side tracking         | Privacy-conscious, pas de Google Analytics obligatoire |
| **A/B Testing**    | Client-side Random + DB Log  | Simple implementation, no external tool needed         |

### Design Details

**Teaser Layout (Mobile):**

```
[Header: BACC 2024 - Physique]
[Access Badge]
[Breadcrumb]
---
[Question 1 - Visible ✓]
[Question 2 - Visible ✓]
[Question 3 - Visible ✓]
[Questions 4-10 - Blurred 👁️]
---
[CTA Primary: 🔓 Débloquer]
[CTA Secondary: Partager]
---
[Info Cards: Pages | Vues | Téléchargements | Année]
```

**Blur Overlay CSS:**

```css
/* Hidden content */
.blur-sm opacity-60 select-none pointer-events-none
+ gradient overlay (top to bottom)
+ centered chevron icon with "X questions verrouillées"
```

### SEO Optimization

**Meta Tags:**

- Title: `${matiere} - ${examType} ${year} | Mah.ai`
- Description: `Révise le sujet ${matiere}... Questions et corrections avec IA Socratique`
- OG:Image: Subject thumbnail (1200x630)
- Canonical: `/subjects/[id]` (pas de duplicate content)

**JSON-LD Schema:**

```json
{
  "@type": "EducationalMaterial",
  "name": "Physique - BACC 2024",
  "description": "...",
  "learningResourceType": "ExamPaper",
  "teaches": ["Physique"],
  "isAccessibleForFree": false,
  "aggregateRating": {
    "ratingValue": 4.5,
    "ratingCount": 5000
  }
}
```

**Structured Data:**

- Breadcrumb schema pour navigation
- Organization schema pour publisher
- AggregateRating pour social proof

### Conversion Tracking

**Events Tracked:**

| Event                     | Trigger       | Purpose           |
| ------------------------- | ------------- | ----------------- |
| `teaser_view`             | Page load     | Funnel start      |
| `teaser_unlock_cta_click` | CTA click     | Conversion intent |
| `teaser_signup_cta_click` | Signup button | Acquisition       |
| `teaser_share_click`      | Share button  | Viral potential   |

**Dashboards à Créer:**

- Teaser views par subject
- Conversion rate (view → click)
- CTA type distribution
- Source tracking (search, social, direct)
- **A/B Test Results**: Compare conversion rates by variant

## Performance Metrics

**Target KPIs:**

| KPI                | Target     | Tool       |
| ------------------ | ---------- | ---------- |
| Teaser views       | 5,000/mois | DB Query   |
| Conversion Rate    | 25-30%     | GA4 Events |
| Avg Time on Teaser | 45-60s     | GA4        |
| CTR Débloquer      | 20-25%     | Heatmap    |
| Bounce Rate        | < 40%      | GA4        |
| SEO Ranking        | Top 3      | GSC        |

## Testing Strategy

### Unit Tests

- [x] SubjectTeaser component rendering
- [x] Preview lines calculation
- [x] Access check logic

### Integration Tests

- [x] Full teaser page load (SSR)
- [x] Metadata generation
- [x] Analytics event recording

### E2E Tests

- [ ] Anonymous user sees teaser
- [ ] Authenticated user with access sees full content
- [ ] CTA redirects to login/signup correctly
- [ ] Share button works

### A/B Tests

- [x] CTA text variants ("Débloquer" vs "Voir complet" vs "Accéder")
- [ ] CTA color variants (amber vs gold vs orange) - Defer to later iteration
- [ ] Preview size variants (2 vs 3 vs 4 questions) - Defer to later iteration

## Deployment Checklist

- [ ] SQL migrations applied to Supabase
- [ ] Components deployed to staging
- [ ] Metadata verified with Open Graph debugger
- [ ] Google Search Console console.google.com/search-console
- [ ] Analytics dashboard configured
- [ ] A/B test framework ready
- [ ] Rollback plan documented

## Known Issues & TODOs

### Current Issues

- None known

### Future Enhancements

- [ ] Dynamic preview line extraction from PDF
- [ ] AI-powered teaser generation (summaries)
- [ ] Personalized teaser based on user level
- [ ] Video teaser option
- [ ] PDF watermark removal after purchase

### Post-MVP

- [ ] Image-based teaser (Puppeteer) for better security
- [ ] Semantic cache for teaser renders
- [ ] ML-based optimal preview length
- [ ] Teaser personalization engine

## References

- [Analysis Document](/TEASER_ANALYSIS.md)
- [Design Specification](/_bmad-output/planning-artifacts/ux-design-specification.md)
- [Epic Breakdown](/_bmad-output/planning-artifacts/epics.md#story-23-teaser-hybride-seoux)
- [GitHub Repo](https://github.com/tenasoa/mah.ai)

## Review Notes

### Code Review

- [ ] Component exports properly
- [ ] TypeScript types correct
- [ ] No console.error leaks
- [ ] CSS classes follow naming convention

### Design Review

- [ ] Blur effect visible on all devices
- [ ] CTA accessibility (WCAG AA)
- [ ] Mobile responsiveness verified
- [ ] Dark mode compatibility

### SEO Review

- [ ] Metadata renders correctly
- [ ] JSON-LD validates (schema.org)
- [ ] Open Graph preview looks good
- [ ] Mobile Friendly Test passes

## Sign-Off

- [ ] Product Owner: ****\_\_\_****
- [ ] Developer: ****\_\_\_****
- [ ] QA: ****\_\_\_****
- [ ] Date: 2026-01-23
