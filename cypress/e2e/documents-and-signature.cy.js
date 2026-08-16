describe('Documents and e-signature', () => {
  it('rejects unsupported and oversized uploads, then accepts and compresses an image', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan); cy.fillStep2(application.personal); cy.fillStep3(application.kyc); cy.fillStep4(application.address); cy.fillStep5(application.employment)
      cy.get('#document-identityProof input[type="file"]').selectFile('cypress/fixtures/invalid-document.txt', { force: true })
      cy.contains('Only PDF, JPG and PNG files are allowed.').should('be.visible')
      cy.get('#document-identityProof input[type="file"]').selectFile({ contents: Cypress.Buffer.alloc(5 * 1024 * 1024 + 1), fileName: 'oversized.png', mimeType: 'image/png' }, { force: true })
      cy.contains('File size must not exceed 5 MB.').should('be.visible')
      cy.fixture('tiny-image.base64').then((base64) => {
        cy.get('#document-identityProof input[type="file"]').selectFile({ contents: Cypress.Buffer.from(base64, 'base64'), fileName: 'identity.png', mimeType: 'image/png' }, { force: true })
      })
      cy.get('#document-identityProof').contains('identity.png').should('be.visible')
      cy.get('#document-identityProof img').should('have.attr', 'src').and('not.be.empty')
    })
  })

  it('captures, clears, and validates the e-signature', () => {
    cy.fixture('valid-personal-loan').then((application) => {
      cy.visit('/apply')
      cy.fillStep1(application.loan); cy.fillStep2(application.personal); cy.fillStep3(application.kyc); cy.fillStep4(application.address); cy.fillStep5(application.employment)
      cy.fillStep7(['identityProof', 'addressProof', 'bankStatement', 'salarySlips'])
      cy.contains('Pre-Approval Summary').should('be.visible')
      cy.contains('button', 'Back').click()
      cy.get('.signature-canvas').should('be.visible')
      cy.drawSignature()
      cy.contains('Signature captured').should('be.visible')
      cy.contains('button', 'Clear Signature').click()
      cy.contains('Signature captured').should('not.exist')
      cy.contains('button', /^Continue/).click()
      cy.contains('Please provide your e-signature.').should('be.visible')
    })
  })
})
