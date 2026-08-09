const steps = ['Loan Details', 'Personal Info', 'KYC', 'Address', 'Employment', 'Financial', 'Documents', 'Review']

function Stepper({ currentStep = 1 }) {
  return <nav className="stepper" aria-label="Application progress"><ol className="stepper__list">
    {steps.map((step, index) => { const number = index + 1; const active = number === currentStep; const completed = number < currentStep; return <li className={`stepper__item${active ? ' stepper__item--active' : ''}${completed ? ' stepper__item--completed' : ''}`} aria-current={active ? 'step' : undefined} key={step}><span className="stepper__number">{completed ? <><span aria-hidden="true">✓</span><span className="sr-only">Completed: </span></> : number}</span><span className="stepper__label">{step}</span></li> })}
  </ol></nav>
}

export default Stepper
