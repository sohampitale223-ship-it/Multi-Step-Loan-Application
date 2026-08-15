import { step1Schema } from '../steps/Step1LoanType/schema'
import { step2Schema } from '../steps/Step2Personal/schema'
import { step3Schema } from '../steps/Step3KYC/schema'
import { step4Schema } from '../steps/Step4Address/schema'
import { step5SchemaForLoan } from '../steps/Step5Employment/schema'
import { step6Schema } from '../steps/Step6CoApplicant/schema'
import { shouldShowCoApplicant } from './coApplicant'
import { getRequiredDocuments } from './requiredDocuments'

export const SUBMITTED_APPLICATION_KEY = 'submittedLoanApplication'

export function generateApplicationId(now = new Date()) {
  const bytes = new Uint8Array(3)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 6).toUpperCase()
  return `LOAN-${now.getFullYear()}-${suffix}`
}

export function validateApplication(formData) {
  const errors = []
  const checks = [
    ['Loan details', step1Schema, formData], ['Personal information', step2Schema, formData],
    ['Identity details', step3Schema, formData], ['Address details', step4Schema, formData.addressDetails],
    ['Employment details', step5SchemaForLoan(formData.loanType), formData.employmentDetails],
  ]
  if (shouldShowCoApplicant(formData)) checks.push(['Co-applicant details', step6Schema, formData.coApplicant])
  checks.forEach(([label, schema, value]) => { if (!schema.safeParse(value || {}).success) errors.push(`${label} are incomplete.`) })
  if (!formData.panVerified || !formData.aadhaarVerified) errors.push('PAN and Aadhaar verification must be complete.')
  const required = getRequiredDocuments(formData).filter((document) => document.required)
  if (!required.every((document) => formData.documents?.[document.key]?.length)) errors.push('All mandatory documents must be uploaded.')
  if (!formData.eSignature) errors.push('Your e-signature is required.')
  return [...new Set(errors)]
}

export function maskIdentifier(value, visible = 4) {
  if (!value) return 'Not provided'
  return `${'*'.repeat(Math.max(0, value.length - visible))}${value.slice(-visible)}`
}

export function createSubmittedApplication(formData, now = new Date()) {
  return { applicationId: generateApplicationId(now), submissionDate: now.toISOString(), applicationStatus: 'Under Review', applicationData: {
    ...formData, panNumber: maskIdentifier(formData.panNumber), aadhaarNumber: maskIdentifier(formData.aadhaarNumber), eSignature: Boolean(formData.eSignature),
    documents: Object.fromEntries(Object.entries(formData.documents || {}).map(([key, files]) => [key, files.map(({ name, type, size }) => ({ name, type, size }))])),
    coApplicant: formData.coApplicant ? { ...formData.coApplicant, pan: maskIdentifier(formData.coApplicant.pan), signature: Boolean(formData.coApplicant.signature) } : undefined,
  } }
}

export const persistSubmittedApplication = (application) => localStorage.setItem(SUBMITTED_APPLICATION_KEY, JSON.stringify(application))
export function readSubmittedApplication() { try { return JSON.parse(localStorage.getItem(SUBMITTED_APPLICATION_KEY)) } catch { return null } }
export const simulateSubmission = ({ shouldFail = false, delay = 1400 } = {}) => new Promise((resolve, reject) => setTimeout(() => shouldFail ? reject(new Error('We could not submit your application. Please try again.')) : resolve(), delay))
