import { z } from 'zod'

const requiredText = (label, minimum = 2) => z.string().trim().min(1, `${label} is required`).min(minimum, `${label} must be at least ${minimum} characters`).max(120, `${label} is too long`)
const money = (label, minimum) => z.coerce.number({ error: `${label} is required` }).positive(`${label} must be greater than 0`).min(minimum, `${label} must be at least ₹${new Intl.NumberFormat('en-IN').format(minimum)}`)
const years = (label, minimum = 0) => z.preprocess(
  (value) => value === '' || value == null ? undefined : value,
  z.coerce.number({ error: `${label} is required` }).min(minimum, `${label} must be at least ${minimum}`).max(50, `${label} cannot exceed 50`).multipleOf(0.1, `${label} can have at most one decimal place`),
)

export const employmentTypes = [{ value: 'salaried', label: 'Salaried' }, { value: 'self-employed', label: 'Self-Employed' }, { value: 'business-owner', label: 'Business Owner' }]
export const businessTypes = ['Professional Services', 'Retail', 'Manufacturing', 'Trading', 'Consulting', 'Technology / IT', 'Healthcare', 'Other']

const salaried = z.object({ employmentType: z.literal('salaried'), companyName: requiredText('Company Name'), designation: requiredText('Designation'), monthlyNetSalary: money('Monthly Net Salary', 15000), yearsOfExperience: years('Years of Experience') })
const businessBase = { businessName: requiredText('Business Name'), businessType: z.enum(businessTypes, { error: 'Business Type is required' }), annualTurnover: money('Annual Turnover', 300000), yearsInBusiness: years('Years in Business', 2), officeAddress: requiredText('Office / Business Address', 5).max(250, 'Office / Business Address is too long') }
const selfEmployed = z.object({ employmentType: z.literal('self-employed'), ...businessBase, monthlyIncome: money('Monthly Income', 1) })
const businessOwner = z.object({ employmentType: z.literal('business-owner'), ...businessBase, gstNumber: z.string().trim().toUpperCase().min(15, 'GST number must contain exactly 15 characters.').max(15, 'GST number must contain exactly 15 characters.').regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Enter a valid GST number.') })

export const step5Schema = z.discriminatedUnion('employmentType', [salaried, selfEmployed, businessOwner], { error: 'Employment Type is required' })
export const step5SchemaForLoan = (loanType) => step5Schema.superRefine((value, context) => {
  if (loanType === 'business' && value.employmentType === 'salaried') context.addIssue({ code: 'custom', path: ['employmentType'], message: 'Business loans are available only for Self-Employed applicants or Business Owners.' })
})
