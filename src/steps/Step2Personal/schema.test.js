import { describe, expect, it } from 'vitest'
import { calculateAge, step2Schema } from './schema'

const valid = {
  fullName: 'Amit K. Sharma', dateOfBirth: '1990-05-15', gender: 'male', maritalStatus: 'single',
  fatherName: 'Raj K. Sharma', motherName: 'Sita Sharma', email: 'amit@example.com',
  mobileNumber: '9876543210', alternateMobileNumber: '8765432109',
}
const messageFor = (changes, field) => {
  const result = step2Schema.safeParse({ ...valid, ...changes })
  expect(result.success).toBe(false)
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('Step 2 personal information schema', () => {
  it.each(['A1 Sharma', 'Amit@Sharma', 'Amit-Sharma'])('rejects invalid Full Name %s', (fullName) => {
    expect(messageFor({ fullName }, 'fullName')).toMatch(/letters, spaces, and periods only/)
  })

  it('calculates age around the birthday boundary', () => {
    expect(calculateAge('2005-08-10', new Date(2026, 7, 9))).toBe(20)
    expect(calculateAge('2005-08-09', new Date(2026, 7, 9))).toBe(21)
  })

  it('rejects applicants below age 21', () => {
    const year = new Date().getFullYear() - 20
    expect(messageFor({ dateOfBirth: `${year}-12-31` }, 'dateOfBirth')).toMatch(/at least 21/)
  })

  it('rejects applicants above age 65', () => {
    const year = new Date().getFullYear() - 66
    expect(messageFor({ dateOfBirth: `${year}-01-01` }, 'dateOfBirth')).toMatch(/65 years old or younger/)
  })

  it.each([['gender', 'Select a gender'], ['maritalStatus', 'Select a marital status']])('requires %s', (field, message) => {
    expect(messageFor({ [field]: '' }, field)).toBe(message)
  })

  it.each([['fatherName', "Father's Name"], ['motherName', "Mother's Name"]])('validates %s like a person name', (field, label) => {
    expect(messageFor({ [field]: 'Parent123' }, field)).toContain(`${label} can contain letters`)
  })

  it('rejects an invalid email', () => {
    expect(messageFor({ email: 'not-an-email' }, 'email')).toBe('Enter a valid email address')
  })

  it.each(['1234567890', '98765', '987654321a'])('rejects invalid primary mobile %s', (mobileNumber) => {
    expect(messageFor({ mobileNumber }, 'mobileNumber')).toMatch(/10 digits and start/)
  })

  it('rejects an alternate number equal to the primary number', () => {
    expect(messageFor({ alternateMobileNumber: valid.mobileNumber }, 'alternateMobileNumber')).toMatch(/different/)
  })
})
