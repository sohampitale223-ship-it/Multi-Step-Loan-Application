import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { FormProvider } from '../../context/FormContext'
import Success from '.'

const renderSuccess = (state) => render(
  <FormProvider><MemoryRouter initialEntries={[{ pathname: '/success', state }]}><Routes>
    <Route path="/success" element={<Success />} />
    <Route path="/apply" element={<p>Application form</p>} />
  </Routes></MemoryRouter></FormProvider>,
)

describe('Success page', () => {
  it('shows the submitted application summary', () => {
    renderSuccess({ application: { reference: 'APP-123', submittedAt: '2026-08-15T06:30:00.000Z' }, applicantName: 'Asha Rao', loanType: 'Home Loan', loanAmount: 2500000, estimatedEmi: 32150 })
    expect(screen.getByRole('heading', { name: 'Application submitted' })).toBeInTheDocument()
    expect(screen.getByText('APP-123')).toBeInTheDocument()
    expect(screen.getByText(/Home Loan/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start another application' })).toHaveAttribute('href', '/apply')
  })

  it('redirects direct visits back to the application', () => {
    renderSuccess(null)
    expect(screen.getByText('Application form')).toBeInTheDocument()
  })
})
