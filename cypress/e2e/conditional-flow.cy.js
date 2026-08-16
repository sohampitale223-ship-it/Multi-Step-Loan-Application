describe('Conditional form behavior', () => {
  it('looks up a valid PIN code and reports an unknown PIN code', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.fillStep2(application.personal)
      cy.fillStep3(application.kyc)
      cy.get('#current-pin-code').type('560001')
      cy.contains('Address details found.').should('be.visible')
      cy.get('#current-city').should('have.value', 'Bengaluru')
      cy.get('#current-pin-code').clear().type('111111')
      cy.contains('PIN code not found').should('be.visible')
    })
  })

  it('switches employment types and displays only the active sub-form', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan)
      cy.fillStep2(application.personal)
      cy.fillStep3(application.kyc)
      cy.fillStep4(application.address)
      cy.get('input[name="employmentType"][value="salaried"]').check()
      cy.get('#company-name').should('be.visible')
      cy.get('input[name="employmentType"][value="self-employed"]').check()
      cy.get('#business-name').should('be.visible')
      cy.get('#company-name').should('not.exist')
      cy.get('input[name="employmentType"][value="business-owner"]').check()
      cy.get('#gst-number').should('be.visible')
      cy.get('#monthly-income').should('not.exist')
    })
  })

  it('shows Step 6 only when the current loan conditions require a co-applicant', () => {
    cy.fixture('valid-personal-loan').then((personal) => {
      cy.visit('/apply')
      cy.fillStep1(personal.loan)
      cy.fillStep2(personal.personal)
      cy.fillStep3(personal.kyc)
      cy.fillStep4(personal.address)
      cy.fillStep5(personal.employment)
      cy.contains('Co-Applicant Details').should('not.exist')
      cy.contains('Documents & E-Signature').should('be.visible')
    })
  })
})
