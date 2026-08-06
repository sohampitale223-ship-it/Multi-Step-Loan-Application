import { create } from 'zustand'

const useLoanStore = create(() => ({
  currentStep: 1,
  loanType: null,
  formData: {},
  setCurrentStep: () => {},
  setLoanType: () => {},
  updateForm: () => {},
  resetForm: () => {},
}))

export default useLoanStore
