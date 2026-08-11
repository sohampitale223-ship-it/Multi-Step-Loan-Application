import { useState } from 'react'
import Stepper from '../../components/stepper/Stepper'
import Step1LoanType from '../../steps/Step1LoanType'
import Step2Personal from '../../steps/Step2Personal'
import Step3KYC from '../../steps/Step3KYC'
import Step4Address from '../../steps/Step4Address'
import Step5Employment from '../../steps/Step5Employment'

function LoanApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  return <div className="application-page">
    <header className="application-page__header"><h1>Multi-Step Loan Application</h1><p>Complete your application securely</p></header>
    <Stepper currentStep={currentStep} />
    <section className="application-card" aria-labelledby="step-heading">
      <p className="application-card__eyebrow">Step {currentStep} of 8</p>
      {currentStep === 1 && <><h2 id="step-heading">Loan Type &amp; Basic Information</h2><p className="application-card__intro">Tell us about the loan you are looking for.</p><Step1LoanType onContinue={() => setCurrentStep(2)} /></>}
      {currentStep === 2 && <><h2 id="step-heading">Step 2 – Personal Information</h2><p className="application-card__intro">Provide your personal and contact details.</p><Step2Personal onBack={() => setCurrentStep(1)} onContinue={() => setCurrentStep(3)} /></>}
      {currentStep === 3 && <><h2 id="step-heading">Step 3 – Identity Verification (KYC)</h2><p className="application-card__intro">Verify your identity details securely.</p><Step3KYC onBack={() => setCurrentStep(2)} onContinue={() => setCurrentStep(4)} /></>}
      {currentStep === 4 && <><h2 id="step-heading">Step 4 – Address Details</h2><p className="application-card__intro">Tell us where you currently live.</p><Step4Address onBack={() => setCurrentStep(3)} onContinue={() => setCurrentStep(5)} /></>}
      {currentStep === 5 && <><h2 id="step-heading">Step 5 – Employment &amp; Income</h2><p className="application-card__intro">Tell us about your employment and income.</p><Step5Employment onBack={() => setCurrentStep(4)} onContinue={() => setCurrentStep(6)} /></>}
      {currentStep === 6 && <div className="step-placeholder"><h2 id="step-heading">Step 6 – Financial</h2><p>Coming in the next implementation.</p></div>}
    </section>
  </div>
}
export default LoanApplication
