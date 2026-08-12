import { describe, expect, it } from 'vitest'
import { shouldShowCoApplicant } from './coApplicant'

describe('shouldShowCoApplicant', () => {
  it.each([
    ['personal', 500000, false], ['personal', 500001, true],
    ['home', 50000, true], ['business', 2000000, false], ['business', 2000001, true],
  ])('%s at %s returns %s', (loanType, loanAmount, expected) => {
    expect(shouldShowCoApplicant({ loanType, loanAmount })).toBe(expected)
  })
})
