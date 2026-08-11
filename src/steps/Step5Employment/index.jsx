import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { CurrencyInput, Input, RadioGroup, Select } from '../../components/common'
import FormField from '../../components/common/FormField'
import { useFormContext } from '../../context/formContextState'
import { businessTypes, employmentTypes, step5SchemaForLoan } from './schema'

const defaults = { employmentType: '', companyName: '', designation: '', monthlyNetSalary: '', yearsOfExperience: '', businessName: '', businessType: '', annualTurnover: '', yearsInBusiness: '', monthlyIncome: '', gstNumber: '', officeAddress: '' }

function BusinessFields({ register, control, errors, showIncome, showGst }) {
  return <fieldset className="address-section"><legend>Business details</legend>
    <Input id="business-name" label="Business Name" maxLength={120} error={errors.businessName} required {...register('businessName')} />
    <Select id="business-type" label="Business Type" placeholder="Select business type" options={businessTypes} error={errors.businessType} required {...register('businessType')} />
    <Controller name="annualTurnover" control={control} render={({ field }) => <CurrencyInput {...field} id="annual-turnover" label="Annual Turnover" error={errors.annualTurnover} required helpText="Minimum ₹3,00,000" />} />
    <Input id="years-in-business" label="Years in Business" type="number" min="2" max="50" step="0.1" error={errors.yearsInBusiness} required {...register('yearsInBusiness')} />
    {showIncome && <Controller name="monthlyIncome" control={control} render={({ field }) => <CurrencyInput {...field} id="monthly-income" label="Monthly Income" error={errors.monthlyIncome} required />} />}
    {showGst && <Input id="gst-number" label="GST Number" maxLength={15} autoComplete="off" error={errors.gstNumber} required {...register('gstNumber', { setValueAs: (value) => value.toUpperCase() })} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase() }} />}
    <FormField id="office-address" label="Office / Business Address" error={errors.officeAddress} required>{({ id, describedBy }) => <textarea id={id} rows="3" maxLength={250} className="form-control" required aria-invalid={errors.officeAddress ? 'true' : 'false'} aria-describedby={describedBy} {...register('officeAddress')} />}</FormField>
  </fieldset>
}

export default function Step5Employment({ onBack, onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const loanType = formData.loanType
  const schema = useMemo(() => step5SchemaForLoan(loanType), [loanType])
  const { control, register, handleSubmit, getValues, setFocus, formState: { errors } } = useForm({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues: { ...defaults, ...formData.employmentDetails } })
  const employmentType = useWatch({ control, name: 'employmentType' })
  const options = employmentTypes.map((option) => ({ ...option, disabled: loanType === 'business' && option.value === 'salaried' }))
  const normalize = (values) => ({ ...values, affordabilityMonthlyIncome: values.employmentType === 'salaried' ? Number(values.monthlyNetSalary) || null : values.employmentType === 'self-employed' ? Number(values.monthlyIncome) || null : null })
  const save = (values) => { updateFormData({ employmentDetails: normalize(values) }); onContinue() }
  const back = () => { updateFormData({ employmentDetails: normalize(getValues()) }); onBack() }
  const invalid = (fields) => { const order = ['employmentType','companyName','designation','monthlyNetSalary','yearsOfExperience','businessName','businessType','annualTurnover','yearsInBusiness','monthlyIncome','gstNumber','officeAddress']; const first = order.find((field) => fields[field]); if (first) setFocus(first) }

  return <form className="loan-form" onSubmit={handleSubmit(save, invalid)} noValidate>
    <Controller name="employmentType" control={control} render={({ field }) => <RadioGroup {...field} id="employment-type" legend="Employment Type" options={options} error={errors.employmentType} required layout="horizontal" />} />
    {employmentType === 'salaried' && <fieldset className="address-section"><legend>Employment details</legend><Input id="company-name" label="Company Name" maxLength={120} autoComplete="organization" error={errors.companyName} required {...register('companyName')} /><Input id="designation" label="Designation" maxLength={120} autoComplete="organization-title" error={errors.designation} required {...register('designation')} /><Controller name="monthlyNetSalary" control={control} render={({ field }) => <CurrencyInput {...field} id="monthly-net-salary" label="Monthly Net Salary" error={errors.monthlyNetSalary} required helpText="Minimum ₹15,000" />} /><Input id="years-of-experience" label="Years of Experience" type="number" min="0" max="50" step="0.1" error={errors.yearsOfExperience} required {...register('yearsOfExperience')} /></fieldset>}
    {employmentType === 'self-employed' && <BusinessFields register={register} control={control} errors={errors} showIncome />}
    {employmentType === 'business-owner' && <BusinessFields register={register} control={control} errors={errors} showGst />}
    <div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={back}>← Back</button><button className="button button--primary" type="submit">Continue →</button></div>
  </form>
}
