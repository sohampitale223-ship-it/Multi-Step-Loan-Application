import { useMemo, useState } from 'react'
import FileUpload from '../../components/common/FileUpload'
import SignatureCanvas from '../../components/common/SignatureCanvas'
import { useFormContext } from '../../context/formContextState'
import { getRequiredDocuments } from '../../utils/requiredDocuments'
import { validateStep7 } from './schema'

export default function Step7Documents({ onBack, onContinue }) {
  const { formData, updateFormData } = useFormContext()
  const requirements = useMemo(() => getRequiredDocuments(formData), [formData])
  const [documents, setDocuments] = useState(formData.documents || {})
  const [signature, setSignature] = useState(formData.eSignature || '')
  const [errors, setErrors] = useState({})
  const updateFiles = (key, files) => { setDocuments((current) => ({ ...current, [key]: files })); setErrors((current) => ({ ...current, [key]: undefined })) }
  const submit = (event) => {
    event.preventDefault(); const nextErrors = validateStep7({ documents, signature }, requirements); setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { const first = requirements.find(({ key }) => nextErrors[key]); document.getElementById(first ? `document-${first.key}` : 'esignature')?.focus(); return }
    updateFormData({ documents, eSignature: signature, documentsComplete: true }); onContinue()
  }
  const back = () => { updateFormData({ documents, eSignature: signature, documentsComplete: false }); onBack() }
  return <form className="loan-form documents-form" onSubmit={submit} noValidate>
    <section className="document-checklist" aria-labelledby="checklist-heading"><h3 id="checklist-heading">Documents Required</h3><ul>{requirements.map((item) => <li key={item.key}><span>{item.title}{!item.required && ' (Optional)'}</span><strong>{documents[item.key]?.length ? '✓ Uploaded' : item.required ? '○ Pending' : '○ Optional – PAN already verified'}</strong></li>)}</ul></section>
    <div className="document-grid">{requirements.map((item) => <section className="document-card" key={item.key} aria-labelledby={`${item.key}-title`}><div className="document-card__heading"><h3 id={`${item.key}-title`}>{item.title}{item.required && <span aria-hidden="true"> *</span>}</h3><span className="document-status">{documents[item.key]?.length ? 'Uploaded' : item.required ? 'Pending' : 'Optional'}</span></div><p>{item.description}</p><FileUpload id={`document-${item.key}`} label={item.title} files={documents[item.key] || []} onChange={(files) => updateFiles(item.key, files)} error={errors[item.key]} /></section>)}</div>
    <div id="esignature" tabIndex="-1"><SignatureCanvas value={signature} onChange={(value) => { setSignature(value); setErrors((current) => ({ ...current, signature: undefined })) }} error={errors.signature} /></div>
    <div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={back}>← Back</button><button className="button button--primary" type="submit">Continue →</button></div>
  </form>
}
