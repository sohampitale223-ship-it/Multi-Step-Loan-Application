import { useMemo, useState } from 'react'
import Checkbox from '../../components/common/Checkbox'
import { useFormContext } from '../../context/formContextState'
import { calculateLoanSummary, formatIndianCurrency } from '../../utils/emiCalculator'
import { getRequiredDocuments } from '../../utils/requiredDocuments'

const loanLabels = { personal: 'Personal Loan', home: 'Home Loan', business: 'Business Loan' }
const employmentLabels = { salaried: 'Salaried', 'self-employed': 'Self-Employed', 'business-owner': 'Business Owner' }
const show = (value) => value === undefined || value === null || value === '' ? 'Not provided' : String(value)
const Item = ({ label, value }) => <div className="review-item"><dt>{label}</dt><dd>{show(value)}</dd></div>

function Section({ title, step, onEdit, children }) {
  return <section className="review-section"><div className="review-section__heading"><h3>{title}</h3><button className="review-edit" type="button" onClick={() => onEdit(step)} aria-label={`Edit ${title}`}>Edit</button></div><dl>{children}</dl></section>
}

function Step8Review({ onBack, onEdit, onSubmitted }) {
  const { formData } = useFormContext()
  const [consents, setConsents] = useState({ accuracy: false, credit: false, terms: false, communications: false, affordability: false })
  const [submitted, setSubmitted] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const summary = useMemo(() => calculateLoanSummary(formData), [formData])
  const employment = formData.employmentDetails || {}
  const address = formData.addressDetails || {}
  const income = Number(employment.monthlyNetSalary || employment.monthlyIncome || 0) + Number(formData.coApplicant?.monthlyIncome || 0)
  const emiRatio = income > 0 ? summary.emi / income : 0
  const highEmi = emiRatio > 0.5
  const required = getRequiredDocuments(formData).filter((item) => item.required)
  const documentsComplete = required.every((item) => formData.documents?.[item.key]?.length)
  const allConsents = ['accuracy', 'credit', 'terms', 'communications'].every((key) => consents[key])
  const canSubmit = documentsComplete && allConsents && (!highEmi || consents.affordability)
  const toggle = (key) => (event) => setConsents((current) => ({ ...current, [key]: event.target.checked }))
  const submit = (event) => {
    event.preventDefault()
    if (!canSubmit || submitted) return
    const result = { reference: crypto.randomUUID().toUpperCase(), submittedAt: new Date().toISOString() }
    setSubmitted(result)
    setShowSuccess(true)
    onSubmitted?.(result)
  }

  return <>
    <div className="review-grid">
      <section className="preapproval-card" aria-labelledby="preapproval-heading"><p className="application-card__eyebrow">Indicative offer</p><h3 id="preapproval-heading">Pre-Approval Summary</h3><dl><Item label="Loan amount" value={formatIndianCurrency(summary.principal)} /><Item label="Tenure" value={`${summary.tenureMonths} months`} /><Item label="Indicative interest rate" value={`${summary.annualInterestRate}% p.a.`} /><Item label="Estimated monthly EMI" value={formatIndianCurrency(summary.emi)} /><Item label="Total interest cost" value={formatIndianCurrency(summary.totalCostOfBorrowing)} /><Item label="Total repayment" value={formatIndianCurrency(summary.totalRepayment)} /><Item label="Processing fee" value={formatIndianCurrency(summary.processingFee)} /></dl><p className="preapproval-note">Indicative figures only. Final terms are subject to verification and credit assessment.</p></section>
      {highEmi && <div className="affordability-warning" role="alert"><strong>Affordability warning</strong><p>The estimated EMI is {Math.round(emiRatio * 100)}% of combined monthly income ({formatIndianCurrency(income)}). You may proceed after acknowledging this risk.</p></div>}
      <Section title="Loan details" step={1} onEdit={onEdit}><Item label="Loan type" value={loanLabels[formData.loanType]} /><Item label="Purpose" value={formData.loanPurpose} /><Item label="Requested amount" value={formatIndianCurrency(formData.loanAmount)} /></Section>
      <Section title="Personal information" step={2} onEdit={onEdit}><Item label="Name" value={formData.fullName} /><Item label="Date of birth" value={formData.dateOfBirth} /><Item label="Email" value={formData.email} /><Item label="Mobile" value={formData.mobileNumber} /></Section>
      <Section title="Identity verification" step={3} onEdit={onEdit}><Item label="PAN" value={formData.panVerified ? 'Verified' : 'Pending'} /><Item label="Aadhaar" value={formData.aadhaarVerified ? 'Verified' : 'Pending'} /></Section>
      <Section title="Address" step={4} onEdit={onEdit}><Item label="Current address" value={[address.currentAddressLine1, address.currentCity, address.currentState, address.currentPinCode].filter(Boolean).join(', ')} /><Item label="Residence type" value={address.residenceType} /></Section>
      <Section title="Employment & income" step={5} onEdit={onEdit}><Item label="Employment type" value={employmentLabels[employment.employmentType]} /><Item label="Organisation / business" value={employment.companyName || employment.businessName} /><Item label="Primary monthly income" value={formatIndianCurrency(employment.monthlyNetSalary || employment.monthlyIncome)} /></Section>
      {formData.coApplicant && <Section title="Co-applicant" step={6} onEdit={onEdit}><Item label="Name" value={formData.coApplicant.name} /><Item label="Relationship" value={formData.coApplicant.relationship} /><Item label="Monthly income" value={formatIndianCurrency(formData.coApplicant.monthlyIncome)} /></Section>}
      <Section title="Documents & signature" step={7} onEdit={onEdit}><Item label="Required documents" value={`${required.filter((item) => formData.documents?.[item.key]?.length).length} of ${required.length} uploaded`} /><Item label="E-signature" value={formData.eSignature ? 'Captured' : 'Missing'} />{formData.eSignature && <div className="review-signature"><dt>Signature preview</dt><dd><img src={formData.eSignature} alt="Applicant e-signature" /></dd></div>}</Section>
    </div>
    {submitted && !showSuccess && <div className="submission-confirmation" role="status"><strong>Application submitted successfully</strong><span>Reference: {submitted.reference}</span></div>}
    <form className="consent-form" onSubmit={submit}><fieldset disabled={Boolean(submitted)}><legend>Confirm and submit</legend><Checkbox id="consent-accuracy" label="I confirm that all information provided is accurate and complete." checked={consents.accuracy} onChange={toggle('accuracy')} /><Checkbox id="consent-credit" label="I authorise LendSwift to check my credit score via CIBIL or Equifax." checked={consents.credit} onChange={toggle('credit')} /><Checkbox id="consent-terms" label="I have read and agree to the Terms and Conditions." checked={consents.terms} onChange={toggle('terms')} /><Checkbox id="consent-communications" label="I consent to receive communications regarding this application." checked={consents.communications} onChange={toggle('communications')} />{highEmi && <Checkbox id="consent-affordability" label="I understand the estimated EMI exceeds 50% of combined monthly income and wish to proceed." checked={consents.affordability} onChange={toggle('affordability')} />}</fieldset>{!documentsComplete && <p className="form-error" role="alert">Upload every mandatory document before submitting. Use Edit above to return to Step 7.</p>}<div className="loan-form__actions loan-form__actions--split"><button className="button button--secondary" type="button" onClick={onBack} disabled={Boolean(submitted)}>← Back</button><button className="button button--primary" type="submit" disabled={!canSubmit || Boolean(submitted)}>{submitted ? 'Application Submitted' : 'Submit Application'}</button></div></form>
    {submitted && showSuccess && <div className="modal-backdrop"><div className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-mark" aria-hidden="true">✓</div><h2 id="success-title">Application submitted</h2><p>Your application has been received successfully.</p><div className="reference-number"><span>Application reference</span><strong>{submitted.reference}</strong></div><dl><Item label="Applicant" value={formData.fullName} /><Item label="Loan" value={`${loanLabels[formData.loanType]} · ${formatIndianCurrency(summary.principal)}`} /><Item label="Estimated EMI" value={formatIndianCurrency(summary.emi)} /></dl><p className="preapproval-note">Keep this reference number for future communication.</p><button className="button button--primary success-modal__done" type="button" onClick={() => setShowSuccess(false)} autoFocus>Done</button></div></div>}
  </>
}

export default Step8Review
