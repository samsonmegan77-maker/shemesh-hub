import { describe, it, expect, beforeEach } from 'vitest'
import { orgKey, DATA_SUFFIXES } from './localStore'

describe('orgKey', () => {
  it('scopes keys by organisation id', () => {
    expect(orgKey('southdale', 'payroll')).toBe('shemesh:southdale:payroll')
    expect(orgKey('bambanani', 'payroll')).toBe('shemesh:bambanani:payroll')
  })

  it('uses none when orgId is missing', () => {
    expect(orgKey(undefined, 'expenses')).toBe('shemesh:none:expenses')
    expect(orgKey(null, 'expenses')).toBe('shemesh:none:expenses')
  })
})

describe('DATA_SUFFIXES', () => {
  it('includes core finance and ops suffixes', () => {
    expect(DATA_SUFFIXES).toContain('payroll')
    expect(DATA_SUFFIXES).toContain('treasurer')
    expect(DATA_SUFFIXES).toContain('documents')
  })
})
