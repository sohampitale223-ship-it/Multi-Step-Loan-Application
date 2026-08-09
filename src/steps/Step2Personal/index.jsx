import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Input, RadioGroup, Select } from '../../components/common'
import { useFormContext } from '../../context/formContextState'
import { step2Schema } from './schema'

const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]
const maritalOptions = [{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }]

function Step2Personal({ onBack, onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const { control, register, handleSubmit, getValues, setFocus, formState: { errors } } = useForm({
    resolver: zodResolver(step2Schema), mode: 'onBlur', reValidateMode: 'onBlur', shouldFocusError: true,
    defaultValues: {
      fullName: formData.fullName || '', dateOfBirth: formData.dateOfBirth || '', gender: formData.gender || '',
      maritalStatus: formData.maritalStatus || '', fatherName: formData.fatherName || '', motherName: formData.motherName || '',
      email: formData.email || '', mobileNumber: formData.mobileNumber || '', alternateMobileNumber: formData.alternateMobileNumber || '',
    },
  })
  const saveAndContinue = (values) => { updateFormData(values); onContinue() }
  const saveAndBack = () => { updateFormData(getValues()); onBack() }
  const focusFirstError = (invalidFields) => {
    const first = ['fullName', 'dateOfBirth', 'gender', 'maritalStatus', 'fatherName', 'motherName', 'email', 'mobileNumber', 'alternateMobileNumber'].find((name) => invalidFields[name])
    if (first) setFocus(first)
  }

  return <form className="loan-form" onSubmit={handleSubmit(saveAndContinue, focusFirstError)} noValidate>
    <Input id="full-name" label="Full Name (as per PAN)" autoComplete="name" error={errors.fullName} required {...register('fullName')} />
    <Input id="date-of-birth" label="Date of Birth" type="date" autoComplete="bday" error={errors.dateOfBirth} required {...register('dateOfBirth')} />
    <Controller name="gender" control={control} render={({ field }) => <RadioGroup {...field} id="gender" legend="Gender" options={genderOptions} error={errors.gender} required layout="horizontal" />} />
    <Select id="marital-status" label="Marital Status" placeholder="Select marital status" options={maritalOptions} error={errors.maritalStatus} required {...register('maritalStatus')} />
    <Input id="father-name" label="Father's Name" autoComplete="off" error={errors.fatherName} required {...register('fatherName')} />
    <Input id="mother-name" label="Mother's Name" autoComplete="off" error={errors.motherName} required {...register('motherName')} />
    <Input id="email" label="Email" type="email" autoComplete="email" error={errors.email} required {...register('email')} />
    <Input id="mobile-number" label="Mobile Number" type="tel" inputMode="numeric" autoComplete="tel" error={errors.mobileNumber} required {...register('mobileNumber')} />
    <Input id="alternate-mobile-number" label="Alternate Mobile Number (Optional)" type="tel" inputMode="numeric" autoComplete="tel" error={errors.alternateMobileNumber} {...register('alternateMobileNumber')} />
    <div className="loan-form__actions loan-form__actions--split">
      <button className="button button--secondary" type="button" onClick={saveAndBack}><span aria-hidden="true">←</span> Back</button>
      <button className="button button--primary" type="submit">Continue <span aria-hidden="true">→</span></button>
    </div>
  </form>
}

export default Step2Personal
