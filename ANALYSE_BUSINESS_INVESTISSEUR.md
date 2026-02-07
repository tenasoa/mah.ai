# One-Pager Investisseur - mah.ai

Date: 7 fevrier 2026

## Proposition de valeur
mah.ai aide les eleves/etudiants a reviser des sujets d'examen avec:
- contenu pedagogique (sujets/corrections),
- assistant IA (reponse directe, detaillee, tutorat socratique),
- mecanique credits + abonnement.

## Probleme resolu
- Difficultes d'acces a des ressources fiables et expliquees.
- Besoin d'accompagnement personnalise, rapide et abordable.

## Modele economique
- Credits vendus par packs (10/50/100 credits).
- Abonnements Premium/VIP (a industrialiser en paiement recurent).
- Revenus complementaires possibles: soutien/don, B2B ecoles.

## Etat actuel (forces)
- Infrastructure produit deja en place (Next.js + Supabase + IA).
- Moteur credits fonctionnel et partage createur/site.
- Deja pret pour monetisation granulaire par action.

## Points a corriger avant scale
1. Unifier tous les debits IA dans une seule logique serveur.
2. Moneti ser explicitement le mode Socratique.
3. Supprimer les prix hardcodes cote UI.
4. Remplacer le bonus onboarding massif par bonus conditionnels.
5. Ajouter suivi du cout reel par requete IA (tokens/cout).

## Economie unitaire (ordre de grandeur)
Hypotheses:
- 1 credit vendu ~ 400 a 500 Ar.
- API IA facturee au token (OpenAI/Perplexity), cout variable mais generalement inferieur au revenu par action si garde-fous actifs.

Lecture:
- Les marges unitaires peuvent etre elevees.
- Le vrai risque est operationnel: abus d'usage, illimite mal borne, absence de pilotage cout.

## Plan 90 jours
- S1-S2: fermeture des fuites de marge + instrumentation cout.
- S3-S6: offres abonnement avec quota inclus (pas illimite pur).
- S7-S12: automatisation paiement, dashboard marge, optimisation infra.

## KPI d'investissement
- AI cost / AI revenue < 15%
- Conversion free -> payant > 3%
- Churn abonnement < 8% / mois
- Free-credit burn / revenue < 5%
- Delai validation paiement < 12h

## Usage des fonds (priorites)
- 40%: produit + fiabilite moneti sation
- 30%: acquisition et retention utilisateurs
- 20%: infrastructure/scalabilite
- 10%: legal/ops/support

## Risques et mitigation
- Risque cout IA: quotas, rate limits, caching, pricing dynamique.
- Risque fraude credits: verification paiements, anti multi-compte, audit logs.
- Risque churn: parcours activation, contenus premium differenciants, cohortes retention.

## Vision 12 mois
- Atteindre une boucle rentable: acquisition -> activation -> abonnement/credits -> retention.
- Etendre vers partenariats etablissements + offres B2B education.

## Sources de reference prix (a mettre a jour regulierement)
- OpenAI Pricing: https://platform.openai.com/docs/pricing
- Perplexity Pricing: https://docs.perplexity.ai/docs/getting-started/pricing
- Supabase Pricing: https://supabase.com/pricing/
- Vercel Pricing: https://vercel.com/pricing
