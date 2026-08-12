import { describe, expect, it } from 'vitest'
import { step6Schema } from './schema'

const valid = { name: 'Asha Rao', relationship: 'spouse', pan: 'ABCPD1234F', monthlyIncome: '45000', consent: true, signature: 'data:image/png;base64,test' }

describe('step6Schema', () => {
  it('accepts complete co-applicant data', () => expect(step6Schema.safeParse(valid).success).toBe(true))
  it.each([
    ['pan', 'INVALID'], ['monthlyIncome', ''], ['consent', false], ['signature', ''],
  ])('rejects invalid %s', (field, value) => expect(step6Schema.safeParse({ ...valid, [field]: value }).success).toBe(false))
})
