describe('Persistence and keyboard access', () => {
  it('saves a draft and resumes it after a reload', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.contains('button', 'Save Draft').click()
      cy.contains('Auto-saved at').should('be.visible')
      cy.reload()
      cy.contains('Resume your application?', { timeout: 5000 }).should('be.visible')
      cy.contains('button', 'Resume Application').click()
      cy.get('[data-testid="step-2"]').should('be.visible')
      cy.get('#full-name').should('have.value', '')
    })
  })

  it('supports keyboard selection and progression through Step 1', () => {
    cy.visit('/apply')
    cy.get('#loan-type-0').focus().type('{rightarrow}')
    cy.get('input[name="loanType"]:checked').should('have.value', 'home')
    cy.get('#loan-type-0').focus().type('{rightarrow}').type('{rightarrow}')
    cy.get('input[name="loanType"]:checked').should('have.value', 'business')
    cy.get('#loan-amount').focus().type('500000')
    cy.get('#loan-tenure').focus().select('60')
    cy.get('#loan-purpose').focus().select('Business Expansion')
    cy.focused().type('{tab}')
    cy.contains('button', /^Continue/).focus().type('{enter}')
    cy.get('[data-testid="step-2"]').should('be.visible')
  })
})
