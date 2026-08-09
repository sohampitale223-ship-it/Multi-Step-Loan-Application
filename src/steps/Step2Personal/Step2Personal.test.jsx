import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormProvider } from '../../context/FormContext'
import LoanApplication from '../../pages/LoanApplication'

async function reachStep2(user) {
  await user.click(screen.getByRole('radio', { name: 'Personal Loan' }))
  await user.type(screen.getByLabelText(/Loan Amount/), '500000')
  await user.selectOptions(screen.getByLabelText(/Loan Tenure/), '24')
  await user.selectOptions(screen.getByLabelText(/Loan Purpose/), 'Education')
  await user.click(screen.getByRole('button', { name: /Continue/ }))
}

async function fillStep2(user) {
  await user.type(screen.getByLabelText(/Full Name/), 'Amit Sharma')
  await user.type(screen.getByLabelText(/Date of Birth/), '1990-05-15')
  await user.click(screen.getByRole('radio', { name: 'Male' }))
  await user.selectOptions(screen.getByLabelText(/Marital Status/), 'married')
  await user.type(screen.getByLabelText(/Father's Name/), 'Raj Sharma')
  await user.type(screen.getByLabelText(/Mother's Name/), 'Sita Sharma')
  await user.type(screen.getByLabelText(/^Email/), 'amit@example.com')
  await user.type(screen.getByLabelText(/^Mobile Number/), '9876543210')
}

const renderPage = () => render(<FormProvider><LoanApplication /></FormProvider>)

describe('Step 2 personal information flow', () => {
  it('renders after completing Step 1 and marks Step 1 complete', async () => {
    const user = userEvent.setup(); renderPage(); await reachStep2(user)
    expect(screen.getByRole('heading', { name: /Step 2.*Personal Information/ })).toBeInTheDocument()
    expect(screen.getByText('Loan Details').closest('li')).toHaveClass('stepper__item--completed')
    expect(screen.getByText('Personal Info').closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('announces required errors and focuses the first invalid field', async () => {
    const user = userEvent.setup(); renderPage(); await reachStep2(user); await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText('Full Name is required')).toHaveAttribute('role', 'alert')
    expect(screen.getByLabelText(/Full Name/)).toHaveFocus()
    expect(screen.getByText('Select a gender')).toBeInTheDocument()
    expect(screen.getByText('Select a marital status')).toBeInTheDocument()
  })

  it('advances valid Step 2 to the Step 3 KYC form', async () => {
    const user = userEvent.setup(); renderPage(); await reachStep2(user); await fillStep2(user); await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByRole('heading', { name: 'Step 3 – Identity Verification (KYC)' })).toBeInTheDocument()
    expect(screen.getByLabelText(/PAN Number/)).toBeInTheDocument()
  })

  it('preserves Step 2 data after Back and returning from Step 1', async () => {
    const user = userEvent.setup(); renderPage(); await reachStep2(user)
    await user.type(screen.getByLabelText(/Full Name/), 'Amit Sharma')
    await user.selectOptions(screen.getByLabelText(/Marital Status/), 'married')
    await user.click(screen.getByRole('button', { name: /Back/ }))
    await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByLabelText(/Full Name/)).toHaveValue('Amit Sharma')
    expect(screen.getByLabelText(/Marital Status/)).toHaveValue('married')
  })
})
