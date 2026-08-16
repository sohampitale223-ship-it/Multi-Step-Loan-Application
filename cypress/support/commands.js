const next = () => cy.contains('button', /^Continue/).click()

Cypress.Commands.add('fillStep1', (loan) => {
  cy.get(`input[name="loanType"][value="${loan.type}"]`).check()
  cy.get('#loan-amount').clear().type(loan.amount)
  cy.get('#loan-tenure').select(loan.tenure)
  cy.get('#loan-purpose').select(loan.purpose)
  next()
})

Cypress.Commands.add('fillStep2', (person) => {
  cy.get('#full-name').type(person.fullName)
  cy.get('#date-of-birth').type(person.dateOfBirth)
  cy.get(`input[name="gender"][value="${person.gender}"]`).check()
  cy.get('#marital-status').select(person.maritalStatus)
  cy.get('#father-name').type(person.fatherName)
  cy.get('#mother-name').type(person.motherName)
  cy.get('#email').type(person.email)
  cy.get('#mobile-number').type(person.mobileNumber)
  next()
})

Cypress.Commands.add('fillStep3', (kyc) => {
  cy.get('#pan-number').type(kyc.pan)
  cy.contains('button', 'Verify PAN').click()
  cy.contains('PAN Verified', { timeout: 4000 }).should('be.visible')
  cy.get('#aadhaar-number').type(kyc.aadhaar)
  cy.contains('button', 'Verify Aadhaar').click()
  cy.contains('Aadhaar Verified', { timeout: 4000 }).should('be.visible')
  cy.get('#aadhaar-consent').check()
  next()
})

Cypress.Commands.add('fillStep4', (address) => {
  cy.get('#current-address-line-1').type(address.line1)
  cy.get('#current-pin-code').type(address.pinCode)
  cy.contains('Address details found.', { timeout: 2000 }).should('be.visible')
  cy.get('#residence-type').select(address.residenceType)
  cy.get('#years-at-current-address').type(address.years)
  cy.get('#same-as-current').check()
  next()
})

Cypress.Commands.add('fillStep5', (employment) => {
  cy.get(`input[name="employmentType"][value="${employment.type}"]`).check()
  if (employment.type === 'salaried') {
    cy.get('#company-name').type(employment.companyName)
    cy.get('#designation').type(employment.designation)
    cy.get('#monthly-net-salary').type(employment.monthlySalary)
    cy.get('#years-of-experience').type(employment.experience)
  } else {
    cy.get('#business-name').type(employment.businessName)
    cy.get('#business-type').select(employment.businessType)
    cy.get('#annual-turnover').type(employment.annualTurnover)
    cy.get('#years-in-business').type(employment.yearsInBusiness)
    if (employment.monthlyIncome) cy.get('#monthly-income').type(employment.monthlyIncome)
    if (employment.gstNumber) cy.get('#gst-number').type(employment.gstNumber)
    cy.get('#office-address').type(employment.officeAddress)
  }
  next()
})

Cypress.Commands.add('drawSignature', (selector = '.signature-canvas') => {
  cy.get(selector).should('be.visible').trigger('mousedown', 20, 30).trigger('mousemove', 80, 70).trigger('mousemove', 140, 35).trigger('mouseup')
})

Cypress.Commands.add('fillStep6', (coApplicant) => {
  cy.get('#co-applicant-name').type(coApplicant.name)
  cy.get('#co-applicant-relationship').select(coApplicant.relationship)
  cy.get('#co-applicant-pan').type(coApplicant.pan)
  cy.contains('button', 'Verify PAN').click()
  cy.contains('PAN Verified', { timeout: 4000 }).should('be.visible')
  cy.get('#co-applicant-income').type(coApplicant.monthlyIncome)
  cy.get('#co-applicant-consent').check()
  cy.drawSignature()
  next()
})

Cypress.Commands.add('fillStep7', (documentKeys) => {
  documentKeys.forEach((key) => {
    cy.get(`#document-${key} input[type="file"]`).selectFile('cypress/fixtures/sample-document.pdf', { force: true })
    cy.get(`#document-${key}`).contains('Uploaded').should('be.visible')
  })
  cy.drawSignature()
  cy.contains('Signature captured').should('be.visible')
  next()
})

Cypress.Commands.add('confirmAndSubmit', () => {
  cy.get('#consent-accuracy').check()
  cy.get('#consent-credit').check()
  cy.get('#consent-terms').check()
  cy.get('#consent-communications').check()
  cy.contains('button', 'Submit Application').click()
})
