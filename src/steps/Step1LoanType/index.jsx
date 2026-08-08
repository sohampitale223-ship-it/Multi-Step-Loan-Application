import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { CurrencyInput, Input, RadioGroup, Select } from '../../components/common'
import { useFormContext } from '../../context/formContextState'
import { loanRules, step1Schema } from './schema'

const loanTypes = [{ value: 'personal', label: 'Personal Loan' }, { value: 'home', label: 'Home Loan' }, { value: 'business', label: 'Business Loan' }]
const purposes = {
  personal: ['Medical Expenses', 'Education', 'Wedding', 'Travel', 'Debt Consolidation', 'Home Renovation', 'Other'],
  home: ['Purchase New Home', 'Purchase Resale Property', 'Home Construction', 'Home Renovation', 'Plot Purchase', 'Balance Transfer'],
  business: ['Business Expansion', 'Working Capital', 'Equipment Purchase', 'Inventory', 'New Business Setup', 'Office Renovation', 'Other'],
}
const tenureFor = (type) => type === 'personal' ? [12, 24, 36, 48, 60] : type === 'home' ? [60, 120, 180, 240, 300, 360] : type === 'business' ? [12, 24, 36, 48, 60, 84, 120] : []
const format = (value) => new Intl.NumberFormat('en-IN').format(value)

function Step1LoanType({ onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const { control, register, handleSubmit, resetField, setFocus, formState: { errors } } = useForm({ resolver: zodResolver(step1Schema), mode: 'onBlur', reValidateMode: 'onBlur', shouldFocusError: true, defaultValues: { loanType: formData.loanType || '', loanAmount: formData.loanAmount || '', loanTenure: formData.loanTenure || '', loanPurpose: formData.loanPurpose || '', referralCode: formData.referralCode || '' } })
  const loanType = useWatch({ control, name: 'loanType' })
  const rule = loanRules[loanType]
  const changeLoanType = (field, event) => { const changed = field.value !== event.target.value; field.onChange(event); if (changed) { resetField('loanTenure', { defaultValue: '' }); resetField('loanPurpose', { defaultValue: '' }) } }
  const submit = (values) => { updateFormData(values); onContinue() }
  const focusFirstError = (invalidFields) => {
    const first = ['loanType', 'loanAmount', 'loanTenure', 'loanPurpose', 'referralCode'].find((name) => invalidFields[name])
    if (first) setFocus(first)
  }

  return <form className="loan-form" onSubmit={handleSubmit(submit, focusFirstError)} noValidate>
    <Controller name="loanType" control={control} render={({ field }) => <RadioGroup {...field} id="loan-type" legend="Loan Type" options={loanTypes} error={errors.loanType} required layout="horizontal" onChange={(event) => changeLoanType(field, event)} />} />
    <Controller name="loanAmount" control={control} render={({ field }) => <CurrencyInput {...field} id="loan-amount" label="Loan Amount" error={errors.loanAmount} required helpText={rule ? `Allowed range: ₹${format(rule.min)}–₹${format(rule.max)}` : 'Select a loan type to see the allowed range'} />} />
    <Select id="loan-tenure" label="Loan Tenure" placeholder="Select tenure" options={tenureFor(loanType).map((months) => ({ value: String(months), label: `${months} months` }))} error={errors.loanTenure} required disabled={!loanType} {...register('loanTenure')} />
    <Select id="loan-purpose" label="Loan Purpose" placeholder="Select purpose" options={(purposes[loanType] || []).map((purpose) => ({ value: purpose, label: purpose }))} error={errors.loanPurpose} required disabled={!loanType} {...register('loanPurpose')} />
    <Input id="referral-code" label="Referral Code (Optional)" maxLength={10} autoComplete="off" error={errors.referralCode} {...register('referralCode', { setValueAs: (value) => value.toUpperCase() })} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase() }} />
    <div className="loan-form__actions"><button className="button button--primary" type="submit">Continue <span aria-hidden="true">→</span></button></div>
  </form>
}

export default Step1LoanType
