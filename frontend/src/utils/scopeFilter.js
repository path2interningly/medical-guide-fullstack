/**
 * Scope filtering utilities for mass card generation
 */

export const buildUserConstraints = (input) => {
  const lower = input.toLowerCase();
  const wantsPrescriptions = /prescription|prescribe|medication|dose|dosing|mg|q\d+h|tablet|capsule|po|iv|im|sc|subcut|topical|treatment.*prescription/.test(lower);

  if (wantsPrescriptions) {
    return [
      '⚠️ STRICT: Output ONLY prescription-related content. Exclude pathophysiology, clinical findings, anatomy, investigations.',
      '- Every card MUST include: medication name, dose, route, frequency, duration, and indication(s).',
      '- If a medication is not explicitly mentioned in the document, do not invent it.'
    ].join('\n');
  }

  return '- Follow the USER REQUEST exactly. Do not include unrelated topics.';
};

export const filterCardsByScope = (cards, userRequest) => {
  const lower = userRequest.toLowerCase();
  const wantsPrescriptions = /prescription|prescribe|medication|dose|dosing|mg|q\d+h|tablet|capsule|po|iv|im|sc|subcut|topical|treatment.*prescription/.test(lower);

  if (!wantsPrescriptions) return cards;

  // Filter OUT only clearly non-prescription content.
  // This avoids dropping valid hormone-based medication cards.
  const nonPrescriptionKeywords = /anatomical|anatomy(?!-based|\sinhibitor|\sdifference)|pure physiology|pathophysiology|classification|stage\s(?!management|treatment)|clinical finding|examination|presentation|laboratory finding|imaging finding|ultrasound|assessment|diagnosis|differential|etiology|epidemiology/i;

  const filtered = cards.filter((card) => {
    const text = `${card.title} ${card.content}`.toLowerCase();
    const isNonPrescription = nonPrescriptionKeywords.test(text);
    return !isNonPrescription;
  });

  console.log(`📋 Scope filter: ${cards.length} cards → ${filtered.length} prescription-only cards`);
  return filtered;
};
