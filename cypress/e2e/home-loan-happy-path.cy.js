describe('Home loan happy path', () => {
  it('submits a home loan with a co-applicant and property documents', () => {
    cy.fixture('valid-home-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.fillStep2(application.personal)
      cy.fillStep3(application.kyc)
      cy.fillStep4(application.address)
      cy.fillStep5(application.employment)
      cy.contains('Co-Applicant Details').should('be.visible')
      cy.fillStep6(application.coApplicant)
      cy.fillStep7(['identityProof', 'addressProof', 'bankStatement', 'salarySlips', 'propertyDocuments', 'saleAgreement', 'incomeProof'])
      cy.confirmAndSubmit()
      cy.contains(/Application Submitted Successfully/i).should('be.visible')
    })
  })
})
