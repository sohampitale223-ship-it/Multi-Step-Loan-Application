const doc = (key, title, description, required = true) => ({ key, title, description, required })

export function getRequiredDocuments(formState = {}) {
  const employment = formState.employmentDetails?.employmentType
  const documents = [
    doc('identityProof', 'Identity Proof', 'Government-issued photo identity document.'),
    doc('addressProof', 'Address Proof', 'Recent document showing your current address.'),
    doc('bankStatement', 'Bank Statement', 'Your recent personal bank statement.'),
    doc('panCard', 'PAN Card', formState.panVerified ? 'Optional – PAN already verified.' : 'Upload a clear copy of your PAN card.', !formState.panVerified),
  ]
  if (employment === 'salaried') documents.push(doc('salarySlips', 'Salary Slips', 'Your latest salary slip.'))
  if (employment === 'self-employed' || employment === 'business-owner') documents.push(doc('itr', 'ITR Documents', 'Recent income tax return documents.'))
  if (formState.loanType === 'home') {
    documents.push(doc('propertyDocuments', 'Property Document', 'Available property ownership or title document.'))
    documents.push(doc('saleAgreement', 'Sale Agreement / Allotment Letter', 'Sale agreement or allotment letter for the property.'))
    documents.push(doc('incomeProof', 'Income Proof', 'Supporting proof of your current income.'))
  }
  if (formState.loanType === 'business') {
    documents.push(doc('businessRegistration', 'Business Registration Proof', 'Registration or incorporation proof for the business.'))
    documents.push(doc('businessBankStatement', 'Business Bank Statement', 'Recent statement for the business bank account.'))
    if (!documents.some(({ key }) => key === 'itr')) documents.push(doc('itr', 'ITR Documents', 'Recent income tax return documents.'))
    if (employment === 'business-owner') documents.push(doc('gstCertificate', 'GST Certificate', 'Current GST registration certificate.'))
  }
  return documents
}

