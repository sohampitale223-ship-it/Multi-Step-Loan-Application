import { describe, expect, it } from 'vitest'
import { validateAadhaar, validatePAN } from './validators'

describe('KYC validators', () => {
  it('normalizes and validates PAN, including its entity type', () => {
    expect(validatePAN('abcpd1234e')).toEqual({ isValid: true, value: 'ABCPD1234E', error: null })
    expect(validatePAN('abcde1234f').error).toMatch(/entity type/)
    expect(validatePAN('ABCPD123XEF').error).toMatch(/exactly 10/)
  })

  it('validates Aadhaar using the Verhoeff checksum', () => {
    expect(validateAadhaar('999999990019')).toBe(true)
    expect(validateAadhaar('999999990018')).toBe(false)
    expect(validateAadhaar('99999999001X')).toBe(false)
  })
})
