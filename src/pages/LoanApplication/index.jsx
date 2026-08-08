import { useState } from 'react'
import Stepper from '../../components/stepper/Stepper'
import Step1LoanType from '../../steps/Step1LoanType'

function LoanApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  return <div className="application-page">
    <header className="application-page__header"><h1>Multi-Step Loan Application</h1><p>Complete your application securely</p></header>
    <Stepper currentStep={currentStep} />
    <section className="application-card" aria-labelledby="step-heading">
      <p className="application-card__eyebrow">Step {currentStep} of 8</p>
      {currentStep === 1 ? <><h2 id="step-heading">Loan Type &amp; Basic Information</h2><p className="application-card__intro">Tell us about the loan you are looking for.</p><Step1LoanType onContinue={() => setCurrentStep(2)} /></> : <div className="step-placeholder"><h2 id="step-heading">Step 2 – Personal Information</h2><p>Coming in the next implementation.</p><button className="button button--secondary" type="button" onClick={() => setCurrentStep(1)}>← Back</button></div>}
    </section>
  </div>
}

export default LoanApplication
