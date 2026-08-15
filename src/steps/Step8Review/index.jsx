import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Checkbox from '../../components/common/Checkbox'
import { useFormContext } from '../../context/formContextState'
import { calculateLoanSummary, formatIndianCurrency } from '../../utils/emiCalculator'
import { getRequiredDocuments } from '../../utils/requiredDocuments'
import { createSubmittedApplication, persistSubmittedApplication, simulateSubmission, validateApplication } from '../../utils/applicationSubmission'

const loanLabels = { personal: 'Personal Loan', home: 'Home Loan', business: 'Business Loan' }
const show = (value) => value === undefined || value === null || value === '' ? 'Not provided' : String(value)
const Item = ({ label, value }) => <div className="review-item"><dt>{label}</dt><dd>{show(value)}</dd></div>
function Section({ title, step, onEdit, children }) { return <section className="review-section"><div className="review-section__heading"><h3>{title}</h3><button className="review-edit" type="button" onClick={() => onEdit(step)} aria-label={`Edit ${title}`}>Edit</button></div><dl>{children}</dl></section> }

function Step8Review({ onBack, onEdit, onSubmitted, submissionService = simulateSubmission }) {
  const { formData } = useFormContext(); const navigate = useNavigate()
  const [consents, setConsents] = useState({ accuracy: false, credit: false, terms: false, communications: false, affordability: false })
  const [isSubmitting, setIsSubmitting] = useState(false); const [submitted, setSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState(''); const [validationErrors, setValidationErrors] = useState([])
  const summary = useMemo(() => calculateLoanSummary(formData), [formData]); const employment = formData.employmentDetails || {}; const address = formData.addressDetails || {}
  const income = Number(employment.monthlyNetSalary || employment.monthlyIncome || 0) + Number(formData.coApplicant?.monthlyIncome || 0)
  const highEmi = income > 0 && summary.emi / income > 0.5
  const required = getRequiredDocuments(formData).filter((item) => item.required)
  const documentsComplete = required.every((item) => formData.documents?.[item.key]?.length)
  const allConsents = ['accuracy', 'credit', 'terms', 'communications'].every((key) => consents[key])
  const toggle = (key) => (event) => setConsents((current) => ({ ...current, [key]: event.target.checked }))
  const submit = async (event) => {
    event.preventDefault(); if (isSubmitting || submitted) return
    const missing = validateApplication(formData)
    if (!allConsents) missing.push('Accept all required consent and declaration checkboxes.')
    if (highEmi && !consents.affordability) missing.push('Acknowledge the affordability warning before submitting.')
    setValidationErrors(missing); if (missing.length) return
    setIsSubmitting(true); setSubmissionError('')
    try {
      await submissionService({ shouldFail: new URLSearchParams(window.location.search).get('simulateSubmissionFailure') === '1' })
      const application = createSubmittedApplication(formData)
      persistSubmittedApplication(application); setSubmitted(true); onSubmitted?.(application)
      navigate('/success', { replace: true, state: { application } })
    } catch (error) { setSubmissionError(error instanceof Error ? error.message : 'Submission failed. Please try again.') }
    finally { setIsSubmitting(false) }
  }
  return <>
    <div className="review-grid">
      <section className="preapproval-card"><p className="application-card__eyebrow">Indicative offer</p><h3>Pre-Approval Summary</h3><dl><Item label="Loan amount" value={formatIndianCurrency(summary.principal)} /><Item label="Tenure" value={`${summary.tenureMonths} months`} /><Item label="Estimated monthly EMI" value={formatIndianCurrency(summary.emi)} /><Item label="Total repayment" value={formatIndianCurrency(summary.totalRepayment)} /></dl><p className="preapproval-note">Indicative figures only. Final terms are subject to verification and credit assessment.</p></section>
      {highEmi && <div className="affordability-warning" role="alert"><strong>Affordability warning</strong><p>The estimated EMI exceeds 50% of combined monthly income. You may proceed after acknowledging this risk.</p></div>}
      <Section title="Loan details" step={1} onEdit={onEdit}><Item label="Loan type" value={loanLabels[formData.loanType]} /><Item label="Purpose" value={formData.loanPurpose} /><Item label="Requested amount" value={formatIndianCurrency(formData.loanAmount)} /></Section>
      <Section title="Personal information" step={2} onEdit={onEdit}><Item label="Name" value={formData.fullName} /><Item label="Date of birth" value={formData.dateOfBirth} /><Item label="Email" value={formData.email} /><Item label="Mobile" value={formData.mobileNumber} /></Section>
      <Section title="Identity verification" step={3} onEdit={onEdit}><Item label="PAN" value={formData.panVerified ? 'Verified' : 'Pending'} /><Item label="Aadhaar" value={formData.aadhaarVerified ? 'Verified' : 'Pending'} /></Section>
      <Section title="Address" step={4} onEdit={onEdit}><Item label="Current address" value={[address.currentAddressLine1, address.currentCity, address.currentState, address.currentPinCode].filter(Boolean).join(', ')} /><Item label="Residence type" value={address.residenceType} /></Section>
      <Section title="Employment & income" step={5} onEdit={onEdit}><Item label="Employment type" value={employment.employmentType} /><Item label="Organisation / business" value={employment.companyName || employment.businessName} /><Item label="Primary monthly income" value={formatIndianCurrency(employment.monthlyNetSalary || employment.monthlyIncome)} /></Section>
      {formData.coApplicant && <Section title="Co-applicant" step={6} onEdit={onEdit}><Item label="Name" value={formData.coApplicant.name} /><Item label="Relationship" value={formData.coApplicant.relationship} /></Section>}
      <Section title="Documents & signature" step={7} onEdit={onEdit}><Item label="Required documents" value={`${required.filter((item) => formData.documents?.[item.key]?.length).length} of ${required.length} uploaded`} /><Item label="E-signature" value={formData.eSignature ? 'Captured' : 'Missing'} /></Section>
    </div>
    {submissionError && <div className="submission-error" role="alert"><strong>Application not submitted</strong><span>{submissionError}</span></div>}
    {validationErrors.length > 0 && <div className="submission-error" role="alert"><strong>Please complete the following before submitting:</strong><ul>{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
    <form className="consent-form" onSubmit={submit}><fieldset disabled={submitted || isSubmitting}><legend>Confirm and submit</legend><Checkbox id="consent-accuracy" label="I confirm that all information provided is accurate and complete." checked={consents.accuracy} onChange={toggle('accuracy')} /><Checkbox id="consent-credit" label="I authorise LendSwift to check my credit score via CIBIL or Equifax." checked={consents.credit} onChange={toggle('credit')} /><Checkbox id="consent-terms" label="I have read and agree to the Terms and Conditions." checked={consents.terms} onChange={toggle('terms')} /><Checkbox id="consent-communications" label="I consent to receive communications regarding this application." checked={consents.communications} onChange={toggle('communications')} />{highEmi && <Checkbox id="consent-affordability" label="I understand the estimated EMI exceeds 50% of combined monthly income and wish to proceed." checked={consents.affordability} onChange={toggle('affordability')} />}</fieldset>{!documentsComplete && <p className="form-error" role="alert">Upload every mandatory document before submitting. Use Edit above to return to Step 7.</p>}<div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={onBack} disabled={submitted || isSubmitting}>← Back</button><button className="button button--primary" type="submit" disabled={submitted || isSubmitting} aria-busy={isSubmitting}>{isSubmitting && <span className="verification-spinner" aria-hidden="true" />} {submissionError ? 'Retry Submission' : isSubmitting ? 'Submitting Application...' : 'Submit Application'}</button></div><p className="sr-only" aria-live="polite">{isSubmitting ? 'Submitting application' : ''}</p></form>
  </>
}
export default Step8Review
