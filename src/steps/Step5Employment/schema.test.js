import { describe, expect, it } from 'vitest'
import { step5Schema, step5SchemaForLoan } from './schema'

const salaried = { employmentType: 'salaried', companyName: 'Acme Ltd', designation: 'Engineer', monthlyNetSalary: '50000', yearsOfExperience: '4.5' }
const selfEmployed = { employmentType: 'self-employed', businessName: 'Acme Services', businessType: 'Consulting', annualTurnover: '500000', yearsInBusiness: '3', monthlyIncome: '60000', officeAddress: '12 Main Road, Mumbai' }
const owner = { employmentType: 'business-owner', businessName: 'Acme Traders', businessType: 'Trading', annualTurnover: '500000', yearsInBusiness: '3', gstNumber: '27ABCDE1234F1Z5', officeAddress: '12 Main Road, Mumbai' }

describe('Step 5 schema', () => {
  it('validates salaried minimum salary and produces numbers', () => { expect(step5Schema.safeParse({ ...salaried, monthlyNetSalary: '14999' }).success).toBe(false); expect(step5Schema.parse(salaried).monthlyNetSalary).toBe(50000) })
  it('requires years of experience while allowing zero', () => { expect(step5Schema.safeParse({ ...salaried, yearsOfExperience: '' }).success).toBe(false); expect(step5Schema.safeParse({ ...salaried, yearsOfExperience: '0' }).success).toBe(true) })
  it('validates self-employed turnover and years', () => { expect(step5Schema.safeParse({ ...selfEmployed, annualTurnover: '299999' }).success).toBe(false); expect(step5Schema.safeParse({ ...selfEmployed, yearsInBusiness: '1' }).success).toBe(false) })
  it('validates GST structure and uppercase transformation', () => { expect(step5Schema.safeParse({ ...owner, gstNumber: 'invalid' }).success).toBe(false); expect(step5Schema.parse({ ...owner, gstNumber: '27abcde1234f1z5' }).gstNumber).toBe('27ABCDE1234F1Z5') })
  it('does not validate hidden branch fields', () => { expect(step5Schema.safeParse({ ...salaried, gstNumber: '' }).success).toBe(true); expect(step5Schema.safeParse({ ...selfEmployed, companyName: '' }).success).toBe(true) })
  it('enforces business-loan employment types', () => { expect(step5SchemaForLoan('business').safeParse(salaried).success).toBe(false); expect(step5SchemaForLoan('business').safeParse(selfEmployed).success).toBe(true); expect(step5SchemaForLoan('business').safeParse(owner).success).toBe(true) })
})
