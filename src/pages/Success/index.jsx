import { Navigate, Link, useLocation } from 'react-router-dom'
import { useFormContext } from '../../context/formContextState'
import { formatIndianCurrency } from '../../utils/emiCalculator'

function Success() {
  const { state } = useLocation()
  const { resetFormData } = useFormContext()
  if (!state?.application?.reference) return <Navigate to="/apply" replace />

  return <main className="success-page" aria-labelledby="success-heading"><div className="success-page__card">
    <div className="success-mark" aria-hidden="true">✓</div><p className="application-card__eyebrow">Submission complete</p>
    <h1 id="success-heading">Application submitted</h1>
    <p className="success-page__intro">Thank you, {state.applicantName}. We have received your loan application and will contact you after verification.</p>
    <div className="reference-number"><span>Application reference</span><strong>{state.application.reference}</strong></div>
    <dl className="success-summary"><div><dt>Loan</dt><dd>{state.loanType} · {formatIndianCurrency(state.loanAmount)}</dd></div><div><dt>Estimated EMI</dt><dd>{formatIndianCurrency(state.estimatedEmi)}</dd></div><div><dt>Submitted</dt><dd>{new Date(state.application.submittedAt).toLocaleString()}</dd></div></dl>
    <p className="preapproval-note">Save the reference number for future communication. Final terms remain subject to document and credit verification.</p>
    <Link className="button button--primary success-page__action" to="/apply" onClick={resetFormData}>Start another application</Link>
  </div></main>
}

export default Success
