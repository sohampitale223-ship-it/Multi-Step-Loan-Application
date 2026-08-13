import { z } from 'zod'

export const documentMetadataSchema = z.object({ id: z.string(), name: z.string(), type: z.string(), size: z.number().nonnegative(), lastModified: z.number().optional(), compressed: z.boolean().optional() })

export function validateStep7(values, requiredDocuments) {
  const errors = {}
  requiredDocuments.filter((item) => item.required).forEach((item) => {
    if (!values.documents?.[item.key]?.length) errors[item.key] = item.key === 'salarySlips' ? 'Please upload at least one salary slip.' : `Please upload your ${item.title.toLowerCase()}.`
  })
  if (!values.signature) errors.signature = 'Please provide your e-signature.'
  return errors
}

