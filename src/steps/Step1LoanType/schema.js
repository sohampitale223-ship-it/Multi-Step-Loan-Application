import { z } from 'zod'

export const loanRules = {
  personal: { min: 50000, max: 1000000, label: 'Personal Loan' },
  home: { min: 50000, max: 10000000, label: 'Home Loan' },
  business: { min: 50000, max: 5000000, label: 'Business Loan' },
}

const format = (value) => new Intl.NumberFormat('en-IN').format(value)

export const step1Schema = z.object({
  loanType: z.enum(['personal', 'home', 'business'], { error: 'Select a loan type' }),
  loanAmount: z.string().min(1, 'Enter a loan amount'),
  loanTenure: z.string().min(1, 'Select a loan tenure'),
  loanPurpose: z.string().min(1, 'Select a loan purpose'),
  referralCode: z.string().refine((value) => !value || /^[A-Z0-9]{6,10}$/.test(value), 'Referral code must be 6–10 alphanumeric characters'),
}).superRefine((values, context) => {
  const rule = loanRules[values.loanType]
  if (!rule || !values.loanAmount) return
  const amount = Number(values.loanAmount)
  if (amount < rule.min || amount > rule.max) context.addIssue({ code: 'custom', path: ['loanAmount'], message: `Amount must be between ₹${format(rule.min)} and ₹${format(rule.max)} for a ${rule.label}` })
})
