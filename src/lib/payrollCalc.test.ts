import { describe, it, expect } from 'vitest'
import { calcUIF, calcPAYE, calcPayroll } from './payrollCalc'

describe('calcUIF', () => {
  it('applies 1% up to monthly ceiling', () => {
    expect(calcUIF(10000)).toBeCloseTo(100, 2)
    expect(calcUIF(50000)).toBe(177.12)
  })
})

describe('calcPAYE', () => {
  it('returns non-negative tax for typical monthly taxable income', () => {
    const tax = calcPAYE(15000)
    expect(tax).toBeGreaterThanOrEqual(0)
  })

  it('returns 0 for very low income after rebate', () => {
    expect(calcPAYE(500)).toBe(0)
  })
})

describe('calcPayroll', () => {
  it('computes net from gross with deductions', () => {
    const result = calcPayroll({
      gross: 20000,
      pension: 1000,
    })
    expect(result.totalIncome).toBe(20000)
    expect(result.totalDeductionsBeforeTax).toBe(1000)
    expect(result.net).toBeLessThan(result.totalIncome)
    expect(result.uif).toBeGreaterThan(0)
  })
})
