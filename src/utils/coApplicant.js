export function shouldShowCoApplicant(formData = {}) {
  const amount = Number(formData.loanAmount) || 0
  if (formData.loanType === 'home') return true
  if (formData.loanType === 'personal') return amount > 500000
  if (formData.loanType === 'business') return amount > 2000000
  return false
}
