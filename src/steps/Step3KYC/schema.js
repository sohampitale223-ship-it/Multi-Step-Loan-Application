import { z } from 'zod'
import { validateAadhaar, validatePAN } from '../../utils/validators'

export const step3Schema = z.object({
  panNumber: z.string().min(1, 'PAN Number is required').refine((value) => validatePAN(value).isValid, { message: 'Enter a valid PAN in AAAAA9999A format with a supported entity type' }),
  aadhaarNumber: z.string().min(1, 'Aadhaar Number is required').refine(validateAadhaar, 'Enter a valid Aadhaar number with a correct checksum'),
  aadhaarConsent: z.boolean().refine(Boolean, 'Aadhaar consent is required'),
})
