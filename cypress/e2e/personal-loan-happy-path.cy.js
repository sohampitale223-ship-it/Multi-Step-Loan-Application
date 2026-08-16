describe('Personal loan happy path', () => {
  it('submits a complete salaried personal-loan application', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.fillStep2(application.personal)
      cy.fillStep3(application.kyc)
      cy.fillStep4(application.address)
      cy.fillStep5(application.employment)
      cy.contains('Documents & E-Signature').should('be.visible')
      cy.fillStep7(['identityProof', 'addressProof', 'bankStatement', 'salarySlips'])
      cy.contains('Pre-Approval Summary').should('be.visible')
      cy.confirmAndSubmit()
      cy.contains(/Application Submitted Successfully/i).should('be.visible')
    })
  })
})
