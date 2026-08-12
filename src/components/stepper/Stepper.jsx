const allSteps = ['Loan Details', 'Personal Info', 'KYC', 'Address', 'Employment', 'Co-Applicant', 'Documents', 'Review']

function Stepper({ currentStep = 1, showCoApplicant = true }) {
  const steps = allSteps.map((label, index) => ({ label, number: index + 1 })).filter((step) => showCoApplicant || step.number !== 6)
  return <nav className="stepper" aria-label="Application progress"><ol className="stepper__list">
    {steps.map(({ label, number }) => { const active = number === currentStep; const completed = number < currentStep; return <li className={`stepper__item${active ? ' stepper__item--active' : ''}${completed ? ' stepper__item--completed' : ''}`} aria-current={active ? 'step' : undefined} key={label}><span className="stepper__number">{completed ? <><span aria-hidden="true">✓</span><span className="sr-only">Completed: </span></> : number}</span><span className="stepper__label">{label}</span></li> })}
  </ol></nav>
}

export default Stepper
