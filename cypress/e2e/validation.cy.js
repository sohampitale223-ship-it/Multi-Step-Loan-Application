describe('Step validation', () => {
  it('shows Step 1 required-field errors before allowing progression', () => {
    cy.visit('/apply')
    cy.contains('button', /^Continue/).click()
    cy.contains('Select a loan type').should('be.visible')
    cy.contains('Enter a loan amount').should('be.visible')
    cy.contains('Select a loan tenure').should('be.visible')
    cy.contains('Select a loan purpose').should('be.visible')
  })

  it('shows Step 2 required-field and age errors', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.contains('button', /^Continue/).click()
      cy.contains('Full Name is required').should('be.visible')
      cy.get('#date-of-birth').type('01/01/2010')
      cy.get('#date-of-birth').blur()
      cy.contains('Applicant must be at least 21 years old').should('be.visible')
    })
  })

  it('rejects invalid PAN and Aadhaar values and requires consent', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.fillStep2(application.personal)
      cy.get('#pan-number').type('ABCDE1234F')
      cy.contains('button', 'Verify PAN').click()
      cy.contains('PAN contains an invalid entity type character').should('be.visible')
      cy.get('#aadhaar-number').type('999999990018')
      cy.contains('button', 'Verify Aadhaar').click()
      cy.contains('Enter a valid Aadhaar number with a correct checksum').should('be.visible')
      cy.contains('button', /^Continue/).click()
      cy.contains('Aadhaar consent is required').should('be.visible')
    })
  })
})
