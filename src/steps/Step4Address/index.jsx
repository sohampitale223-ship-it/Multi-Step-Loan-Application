import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Checkbox, CurrencyInput, Input, Select } from '../../components/common'
import { useFormContext } from '../../context/formContextState'
import usePinCodeLookup from '../../hooks/usePinCodeLookup'
import { step4Schema } from './schema'

const states = ['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal']
const residenceOptions = ['Owned', 'Rented', 'Company Provided', 'Family Owned', 'Other']
const addressFields = ['AddressLine1', 'AddressLine2', 'Landmark', 'PinCode', 'City', 'State', 'PostOffice']
const defaults = { currentAddressLine1:'',currentAddressLine2:'',currentLandmark:'',currentPinCode:'',currentCity:'',currentState:'',currentPostOffice:'',residenceType:'',monthlyRent:'',yearsAtCurrentAddress:'',previousAddressLine1:'',previousPinCode:'',previousCity:'',previousState:'',sameAsCurrent:false,permanentAddressLine1:'',permanentAddressLine2:'',permanentLandmark:'',permanentPinCode:'',permanentCity:'',permanentState:'',permanentPostOffice:'',currentLookupState:'',permanentLookupState:'' }

function LookupStatus({ lookup }) {
  if (lookup.isLoading) return <p className="lookup-status" role="status">Looking up PIN code…</p>
  if (lookup.error) return <p className="form-error lookup-status" role="alert">{lookup.error}</p>
  return lookup.city ? <p className="lookup-status lookup-status--success" role="status">Address details found.</p> : null
}

function AddressFields({ prefix, register, errors, disabled, lookup }) {
  return <>
    <Input id={`${prefix}-address-line-1`} label="Address Line 1" maxLength={120} autoComplete={prefix === 'current' ? 'address-line1' : 'off'} error={errors[`${prefix}AddressLine1`]} required disabled={disabled} {...register(`${prefix}AddressLine1`)} />
    <Input id={`${prefix}-address-line-2`} label="Address Line 2 (Optional)" maxLength={120} autoComplete={prefix === 'current' ? 'address-line2' : 'off'} error={errors[`${prefix}AddressLine2`]} disabled={disabled} {...register(`${prefix}AddressLine2`)} />
    <Input id={`${prefix}-landmark`} label="Landmark (Optional)" maxLength={100} error={errors[`${prefix}Landmark`]} disabled={disabled} {...register(`${prefix}Landmark`)} />
    <Input id={`${prefix}-pin-code`} label="PIN Code" inputMode="numeric" maxLength={6} autoComplete="postal-code" error={errors[`${prefix}PinCode`]} required disabled={disabled} {...register(`${prefix}PinCode`)} />
    <LookupStatus lookup={lookup} />
    <div className="address-grid">
      <Input id={`${prefix}-city`} label="City" error={errors[`${prefix}City`]} required disabled={disabled} {...register(`${prefix}City`)} />
      <Select id={`${prefix}-state`} label="State" placeholder="Select state" options={states} error={errors[`${prefix}State`]} required disabled={disabled} {...register(`${prefix}State`)} />
    </div>
    <Input id={`${prefix}-post-office`} label="Post Office" readOnly disabled={disabled} {...register(`${prefix}PostOffice`)} />
  </>
}

export default function Step4Address({ onBack, onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const { control, register, handleSubmit, getValues, setValue, setFocus, formState: { errors } } = useForm({ resolver: zodResolver(step4Schema), mode: 'onBlur', defaultValues: { ...defaults, ...formData.addressDetails } })
  const values = useWatch({ control })
  const currentLookup = usePinCodeLookup(values.currentPinCode)
  const permanentLookup = usePinCodeLookup(values.permanentPinCode)
  const { sameAsCurrent, currentAddressLine1, currentAddressLine2, currentLandmark, currentPinCode, currentCity, currentState, currentPostOffice, currentLookupState } = values

  useEffect(() => { if (currentLookup.city) { setValue('currentCity', currentLookup.city); setValue('currentState', currentLookup.state); setValue('currentPostOffice', currentLookup.postOffice); setValue('currentLookupState', currentLookup.state) } }, [currentLookup.city, currentLookup.state, currentLookup.postOffice, setValue])
  useEffect(() => { if (permanentLookup.city && !sameAsCurrent) { setValue('permanentCity', permanentLookup.city); setValue('permanentState', permanentLookup.state); setValue('permanentPostOffice', permanentLookup.postOffice); setValue('permanentLookupState', permanentLookup.state) } }, [permanentLookup.city, permanentLookup.state, permanentLookup.postOffice, sameAsCurrent, setValue])
  useEffect(() => { if (sameAsCurrent) { const current = { AddressLine1: currentAddressLine1, AddressLine2: currentAddressLine2, Landmark: currentLandmark, PinCode: currentPinCode, City: currentCity, State: currentState, PostOffice: currentPostOffice }; addressFields.forEach((field) => setValue(`permanent${field}`, current[field] || '', { shouldValidate: false })); setValue('permanentLookupState', currentLookupState || '') } }, [sameAsCurrent, currentAddressLine1, currentAddressLine2, currentLandmark, currentPinCode, currentCity, currentState, currentPostOffice, currentLookupState, setValue])

  const save = (next) => { updateFormData({ addressDetails: next, addressProof: { required: true, status: 'pending' } }); onContinue() }
  const back = () => { updateFormData({ addressDetails: getValues(), addressProof: { required: true, status: 'pending' } }); onBack() }
  const invalid = (fields) => { const order = ['currentAddressLine1','currentPinCode','currentCity','currentState','residenceType','monthlyRent','yearsAtCurrentAddress','previousAddressLine1','previousPinCode','previousCity','previousState','permanentAddressLine1','permanentPinCode','permanentCity','permanentState']; const first = order.find((key) => fields[key]); if (first) setFocus(first) }

  return <form className="loan-form" onSubmit={handleSubmit(save, invalid)} noValidate>
    <fieldset className="address-section"><legend>Current Address</legend><AddressFields prefix="current" register={register} errors={errors} lookup={currentLookup} />
      <Select id="residence-type" label="Residence Type" placeholder="Select residence type" options={residenceOptions} error={errors.residenceType} required {...register('residenceType')} />
      {values.residenceType === 'Rented' && <Controller name="monthlyRent" control={control} render={({ field }) => <CurrencyInput {...field} id="monthly-rent" label="Monthly Rent" error={errors.monthlyRent} required />} />}
      <Input id="years-at-current-address" label="Years at Current Address" type="number" min="0" max="50" step="0.1" error={errors.yearsAtCurrentAddress} required {...register('yearsAtCurrentAddress')} />
    </fieldset>
    {values.yearsAtCurrentAddress !== '' && Number(values.yearsAtCurrentAddress) < 1 && <fieldset className="address-section"><legend>Previous Address</legend>
      <Input id="previous-address-line-1" label="Previous Address Line 1" error={errors.previousAddressLine1} required {...register('previousAddressLine1')} />
      <Input id="previous-pin-code" label="Previous PIN Code" inputMode="numeric" maxLength={6} error={errors.previousPinCode} required {...register('previousPinCode')} />
      <Input id="previous-city" label="Previous City" error={errors.previousCity} required {...register('previousCity')} />
      <Select id="previous-state" label="Previous State" placeholder="Select state" options={states} error={errors.previousState} required {...register('previousState')} />
    </fieldset>}
    <Controller name="sameAsCurrent" control={control} render={({ field }) => <Checkbox id="same-as-current" label="Same as current address" checked={field.value} onChange={field.onChange} ref={field.ref} />} />
    <fieldset className="address-section"><legend>Permanent Address</legend><AddressFields prefix="permanent" register={register} errors={errors} disabled={values.sameAsCurrent} lookup={values.sameAsCurrent ? { city: values.currentCity } : permanentLookup} /></fieldset>
    <input type="hidden" {...register('currentLookupState')} /><input type="hidden" {...register('permanentLookupState')} />
    <div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={back}>← Back</button><button className="button button--primary" type="submit">Continue →</button></div>
  </form>
}
