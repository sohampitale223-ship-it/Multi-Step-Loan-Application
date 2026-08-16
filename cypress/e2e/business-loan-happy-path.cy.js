describe('Business loan happy path', () => {
  it('submits a business loan with GST, registration, and ITR documents', () => {
    cy.fixture('valid-business-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.fillStep2(application.personal)
      cy.fillStep3(application.kyc)
      cy.fillStep4(application.address)
      cy.fillStep5(application.employment)
      cy.fillStep7(['identityProof', 'addressProof', 'bankStatement', 'itr', 'businessRegistration', 'businessBankStatement', 'gstCertificate'])
      cy.contains('GST Number').should('not.exist')
      cy.confirmAndSubmit()
      cy.contains(/Application Submitted Successfully/i).should('be.visible')
    })
  })
})
