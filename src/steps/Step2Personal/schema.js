import { z } from 'zod'

const namePattern = /^[A-Za-z. ]+$/
const mobilePattern = /^[6-9][0-9]{9}$/

const personName = (label) => z.string().trim()
  .min(1, `${label} is required`)
  .min(2, `${label} must be at least 2 characters`)
  .max(100, `${label} must be at most 100 characters`)
  .regex(namePattern, `${label} can contain letters, spaces, and periods only`)

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function calculateAge(value, today = new Date()) {
  const birthDate = parseDate(value)
  if (!birthDate) return null
  let age = today.getFullYear() - birthDate.getFullYear()
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1
  return age
}

export const step2Schema = z.object({
  fullName: personName('Full Name'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Select a gender' }),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], { error: 'Select a marital status' }),
  fatherName: personName("Father's Name"),
  motherName: personName("Mother's Name"),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  mobileNumber: z.string().min(1, 'Mobile Number is required').regex(mobilePattern, 'Mobile Number must be 10 digits and start with 6, 7, 8, or 9'),
  alternateMobileNumber: z.string().refine((value) => !value || mobilePattern.test(value), 'Alternate Mobile Number must be 10 digits and start with 6, 7, 8, or 9'),
}).superRefine((values, context) => {
  if (values.dateOfBirth) {
    const age = calculateAge(values.dateOfBirth)
    if (age === null) context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Enter a valid Date of Birth' })
    else if (age < 21) context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Applicant must be at least 21 years old' })
    else if (age > 65) context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Applicant must be 65 years old or younger' })
  }
  if (values.alternateMobileNumber && values.alternateMobileNumber === values.mobileNumber) {
    context.addIssue({ code: 'custom', path: ['alternateMobileNumber'], message: 'Alternate Mobile Number must be different from Mobile Number' })
  }
})
