import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormProvider } from '../../context/FormContext'
import { SUBMITTED_APPLICATION_KEY } from '../../utils/applicationSubmission'
import Success from '.'

const application = { applicationId: 'LOAN-2026-ABC123', submissionDate: '2026-08-15T06:30:00.000Z', applicationStatus: 'Under Review', applicationData: { fullName: 'Asha Rao', loanType: 'home', loanAmount: '2500000', loanTenure: '240', panNumber: '******1234', aadhaarNumber: '********0019' } }
const renderSuccess = (state) => render(<FormProvider><MemoryRouter initialEntries={[{ pathname: '/success', state }]}><Routes><Route path="/success" element={<Success />} /><Route path="/apply" element={<p>Application form</p>} /></Routes></MemoryRouter></FormProvider>)

describe('Success page', () => {
  beforeEach(() => localStorage.clear())
  it('renders persisted submission details, timeline, and masked identifiers', () => {
    renderSuccess({ application })
    expect(screen.getByRole('heading', { name: 'Application Submitted Successfully' })).toBeInTheDocument()
    expect(screen.getByText('LOAN-2026-ABC123')).toBeInTheDocument(); expect(screen.getByText('******1234')).toBeInTheDocument(); expect(screen.getByText('********0019')).toBeInTheDocument()
    expect(screen.getByText('Final Decision')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Download Application Summary' })).toBeInTheDocument()
  })
  it('resets only after confirmation', () => {
    localStorage.setItem(SUBMITTED_APPLICATION_KEY, JSON.stringify(application)); vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderSuccess({ application }); fireEvent.click(screen.getByRole('button', { name: 'Start New Application' }))
    expect(localStorage.getItem(SUBMITTED_APPLICATION_KEY)).toBeNull(); expect(screen.getByText('Application form')).toBeInTheDocument()
  })
  it('redirects when no submitted application exists', () => { renderSuccess(null); expect(screen.getByText('Application form')).toBeInTheDocument() })
})
