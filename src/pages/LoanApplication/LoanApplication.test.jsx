import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormProvider } from '../../context/FormContext'
import LoanApplication from '.'

const renderPage = () => render(<FormProvider><LoanApplication /></FormProvider>)
const choose = async (user, type) => user.click(screen.getByRole('radio', { name: type }))
const fillValid = async (user, type = 'Personal Loan', amount = '500000') => {
  await choose(user, type)
  await user.type(screen.getByLabelText(/Loan Amount/), amount)
  await user.selectOptions(screen.getByLabelText(/Loan Tenure/), type === 'Home Loan' ? '120' : '24')
  await user.selectOptions(screen.getByLabelText(/Loan Purpose/), type === 'Home Loan' ? 'Purchase New Home' : 'Education')
}

describe('Day 3 loan application', () => {
  it('renders Step 1 and all eight progress steps', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Loan Type & Basic Information' })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Application progress' })).getAllByRole('listitem')).toHaveLength(8)
  })

  it('requires a loan type and focuses it on continue', async () => {
    const user = userEvent.setup(); renderPage(); await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText('Select a loan type')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Personal Loan' })).toHaveFocus()
  })

  it.each([
    ['Personal Loan', '1000001', /₹10,00,000 for a Personal Loan/],
    ['Business Loan', '5000001', /₹50,00,000 for a Business Loan/],
  ])('rejects an excessive %s amount', async (type, amount, message) => {
    const user = userEvent.setup(); renderPage(); await choose(user, type); await user.type(screen.getByLabelText(/Loan Amount/), amount); await user.tab()
    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('accepts a Home Loan amount above ten lakh within one crore', async () => {
    const user = userEvent.setup(); renderPage(); await fillValid(user, 'Home Loan', '1500000'); await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByRole('heading', { name: 'Step 2 – Personal Information' })).toBeInTheDocument()
  })

  it('changes tenure and purpose options with loan type', async () => {
    const user = userEvent.setup(); renderPage(); await choose(user, 'Personal Loan')
    expect(within(screen.getByLabelText(/Loan Tenure/)).getByRole('option', { name: '12 months' })).toBeInTheDocument()
    expect(within(screen.getByLabelText(/Loan Purpose/)).getByRole('option', { name: 'Medical Expenses' })).toBeInTheDocument()
    await choose(user, 'Home Loan')
    expect(within(screen.getByLabelText(/Loan Tenure/)).queryByRole('option', { name: '12 months' })).not.toBeInTheDocument()
    expect(within(screen.getByLabelText(/Loan Tenure/)).getByRole('option', { name: '360 months' })).toBeInTheDocument()
    expect(within(screen.getByLabelText(/Loan Purpose/)).getByRole('option', { name: 'Purchase New Home' })).toBeInTheDocument()
  })

  it('shows an error for an invalid referral code', async () => {
    const user = userEvent.setup(); renderPage(); await user.type(screen.getByLabelText(/Referral Code/), 'a-1'); await user.tab()
    expect(await screen.findByText('Referral code must be 6–10 alphanumeric characters')).toBeInTheDocument()
  })

  it('advances after valid submission and preserves values after Back', async () => {
    const user = userEvent.setup(); renderPage(); await fillValid(user); await user.type(screen.getByLabelText(/Referral Code/), 'abc123'); await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText('Coming in the next implementation.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back/ }))
    expect(screen.getByRole('radio', { name: 'Personal Loan' })).toBeChecked()
    expect(screen.getByLabelText(/Loan Amount/)).toHaveValue('₹5,00,000')
    expect(screen.getByLabelText(/Loan Tenure/)).toHaveValue('24')
    expect(screen.getByLabelText(/Referral Code/)).toHaveValue('ABC123')
  })
})
