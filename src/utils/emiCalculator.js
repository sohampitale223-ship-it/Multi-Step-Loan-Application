export const INTEREST_RATES = Object.freeze({ personal: 10.5, home: 8.5, business: 14 })

export function calculateEmi(principal, annualRate, tenureMonths) {
  const amount = Number(principal)
  const months = Number(tenureMonths)
  const monthlyRate = Number(annualRate) / 12 / 100
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(months) || months <= 0) return 0
  if (monthlyRate === 0) return amount / months
  const growth = (1 + monthlyRate) ** months
  return (amount * monthlyRate * growth) / (growth - 1)
}

export function calculateProcessingFee(principal) {
  const amount = Number(principal)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.min(25000, Math.max(2000, amount * 0.01))
}

export function calculateLoanSummary({ loanType, loanAmount, loanTenure }) {
  const principal = Number(loanAmount) || 0
  const tenureMonths = Number(loanTenure) || 0
  const annualInterestRate = INTEREST_RATES[loanType] || 0
  const emi = calculateEmi(principal, annualInterestRate, tenureMonths)
  const totalRepayment = emi * tenureMonths
  return { principal, tenureMonths, annualInterestRate, emi, totalRepayment, totalCostOfBorrowing: Math.max(0, totalRepayment - principal), processingFee: calculateProcessingFee(principal) }
}

export const formatIndianCurrency = (value, maximumFractionDigits = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits }).format(Number(value) || 0)
