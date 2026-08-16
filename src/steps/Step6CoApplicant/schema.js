import { z } from 'zod'
import { validatePAN } from '../../utils/validators'

export const relationships = [
  { value: 'spouse', label: 'Spouse' }, { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' }, { value: 'business-partner', label: 'Business Partner' },
]

export const step6Schema = z.object({
  name: z.string().trim().min(1, 'Co-Applicant Name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').regex(/^[A-Za-z. ]+$/, 'Name can contain letters, spaces, and periods only'),
  relationship: z.enum(['spouse', 'parent', 'sibling', 'business-partner'], { error: 'Select a relationship' }),
  pan: z.string().length(10, 'PAN must be exactly 10 characters').refine((value) => validatePAN(value).isValid, 'Enter a valid PAN in AAAAA9999A format with a supported entity type'),
  // The form receives a string, while saved co-applicant data is normalized to a number.
  // Coercion keeps both representations valid during final cross-step validation.
  monthlyIncome: z.coerce.number({ error: 'Co-Applicant Monthly Income is required' }).positive('Monthly income must be greater than zero'),
  consent: z.boolean().refine(Boolean, 'Co-applicant consent is required'),
  signature: z.string().min(1, 'Co-applicant signature is required'),
})
