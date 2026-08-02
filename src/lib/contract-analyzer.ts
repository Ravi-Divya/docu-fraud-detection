export interface ContractRisk {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface ContractAnalysis {
  score: number; // 0-100, higher means safer
  risks: ContractRisk[];
  summary: string;
}

// Very small heuristic-driven contract analyzer. Replace with ML model or rules engine for production.
export const analyzeContract = (text: string): ContractAnalysis => {
  const lowered = text.toLowerCase();
  const risks: ContractRisk[] = [];

  const check = (id: string, cond: boolean, title: string, severity: 'low'|'medium'|'high', description: string, suggestion: string) => {
    if (cond) {
      risks.push({ id, title, severity, description, suggestion });
    }
  };

  // Missing common safety clauses
  check('confidentiality_missing', !/confidentiality|non-disclosure|nda/.test(lowered), 'Confidentiality clause missing', 'medium', 'Contract does not contain a confidentiality or NDA clause.', 'Add a confidentiality clause (scope, duration, permitted disclosures).');
  check('indemnity_missing', !/indemnif|indemnity/.test(lowered), 'Indemnity clause missing', 'high', 'No indemnity clause found - leaves parties exposed to third-party claims.', 'Add indemnification terms allocating responsibility and limits.');
  check('liability_unlimited', /no liability|no warranties|without warranty|as is/.test(lowered), 'Limited or no liability', 'high', 'Contract contains phrases that limit or remove liability or warranties.', 'Consider tightening warranty and liability language or adding exceptions for gross negligence.');
  check('termination_missing', !/terminate|termination|notice period|notice of termination/.test(lowered), 'Termination clause missing', 'medium', 'No clear termination or notice provisions detected.', 'Add termination rights and notice periods for both parties.');
  check('governing_law_missing', !/govern(ing)? law|jurisdicti/.test(lowered), 'Governing law not specified', 'low', 'Governing law or jurisdiction is not specified.', 'Specify governing law and dispute resolution mechanism.');
  check('payment_terms_missing', !/payment|invoice|due date|due upon/.test(lowered), 'Payment terms missing', 'medium', 'No clear payment terms or schedule found.', 'Specify payment amounts, schedule, invoicing and late fees.');
  check('arbitration_present', /arbitrat|arbitration/.test(lowered), 'Contains arbitration clause', 'low', 'Contract specifies arbitration as dispute resolution.', 'Confirm arbitration is acceptable; consider jurisdiction and enforcement details.');
  check('signed_missing', !/signature|signed by|signatures|signed on/.test(lowered), 'Signature or effective date missing', 'medium', 'No clear signature block or effective date found.', 'Include signature blocks and effective date to ensure enforceability.');

  // Detect duplicate-like indicators (exact same names but different fonts) via heuristic: presence of same key fields repeated
  const nameMatches = (text.match(/name\s*[:\-]?\s*[A-Z\s]{3,}/gi) || []).length;
  if (nameMatches >= 2) {
    risks.push({ id: 'possible_duplicate', title: 'Possible duplicate/version', severity: 'medium', description: 'Document appears to contain repeated name blocks or version markers - could be a duplicate/version mismatch.', suggestion: 'Verify which version is authoritative and reconcile differences in formatting and content.' });
  }

  // Compute score: start at 100 and subtract based on severity of risks
  let score = 100;
  for (const r of risks) {
    if (r.severity === 'high') score -= 40;
    else if (r.severity === 'medium') score -= 20;
    else score -= 8;
  }
  if (score < 0) score = 0;

  const summary = risks.length === 0 ? 'No major contract risks detected.' : `${risks.length} potential issue(s) found.`;

  return { score: Math.round(score), risks, summary };
};
