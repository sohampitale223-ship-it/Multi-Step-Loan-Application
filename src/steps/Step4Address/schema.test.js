import { describe, expect, it } from 'vitest'
import { step4Schema } from './schema'

const valid = { currentAddressLine1:'12 Main Road',currentAddressLine2:'',currentLandmark:'',currentPinCode:'400001',currentCity:'Mumbai',currentState:'Maharashtra',currentPostOffice:'Mumbai GPO',residenceType:'Owned',monthlyRent:'',yearsAtCurrentAddress:2,previousAddressLine1:'',previousPinCode:'',previousCity:'',previousState:'',sameAsCurrent:true,permanentAddressLine1:'12 Main Road',permanentAddressLine2:'',permanentLandmark:'',permanentPinCode:'400001',permanentCity:'Mumbai',permanentState:'Maharashtra',permanentPostOffice:'Mumbai GPO',currentLookupState:'Maharashtra',permanentLookupState:'Maharashtra' }

describe('Step 4 schema', () => {
  it('requires a six digit PIN', () => {
    const result = step4Schema.safeParse({ ...valid, currentPinCode: '12345' })
    expect(result.error.issues.some((issue) => issue.path[0] === 'currentPinCode')).toBe(true)
  })

  it('requires monthly rent only for a rented residence', () => {
    expect(step4Schema.safeParse(valid).success).toBe(true)
    expect(step4Schema.safeParse({ ...valid, residenceType: 'Rented' }).success).toBe(false)
    expect(step4Schema.safeParse({ ...valid, residenceType: 'Rented', monthlyRent: '15000' }).success).toBe(true)
  })

  it('requires the previous address below one year', () => {
    expect(step4Schema.safeParse({ ...valid, yearsAtCurrentAddress: 0.5 }).success).toBe(false)
    expect(step4Schema.safeParse({ ...valid, yearsAtCurrentAddress: 1 }).success).toBe(true)
  })

  it('blocks a PIN-derived state mismatch', () => {
    const result = step4Schema.safeParse({ ...valid, currentState: 'Goa' })
    expect(result.error.issues.find((issue) => issue.path[0] === 'currentState')?.message).toMatch(/does not match/)
  })
})
