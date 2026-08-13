import { describe, expect, it } from 'vitest'
import { getRequiredDocuments } from './requiredDocuments'

const keys = (state) => getRequiredDocuments(state).map(({ key }) => key)
describe('conditional document requirements', () => {
  it('requires salary slips for salaried personal loans', () => expect(keys({ loanType: 'personal', employmentDetails: { employmentType: 'salaried' } })).toContain('salarySlips'))
  it.each(['self-employed', 'business-owner'])('requires ITR for %s applicants', (employmentType) => expect(keys({ loanType: 'personal', employmentDetails: { employmentType } })).toContain('itr'))
  it('makes verified PAN optional', () => expect(getRequiredDocuments({ panVerified: true }).find(({ key }) => key === 'panCard').required).toBe(false))
  it('adds property documents for home loans', () => expect(keys({ loanType: 'home' })).toEqual(expect.arrayContaining(['propertyDocuments', 'saleAgreement', 'incomeProof'])))
  it('adds business and GST documents for business owners', () => expect(keys({ loanType: 'business', employmentDetails: { employmentType: 'business-owner' } })).toEqual(expect.arrayContaining(['businessRegistration', 'businessBankStatement', 'gstCertificate', 'itr'])))
})
