import { describe, expect, it } from 'vitest'
import { validateStep7 } from './schema'

const requirements = [{ key: 'addressProof', title: 'Address Proof', required: true }, { key: 'panCard', title: 'PAN Card', required: false }]
describe('Step 7 validation', () => {
  it('blocks missing required documents and signature', () => expect(validateStep7({ documents: {}, signature: '' }, requirements)).toEqual({ addressProof: 'Please upload your address proof.', signature: 'Please provide your e-signature.' }))
  it('does not block an optional document', () => expect(validateStep7({ documents: { addressProof: [{}] }, signature: 'data:image/png;base64,x' }, requirements)).toEqual({}))
})
