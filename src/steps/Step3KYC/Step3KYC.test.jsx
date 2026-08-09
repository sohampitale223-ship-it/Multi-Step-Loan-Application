import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormStateContext } from '../../context/formContextState'
import Step3KYC from '.'

const validPan = 'abcpd1234e'
const validAadhaar = '999999990019'

function renderStep({ formData = {}, onBack = vi.fn(), onContinue = vi.fn(), updateFormData = vi.fn() } = {}) {
  render(<FormStateContext.Provider value={{ formData, updateFormData }}><Step3KYC onBack={onBack} onContinue={onContinue} /></FormStateContext.Provider>)
  return { onBack, onContinue, updateFormData }
}

async function verifyBoth() {
  const pan = screen.getByLabelText(/PAN Number/)
  fireEvent.focus(pan)
  fireEvent.change(pan, { target: { value: validPan } })
  expect(pan).toHaveValue('ABCPD1234E')
  fireEvent.click(screen.getByRole('button', { name: 'Verify PAN' }))
  await act(async () => {})
  expect(screen.getByText('Verifying...')).toBeInTheDocument()
  await act(() => vi.advanceTimersByTimeAsync(1500))
  expect(screen.getByText('PAN Verified')).toBeInTheDocument()

  fireEvent.change(screen.getByLabelText(/Aadhaar Number/), { target: { value: validAadhaar } })
  fireEvent.click(screen.getByRole('button', { name: 'Verify Aadhaar' }))
  await act(async () => {})
  await act(() => vi.advanceTimersByTimeAsync(1500))
  expect(screen.getByText('Aadhaar Verified')).toBeInTheDocument()
}

describe('Step 3 KYC', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders its required KYC controls', () => {
    renderStep()
    expect(screen.getByLabelText(/PAN Number/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aadhaar Number/)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /I consent/ })).not.toBeChecked()
  })

  it('rejects invalid PAN and invalid Aadhaar', async () => {
    renderStep()
    fireEvent.change(screen.getByLabelText(/PAN Number/), { target: { value: 'ABCDE1234F' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify PAN' })); await act(async () => {})
    expect(screen.getByText(/supported entity type/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Aadhaar Number/), { target: { value: '999999990018' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify Aadhaar' })); await act(async () => {})
    expect(screen.getByText(/correct checksum/)).toBeInTheDocument()
  })

  it('starts and completes both verification simulations after 1.5 seconds', async () => {
    renderStep(); await verifyBoth()
  })

  it('requires consent and blocks Continue until both identifiers are verified', async () => {
    const { onContinue } = renderStep()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ })); await act(async () => {})
    expect(screen.getByText('Aadhaar consent is required')).toBeInTheDocument()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('stores both verification flags and advances after valid KYC', async () => {
    const result = renderStep(); await verifyBoth()
    fireEvent.click(screen.getByRole('checkbox', { name: /I consent/ }))
    fireEvent.click(screen.getByRole('button', { name: /Continue/ })); await act(async () => {})
    expect(result.updateFormData).toHaveBeenCalledWith(expect.objectContaining({ panVerified: true, aadhaarVerified: true, aadhaarConsent: true }))
    expect(result.onContinue).toHaveBeenCalledOnce()
  })

  it('restores values and verified statuses, and preserves them on Back', async () => {
    const result = renderStep({ formData: { panNumber: 'ABCPD1234E', aadhaarNumber: validAadhaar, aadhaarConsent: true, panVerified: true, aadhaarVerified: true } })
    expect(screen.getByText('PAN Verified')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar Verified')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(result.updateFormData).toHaveBeenCalledWith(expect.objectContaining({ panVerified: true, aadhaarVerified: true }))
    expect(result.onBack).toHaveBeenCalledOnce()
  })
})
