import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import SignatureCanvas from 'react-signature-canvas'
import { Checkbox, CurrencyInput, Input, MaskedInput, Select } from '../../components/common'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useFormContext } from '../../context/formContextState'
import useVerification from '../../hooks/useVerification'
import { relationships, step6Schema } from './schema'

export default function Step6CoApplicant({ onBack, onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const existing = formData.coApplicant || {}
  const signatureRef = useRef(null)
  const panVerification = useVerification('pan', Boolean(existing.panVerified))
  const { control, register, handleSubmit, getValues, setValue, setError, setFocus, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(step6Schema), mode: 'onBlur',
    defaultValues: { name: existing.name || '', relationship: existing.relationship || (formData.maritalStatus === 'married' ? 'spouse' : ''), pan: existing.pan || '', monthlyIncome: existing.monthlyIncome ? String(existing.monthlyIncome) : '', consent: existing.consent || false, signature: existing.signature || '' },
  })
  const verifyPan = async () => { if (await trigger('pan')) await panVerification.verify(getValues('pan')) }
  const saveValues = (values) => updateFormData({ coApplicant: { ...values, name: values.name.trim(), monthlyIncome: Number(values.monthlyIncome), panVerified: panVerification.isVerified } })
  const submit = (values) => {
    if (!panVerification.isVerified) { setError('pan', { message: 'Verify the co-applicant PAN before continuing' }); setFocus('pan'); return }
    saveValues(values); onContinue()
  }
  const back = () => { saveValues(getValues()); onBack() }
  const clearSignature = () => { signatureRef.current?.clear(); setValue('signature', '', { shouldValidate: true }) }
  const captureSignature = () => { if (!signatureRef.current?.isEmpty()) setValue('signature', signatureRef.current.toDataURL('image/png'), { shouldValidate: true, shouldDirty: true }) }
  const invalid = (fields) => { const first = ['name','relationship','pan','monthlyIncome','consent','signature'].find((field) => fields[field]); if (first && first !== 'signature') setFocus(first) }

  return <form className="loan-form" onSubmit={handleSubmit(submit, invalid)} noValidate>
    <Input id="co-applicant-name" label="Co-Applicant Name" autoComplete="name" maxLength={100} error={errors.name} required {...register('name')} />
    <Select id="co-applicant-relationship" label="Relationship" placeholder="Select relationship" options={relationships} error={errors.relationship} required {...register('relationship')} />
    <div className="verification-field">
      <Controller name="pan" control={control} render={({ field }) => <MaskedInput {...field} id="co-applicant-pan" maskType="pan" label="Co-Applicant PAN" helpText="Format: AAAAA9999A" error={errors.pan} required forceMasked={panVerification.isVerified} onFocus={() => { if (panVerification.isVerified) panVerification.reset() }} onChange={(event) => { panVerification.reset(); field.onChange(event) }} />} />
      <button className="button button--verify" type="button" disabled={panVerification.isVerifying} onClick={verifyPan}>{panVerification.isVerifying ? 'Verifying...' : 'Verify PAN'}</button>
    </div>
    <div aria-live="polite">{panVerification.isVerified && <p className="verification-status verification-status--success">✓ PAN Verified</p>}{panVerification.error && <p className="form-error" role="alert">{panVerification.error}</p>}</div>
    <Controller name="monthlyIncome" control={control} render={({ field }) => <CurrencyInput {...field} id="co-applicant-income" label="Co-Applicant Monthly Income" error={errors.monthlyIncome} required />} />
    <Controller name="consent" control={control} render={({ field }) => <Checkbox id="co-applicant-consent" label="I confirm that the co-applicant has consented to provide their information for assessment of this loan application." error={errors.consent} checked={field.value} onChange={field.onChange} ref={field.ref} />} />
    <div className="signature-field">
      <label id="signature-label">Co-Applicant Signature <span aria-hidden="true">*</span></label>
      <p id="signature-instructions" className="form-help">Draw the co-applicant's signature in the box using a mouse or touch.</p>
      <SignatureCanvas ref={signatureRef} canvasProps={{ className: 'signature-canvas', 'aria-labelledby': 'signature-label', 'aria-describedby': 'signature-instructions signature-error' }} onEnd={captureSignature} />
      {existing.signature && <p className="saved-signature-note">A saved signature is on file. Draw again to replace it.</p>}
      <input type="hidden" {...register('signature')} />
      <ErrorMessage id="signature-error" error={errors.signature} />
      <button className="button button--secondary signature-clear" type="button" onClick={clearSignature}>Clear signature</button>
    </div>
    <div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={back}>← Back</button><button className="button button--primary" type="submit">Continue →</button></div>
  </form>
}
