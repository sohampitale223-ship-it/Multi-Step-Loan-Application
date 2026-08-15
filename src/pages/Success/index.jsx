import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/formContextState'
import { formatIndianCurrency } from '../../utils/emiCalculator'
import { DRAFT_KEY } from '../../hooks/useAutoSave'
import { readSubmittedApplication, SUBMITTED_APPLICATION_KEY } from '../../utils/applicationSubmission'

const loanLabels = { personal: 'Personal Loan', home: 'Home Loan', business: 'Business Loan' }
const timeline = ['Application Submitted', 'Verification Pending', 'Credit Assessment', 'Final Decision']

function Success() {
  const { state } = useLocation(); const navigate = useNavigate(); const { resetFormData } = useFormContext()
  const application = state?.application || readSubmittedApplication(); const data = application?.applicationData
  if (!application?.applicationId || !data) return <Navigate to="/apply" replace />
  const download = () => {
    const lines = ['LOAN APPLICATION SUMMARY', `Application ID: ${application.applicationId}`, `Status: ${application.applicationStatus}`, `Submitted: ${new Date(application.submissionDate).toLocaleString()}`, '', `Applicant: ${data.fullName}`, `Loan type: ${loanLabels[data.loanType] || data.loanType}`, `Requested amount: ${formatIndianCurrency(data.loanAmount)}`, `Tenure: ${data.loanTenure} months`, `Purpose: ${data.loanPurpose}`, `PAN: ${data.panNumber}`, `Aadhaar: ${data.aadhaarNumber}`, `Email: ${data.email}`, `Mobile: ${data.mobileNumber}`, '', 'This is an application acknowledgement, not a loan approval.']
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${application.applicationId}-summary.txt`; anchor.click(); URL.revokeObjectURL(url)
  }
  const startNew = () => {
    if (!window.confirm('Start a new application? Your current draft and completed application summary will be cleared.')) return
    localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(SUBMITTED_APPLICATION_KEY); resetFormData(); navigate('/apply', { replace: true })
  }
  return <main className="success-page" aria-labelledby="success-heading"><article className="success-page__card">
    <div className="success-mark" aria-hidden="true">✓</div><p className="application-card__eyebrow">Submission complete</p>
    <h1 id="success-heading">Application Submitted Successfully</h1>
    <p className="success-page__intro" role="status">Your loan application has been submitted successfully and is currently under review.</p>
    <div className="reference-number"><span>Application ID</span><strong>{application.applicationId}</strong></div>
    <dl className="success-summary"><div><dt>Applicant Name</dt><dd>{data.fullName}</dd></div><div><dt>Loan Type</dt><dd>{loanLabels[data.loanType] || data.loanType}</dd></div><div><dt>Requested Loan Amount</dt><dd>{formatIndianCurrency(data.loanAmount)}</dd></div><div><dt>Loan Tenure</dt><dd>{data.loanTenure} months</dd></div><div><dt>Submission Date</dt><dd>{new Date(application.submissionDate).toLocaleString()}</dd></div><div><dt>Application Status</dt><dd>{application.applicationStatus}</dd></div><div><dt>PAN</dt><dd>{data.panNumber}</dd></div><div><dt>Aadhaar</dt><dd>{data.aadhaarNumber}</dd></div></dl>
    <section className="status-timeline" aria-labelledby="status-heading"><h2 id="status-heading">Application status</h2><ol>{timeline.map((label, index) => <li className={index === 0 ? 'status-timeline__complete' : ''} key={label}><span aria-hidden="true">{index === 0 ? '✓' : index + 1}</span><strong>{label}</strong>{index === 0 && <small>Complete</small>}</li>)}</ol></section>
    <p className="preapproval-note">No approval decision has been made. Final terms remain subject to verification and credit assessment.</p>
    <div className="success-actions"><button className="button button--primary" type="button" onClick={download}>Download Application Summary</button><button className="button button--secondary" type="button" onClick={() => window.print()}>Print Application</button><button className="button button--secondary" type="button" onClick={startNew}>Start New Application</button></div>
  </article></main>
}
export default Success
