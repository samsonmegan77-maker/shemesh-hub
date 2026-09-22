/**
 * South African PAYE + UIF calculation helpers
 * Tax year 2025/2026 (1 March 2025 – 28 Feb 2026)
 *
 * Note: These are simplified annual brackets converted for monthly use.
 * For production, consider using the full SARS tax directive / EMP201 logic
 * or a certified payroll library. This version removes the manual-table fear
 * for Karren & Carol while remaining transparent and adjustable.
 */

export interface PayrollInput {
  gross: number;
  travelAllowance?: number;
  bonus?: number;
  pension?: number;
  housingAllowance?: number; // fringe
  medicalAid?: number;       // fringe
}

export interface PayrollResult {
  totalIncome: number;
  totalDeductionsBeforeTax: number;
  taxable: number;
  paye: number;
  uif: number;
  net: number;
}

/** UIF: 1% of remuneration, monthly ceiling R177.12 (on R17 712) for 2025/26 */
export function calcUIF(remuneration: number): number {
  const rate = 0.01;
  const monthlyCeiling = 177.12;
  return Math.min(Number(remuneration) * rate, monthlyCeiling);
}

/**
 * Simplified monthly PAYE using 2025/26 annual brackets / 12.
 * Primary rebate is applied roughly (R17 235 annual ≈ R1 436.25 monthly).
 * This is intentionally transparent so Carol/Karren can see the numbers.
 */
export function calcPAYE(monthlyTaxable: number): number {
  const annual = monthlyTaxable * 12;

  // 2025/26 tax brackets (annual)
  let annualTax = 0;
  if (annual <= 237100) {
    annualTax = annual * 0.18;
  } else if (annual <= 370500) {
    annualTax = 42678 + (annual - 237100) * 0.26;
  } else if (annual <= 512800) {
    annualTax = 77362 + (annual - 370500) * 0.31;
  } else if (annual <= 673000) {
    annualTax = 121475 + (annual - 512800) * 0.36;
  } else if (annual <= 857900) {
    annualTax = 179147 + (annual - 673000) * 0.39;
  } else if (annual <= 1817000) {
    annualTax = 251258 + (annual - 857900) * 0.41;
  } else {
    annualTax = 644489 + (annual - 1817000) * 0.45;
  }

  // Primary rebate (under 65)
  const primaryRebate = 17235;
  annualTax = Math.max(0, annualTax - primaryRebate);

  return annualTax / 12;
}

export function calcPayroll(input: PayrollInput): PayrollResult {
  const gross = Number(input.gross) || 0;
  const travel = Number(input.travelAllowance) || 0;
  const bonus = Number(input.bonus) || 0;
  const pension = Number(input.pension) || 0;
  const housing = Number(input.housingAllowance) || 0;
  const medical = Number(input.medicalAid) || 0;

  const totalIncome = gross + travel + bonus;
  const totalDeductionsBeforeTax = pension + housing + medical;
  const taxable = Math.max(0, totalIncome - totalDeductionsBeforeTax);

  const paye = calcPAYE(taxable);
  const uif = calcUIF(totalIncome);
  const net = totalIncome - totalDeductionsBeforeTax - paye - uif;

  return {
    totalIncome,
    totalDeductionsBeforeTax,
    taxable,
    paye: Math.round(paye * 100) / 100,
    uif: Math.round(uif * 100) / 100,
    net: Math.round(net * 100) / 100,
  };
}
