# Analyse Business - mah.ai

Date: 7 fevrier 2026

## 1) Resume executif
Le projet peut devenir rentable rapidement, mais il faut d'abord corriger 4 fuites de marge:
- prix credits ecrases en dur dans l'UI,
- debit IA non unifie,
- usage IA socratique non moneti se explicitement,
- bonus onboarding trop genereux sans garde-fous.

## 2) Ce qui est deja bon
- Tarification credits en base:
  - AI_RESPONSE_COMPLETE = 2
  - AI_RESPONSE_DETAILED = 4
  - UNLOCK_SUBJECT = 2
  - UNLOCK_ANSWER = 2
- Packs credits:
  - 10 = 5000 Ar
  - 50 = 22500 Ar
  - 100 = 40000 Ar
- Logique debit apres succes IA deja en place pour `generate-ai-response`.

## 3) Points critiques a corriger
### 3.1 Prix forces cote front
La page credits force les prix meme si l'admin change la configuration DB.
Impact: incoherence produit + perte de controle business.

### 3.2 Debit IA heterogene
- Route reponse IA: RPC centralisee `check_and_consume_credits`.
- Route correction IA: debit fixe via `deduct_credits`.
- Socratique: appel Perplexity sans debit credits explicite.
Impact: trou de moneti sation et suivi difficile.

### 3.3 Bonus inscription
100 credits offerts d'entree. Trop eleve sans condition de retention.
Impact: cout acquisition cache et risque d'abus multi-comptes.

### 3.4 Abonnements
UI affiche Premium/VIP mais conversion abonnement pas industrialisee.
Impact: revenu recurrent sous-exploite.

## 4) Economie unitaire (estimation prudente)
Hypotheses:
- 1 USD ~= 4460 Ar (a verifier en continu)
- 1 credit vendu ~= 400-500 Ar selon pack

Lecture business:
- Reponse IA directe (2 credits): revenu ~800-1000 Ar
- Reponse IA detaillee (4 credits): revenu ~1600-2000 Ar
- Correction IA (5 credits): revenu ~2000-2500 Ar

Dans la plupart des cas texte, le cout API IA reste inferieur au revenu par action.
Conclusion: le risque principal n'est pas le tarif unitaire, mais l'absence de pilotage fin des couts et de garde-fous.

## 5) Plan business fiable (90 jours)
## Phase 1 (S1-S2): fermer les fuites
- Unifier tous les debits IA sur une seule RPC.
- Ajouter action types dedies: `AI_GRADE`, `AI_SOCRATIC`.
- Supprimer les prix hardcodes du front credits.
- Journaliser par requete: provider, model, tokens in/out, cout USD, cout MGA, credits factures.
- Ajouter rate-limit et plafond journalier.

## Phase 2 (S3-S6): offre soutenable
- Remplacer "illimite" par "quota inclus".
- Proposition:
  - Premium 19 000 Ar/mois: contenu + 120 credits IA/mois
  - VIP 39 000 Ar/mois: contenu + 400 credits IA/mois
  - Hors quota: paiement en credits
- Bonus onboarding: 30 credits immediats + bonus conditionnels (profil complete, premiere action utile).

## Phase 3 (S7-S12): scaler proprement
- Reduire la validation manuelle paiements.
- Mettre dashboard marge et alertes.
- Optimiser cache et prompts longs.

## 6) KPI de pilotage (a suivre chaque semaine)
- AI cost / AI revenue < 15%
- Free credit burn / revenue < 5%
- Conversion free -> payant > 3%
- Churn abonnement < 8% / mois
- Delai validation paiement < 12h

## 7) Couts fixes a anticiper (sortie des offres gratuites)
- Supabase Pro: a partir de 25 USD/mois + sur-usage
- Vercel Pro: 20 USD/mois (par membre selon plan)
- Domaine:
  - .com souvent faible cout annuel
  - .ai nettement plus cher
- Redis/monitoring/backups: budget progressif a prevoir

## 8) Decision pricing recommandee
- Garder la logique credits actuelle comme base.
- Priorite: moneti ser Socratique et tracer les tokens reels.
- Ajuster ensuite les prix avec des donnees reelles (pas a l'intuition).

## 9) Sources externes (a controler regulierement)
- OpenAI pricing: https://platform.openai.com/docs/pricing
- OpenAI model card (gpt-4o-mini): https://platform.openai.com/docs/models/gpt-4o-mini
- Perplexity pricing: https://docs.perplexity.ai/docs/getting-started/pricing
- Perplexity Sonar models: https://docs.perplexity.ai/docs/getting-started/models/models/sonar
- Supabase pricing: https://supabase.com/pricing/
- Supabase billing docs: https://supabase.com/docs/guides/platform/billing-on-supabase
- Vercel pricing: https://vercel.com/pricing
- Vercel Pro docs: https://vercel.com/docs/plans/pro
- Domaines (.com): https://porkbun.com/products/domains
- Conversion USD/MGA: https://wise.com/us/currency-converter/usd-to-mga-rate
