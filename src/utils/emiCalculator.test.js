import { describe, expect, it } from 'vitest'
import { calculateEmi, calculateLoanSummary, calculateProcessingFee, formatIndianCurrency } from './emiCalculator'

describe('EMI calculator', () => {
  it('uses the reducing-balance formula', () => expect(calculateEmi(500000, 10.5, 36)).toBeCloseTo(16251.22, 1))
  it('handles zero rate and invalid inputs', () => { expect(calculateEmi(120000, 0, 12)).toBe(10000); expect(calculateEmi(0, 10, 12)).toBe(0) })
  it('applies processing-fee bounds', () => { expect(calculateProcessingFee(100000)).toBe(2000); expect(calculateProcessingFee(1000000)).toBe(10000); expect(calculateProcessingFee(5000000)).toBe(25000) })
  it('returns a complete summary', () => { const result = calculateLoanSummary({ loanType: 'home', loanAmount: 3000000, loanTenure: 240 }); expect(result.annualInterestRate).toBe(8.5); expect(result.totalCostOfBorrowing).toBeCloseTo(result.totalRepayment - 3000000) })
  it('formats Indian groupings', () => expect(formatIndianCurrency(1050000)).toContain('10,50,000'))
})
