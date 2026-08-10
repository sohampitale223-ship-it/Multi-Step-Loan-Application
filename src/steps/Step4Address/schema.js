import { z } from 'zod'

const pin = z.string().regex(/^\d{6}$/, 'PIN Code must be exactly 6 digits')
const address = (prefix, residence = false) => ({
  [`${prefix}AddressLine1`]: z.string().trim().min(5, 'Address Line 1 must be at least 5 characters').max(120),
  [`${prefix}AddressLine2`]: z.string().trim().max(120), [`${prefix}Landmark`]: z.string().trim().max(100),
  [`${prefix}PinCode`]: pin, [`${prefix}City`]: z.string().trim().min(1, 'City is required'),
  [`${prefix}State`]: z.string().trim().min(1, 'State is required'), [`${prefix}PostOffice`]: z.string(),
  ...(residence ? { residenceType: z.enum(['Owned', 'Rented', 'Company Provided', 'Family Owned', 'Other'], { error: 'Residence Type is required' }), monthlyRent: z.string(), yearsAtCurrentAddress: z.coerce.number({ error: 'Years at Current Address is required' }).min(0).max(50) } : {}),
})

export const step4Schema = z.object({
  ...address('current', true), ...address('permanent'), sameAsCurrent: z.boolean(),
  previousAddressLine1: z.string(), previousPinCode: z.string(), previousCity: z.string(), previousState: z.string(),
  currentLookupState: z.string(), permanentLookupState: z.string(),
}).superRefine((v, ctx) => {
  if (v.residenceType === 'Rented' && (!/^\d+$/.test(v.monthlyRent) || +v.monthlyRent < 1 || +v.monthlyRent > 500000)) ctx.addIssue({ code: 'custom', path: ['monthlyRent'], message: 'Monthly Rent must be between ₹1 and ₹5,00,000' })
  if (v.yearsAtCurrentAddress < 1) {
    if (v.previousAddressLine1.trim().length < 5) ctx.addIssue({ code: 'custom', path: ['previousAddressLine1'], message: 'Previous Address Line 1 must be at least 5 characters' })
    if (!/^\d{6}$/.test(v.previousPinCode)) ctx.addIssue({ code: 'custom', path: ['previousPinCode'], message: 'Previous PIN Code must be exactly 6 digits' })
    if (!v.previousCity.trim()) ctx.addIssue({ code: 'custom', path: ['previousCity'], message: 'Previous City is required' })
    if (!v.previousState) ctx.addIssue({ code: 'custom', path: ['previousState'], message: 'Previous State is required' })
  }
  for (const p of ['current', 'permanent']) if (v[`${p}LookupState`] && v[`${p}State`] !== v[`${p}LookupState`]) ctx.addIssue({ code: 'custom', path: [`${p}State`], message: 'The selected state does not match the state associated with this PIN code.' })
})
