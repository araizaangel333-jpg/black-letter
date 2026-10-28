---
title: { en: "Your company needs an AI policy by Friday", es: "Tu empresa necesita una política de AI para el viernes" }
course: externship
kind: memo
topics: [technology]
framework: BLUF
timeLimit: 30
targetWords: 400
difficulty: 2
checklist:
  - { id: bluf, label: { en: "First sentence: the recommendation (adopt a three-tier policy now) and the decision requested", es: "Primera oración: la recomendación (adoptar una política de tres niveles ya) y la decisión que se pide" }, points: 2, kind: conclusion }
  - { id: tiers, label: { en: "Approved tools by tier and the data each may receive", es: "Herramientas aprobadas por nivel y los datos que cada una puede recibir" }, points: 2, kind: rule }
  - { id: prohibited, label: { en: "Prohibited inputs: privileged, personal, trade secrets, material nonpublic information, litigation-hold material", es: "Entradas prohibidas: privilegiado, datos personales, secretos, información relevante no pública, material bajo litigation hold" }, points: 1, kind: rule }
  - { id: verify, label: { en: "Human verification of every output, with citations checked against the source", es: "Verificación humana de todo resultado, con citas cotejadas contra la fuente" }, points: 1, kind: rule, authority: "ABA Op. 512; Tex. Op. 705" }
  - { id: heppner, label: { en: "States the Heppner rule in one sentence for employees", es: "Enuncia la regla de Heppner en una oración para empleados" }, points: 1, kind: rule, authority: "United States v. Heppner (S.D.N.Y. 2026)" }
  - { id: governance, label: { en: "Owner, training, incident path, review cadence, board reporting", es: "Responsable, capacitación, ruta de incidentes, periodicidad de revisión, reporte al consejo" }, points: 1, kind: application }
  - { id: plain, label: { en: "Plain English, under 400 words, no citations in the body (authorities in a footnote or appendix line)", es: "Inglés llano, menos de 400 palabras, sin citas en el cuerpo (autoridades en una línea de anexo)" }, points: 1, kind: application }
  - { id: ask, label: { en: "Ends with the decision needed and the date", es: "Cierra con la decisión necesaria y la fecha" }, points: 1, kind: conclusion }
related:
  briefs: [externship/united-states-v-heppner]
  terms: [ai-use-policy, aba-formal-opinion-512, texas-ethics-opinion-705, heppner-ai-privilege, bluf]
status: draft
source: "Original drill written for this site; invented company; parallel to the class 10 breakout lab"
verified: false
updated: "2026-10-28"
---
## Assignment
You are the only lawyer at Bluebonnet Logistics, Inc., a 600-employee trucking company in Fort Worth with a public-company customer base. Last week a dispatcher pasted a customer contract into a free chatbot to summarize it, and a recruiter used another tool to screen résumés. The CEO wants an AI policy approved at Friday's executive meeting and asked you for a one-page memo.

Write the BLUF memo to the CEO recommending the policy and summarizing its contents. Under 400 words.

## Model answer
To: CEO. From: General Counsel. Re: AI use policy for approval Friday.

Recommendation: approve the attached three-tier AI policy on Friday and announce it Monday; last week's two incidents show we are already using these tools without rules, and the rules are short.

What the policy does. Tier 1, public tools (free chatbots): allowed for public information only; nothing about customers, employees, contracts or litigation goes in, because anything typed into a public tool is a disclosure to a third party that a court will not protect. Tier 2, our enterprise tools with no-training and retention terms: allowed for internal work, including contract summaries, with the output checked by the person responsible. Tier 3, legal and HR work: only tools legal has approved, used under legal's direction, so that privilege and privacy protections survive.

Five rules for everyone. Never enter personal data, customer contracts, confidential business information or anything under a legal hold into a Tier 1 tool. Verify every output before relying on it; the tool's mistake is our mistake. Disclose AI use where a customer, a court or a contract requires it. Do not use AI to make hiring, discipline or credit decisions without HR and legal review, because screening tools can discriminate and some states regulate them. Report any suspected leak to legal the same day.

Governance. I own the policy; HR and IT co-own training; every employee completes a twenty-minute training by December 15; IT keeps the approved-tool list; we review the policy quarterly and report incidents to the audit committee.

Why now. The contract paste may have breached the customer's confidentiality clause; the résumé screening may have exposed us to discrimination claims; both are cheap to prevent and expensive to defend.

Decision needed: approve the policy and the training deadline on Friday.

Authorities (for the file): ABA Formal Opinion 512; Texas Ethics Opinion 705; United States v. Heppner (S.D.N.Y. 2026).

## Common mistakes
- Opening with the history of AI instead of the recommendation.
- Banning AI outright, which the business will ignore.
- Forgetting the non-lawyers: the policy is for dispatchers and recruiters, so it must be readable by them.
