import { useEffect, useMemo, useRef, useState } from 'react'
import Stepper from '../../components/stepper/Stepper'
import { useFormContext } from '../../context/formContextState'
import useAutoSave from '../../hooks/useAutoSave'
import useFormPersistence from '../../hooks/useFormPersistence'
import Step1LoanType from '../../steps/Step1LoanType'
import Step2Personal from '../../steps/Step2Personal'
import Step3KYC from '../../steps/Step3KYC'
import Step4Address from '../../steps/Step4Address'
import Step5Employment from '../../steps/Step5Employment'
import Step6CoApplicant from '../../steps/Step6CoApplicant'
import Step7Documents from '../../steps/Step7Documents'
import Step8Review from '../../steps/Step8Review'
import { shouldShowCoApplicant } from '../../utils/coApplicant'

function LoanApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  const resumeButtonRef = useRef(null)
  const { formData, restoreFormData, resetFormData } = useFormContext()
  const showCoApplicant = shouldShowCoApplicant(formData)
  const persisted = useFormPersistence()
  const saveState = useMemo(() => ({ formData, currentStep }), [formData, currentStep])
  const autoSave = useAutoSave(saveState, 30000, !persisted.hasSavedDraft && Object.keys(formData).length > 0)

  useEffect(() => { if (persisted.hasSavedDraft) resumeButtonRef.current?.focus() }, [persisted.hasSavedDraft])
  const resume = () => {
    const saved = persisted.resumeDraft()
    if (!saved) return
    restoreFormData(saved.formData)
    const activeStep6 = shouldShowCoApplicant(saved.formData)
    setCurrentStep(saved.currentStep === 6 && !activeStep6 ? 7 : Math.min(Math.max(saved.currentStep, 1), 8))
  }
  const startFresh = () => { persisted.discardDraft(); resetFormData(); setCurrentStep(1) }
  const modalKeyDown = (event) => {
    if (event.key === 'Escape') startFresh()
    if (event.key === 'Tab') { const buttons = event.currentTarget.querySelectorAll('button'); const first = buttons[0]; const last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() } }
  }

  return <div className="application-page">
    <header className="application-page__header"><h1>Multi-Step Loan Application</h1><p>Complete your application securely</p></header>
    <Stepper currentStep={currentStep} showCoApplicant={showCoApplicant} />
    {(persisted.externalUpdate || persisted.persistenceError) && <div className="persistence-notice" role="status">{persisted.persistenceError || 'This application was updated in another tab.'}{persisted.persistenceError && <button className="button button--secondary" type="button" onClick={startFresh}>Start Fresh</button>}</div>}
    <section className="application-card" aria-labelledby="step-heading">
      <p className="application-card__eyebrow">Step {currentStep} of 8</p>
      {currentStep === 1 && <><h2 id="step-heading">Loan Type &amp; Basic Information</h2><p className="application-card__intro">Tell us about the loan you are looking for.</p><Step1LoanType onContinue={() => setCurrentStep(2)} /></>}
      {currentStep === 2 && <><h2 id="step-heading">Step 2 – Personal Information</h2><p className="application-card__intro">Provide your personal and contact details.</p><Step2Personal onBack={() => setCurrentStep(1)} onContinue={() => setCurrentStep(3)} /></>}
      {currentStep === 3 && <><h2 id="step-heading">Step 3 – Identity Verification (KYC)</h2><p className="application-card__intro">Verify your identity details securely.</p><Step3KYC onBack={() => setCurrentStep(2)} onContinue={() => setCurrentStep(4)} /></>}
      {currentStep === 4 && <><h2 id="step-heading">Step 4 – Address Details</h2><p className="application-card__intro">Tell us where you currently live.</p><Step4Address onBack={() => setCurrentStep(3)} onContinue={() => setCurrentStep(5)} /></>}
      {currentStep === 5 && <><h2 id="step-heading">Step 5 – Employment &amp; Income</h2><p className="application-card__intro">Tell us about your employment and income.</p><Step5Employment onBack={() => setCurrentStep(4)} onContinue={() => setCurrentStep(showCoApplicant ? 6 : 7)} /></>}
      {currentStep === 6 && showCoApplicant && <><h2 id="step-heading">Co-Applicant Details</h2><p className="application-card__intro">Provide the details of the co-applicant supporting this loan application.</p><Step6CoApplicant onBack={() => setCurrentStep(5)} onContinue={() => setCurrentStep(7)} /></>}
      {currentStep === 7 && <><h2 id="step-heading">Documents &amp; E-Signature</h2><p className="application-card__intro">Upload the required documents and provide your signature.</p><Step7Documents onBack={() => setCurrentStep(showCoApplicant ? 6 : 5)} onContinue={() => setCurrentStep(8)} /></>}
      {currentStep === 8 && <><h2 id="step-heading">Step 8 – Review &amp; Pre-Approval Summary</h2><p className="application-card__intro">Review your details, indicative loan terms, and consents before submitting.</p><Step8Review onBack={() => setCurrentStep(7)} onEdit={setCurrentStep} onSubmitted={() => persisted.discardDraft()} /></>}
      <div className="save-status" aria-live="polite"><button className="save-link" type="button" onClick={autoSave.saveNow} disabled={autoSave.isSaving || !Object.keys(formData).length}>{autoSave.isSaving ? 'Saving…' : 'Save Draft'}</button>{autoSave.lastSavedAt && <span>Auto-saved at {new Date(autoSave.lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}{autoSave.saveError && <span>Draft could not be saved.</span>}</div>
    </section>
    {persisted.hasSavedDraft && <div className="modal-backdrop"><div className="resume-modal" role="dialog" aria-modal="true" aria-labelledby="resume-title" aria-describedby="resume-description" onKeyDown={modalKeyDown}><h2 id="resume-title">Resume your application?</h2><p id="resume-description">We found a saved loan application from {new Date(persisted.savedAt).toLocaleString()}. Would you like to continue where you left off?</p><div className="loan-form__actions loan-form__actions--split"><button ref={resumeButtonRef} className="button button--primary" type="button" onClick={resume}>Resume Application</button><button className="button button--secondary" type="button" onClick={startFresh}>Start Fresh</button></div></div></div>}
  </div>
}
export default LoanApplication
