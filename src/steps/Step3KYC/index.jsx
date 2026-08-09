import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Checkbox, MaskedInput } from '../../components/common'
import { useFormContext } from '../../context/formContextState'
import useVerification from '../../hooks/useVerification'
import { step3Schema } from './schema'

function VerificationStatus({ label, verification }) {
  if (verification.isVerifying) return <p className="verification-status verification-status--loading" role="status"><span className="verification-spinner" aria-hidden="true" /> Verifying...</p>
  if (verification.isVerified) return <p className="verification-status verification-status--success" role="status"><span aria-hidden="true">✓</span> {label} Verified</p>
  if (verification.error) return <p className="form-error" role="alert">{verification.error}</p>
  return null
}

function Step3KYC({ onBack, onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const panVerification = useVerification('pan', Boolean(formData.panVerified))
  const aadhaarVerification = useVerification('aadhaar', Boolean(formData.aadhaarVerified))
  const { control, handleSubmit, getValues, setError, setFocus, trigger, formState: { errors } } = useForm({ resolver: zodResolver(step3Schema), mode: 'onBlur', reValidateMode: 'onBlur', shouldFocusError: true, defaultValues: { panNumber: formData.panNumber || '', aadhaarNumber: formData.aadhaarNumber || '', aadhaarConsent: formData.aadhaarConsent || false } })
  const verifyField = async (name, verification) => { if (await trigger(name)) await verification.verify(getValues(name)) }
  const submit = (values) => {
    if (!panVerification.isVerified) { setError('panNumber', { message: 'Verify your PAN Number before continuing' }); setFocus('panNumber'); return }
    if (!aadhaarVerification.isVerified) { setError('aadhaarNumber', { message: 'Verify your Aadhaar Number before continuing' }); setFocus('aadhaarNumber'); return }
    updateFormData({ ...values, panVerified: true, aadhaarVerified: true }); onContinue()
  }
  const back = () => { updateFormData({ ...getValues(), panVerified: panVerification.isVerified, aadhaarVerified: aadhaarVerification.isVerified }); onBack() }
  const focusFirstError = (invalidFields) => { const first = ['panNumber', 'aadhaarNumber', 'aadhaarConsent'].find((name) => invalidFields[name]); if (first) setFocus(first) }
  return <form className="loan-form" onSubmit={handleSubmit(submit, focusFirstError)} noValidate>
    <div className="verification-field"><Controller name="panNumber" control={control} render={({ field }) => <MaskedInput {...field} id="pan-number" maskType="pan" label="PAN Number" autoComplete="off" error={errors.panNumber} required onChange={(event) => { panVerification.reset(); field.onChange(event) }} />} /><button className="button button--verify" type="button" disabled={panVerification.isVerifying} onClick={() => verifyField('panNumber', panVerification)}>Verify PAN</button></div>
    <VerificationStatus label="PAN" verification={panVerification} />
    <div className="verification-field"><Controller name="aadhaarNumber" control={control} render={({ field }) => <MaskedInput {...field} id="aadhaar-number" maskType="aadhaar" label="Aadhaar Number" autoComplete="off" error={errors.aadhaarNumber} required onChange={(event) => { aadhaarVerification.reset(); field.onChange(event) }} />} /><button className="button button--verify" type="button" disabled={aadhaarVerification.isVerifying} onClick={() => verifyField('aadhaarNumber', aadhaarVerification)}>Verify Aadhaar</button></div>
    <VerificationStatus label="Aadhaar" verification={aadhaarVerification} />
    <Controller name="aadhaarConsent" control={control} render={({ field }) => <Checkbox id="aadhaar-consent" label="I consent to the use of my Aadhaar information solely for identity verification as part of this loan application." error={errors.aadhaarConsent} checked={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />} />
    <div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={back}><span aria-hidden="true">←</span> Back</button><button className="button button--primary" type="submit">Continue <span aria-hidden="true">→</span></button></div>
  </form>
}

export default Step3KYC
