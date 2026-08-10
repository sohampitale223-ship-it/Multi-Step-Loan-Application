import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import usePinCodeLookup from './usePinCodeLookup'

describe('usePinCodeLookup', () => {
  afterEach(() => vi.useRealTimers())

  it('waits for exactly six numeric digits', () => {
    const { result } = renderHook(() => usePinCodeLookup('40000'))
    expect(result.current).toMatchObject({ city: '', isLoading: false, error: '' })
  })

  it('returns a known address after the simulated delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePinCodeLookup('400001'))
    expect(result.current.isLoading).toBe(true)
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toMatchObject({ city: 'Mumbai', state: 'Maharashtra', postOffice: 'Mumbai GPO', isLoading: false })
  })

  it('recognizes the Shahapur PIN used in the address form', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePinCodeLookup('421601'))
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toMatchObject({ city: 'Shahapur', state: 'Maharashtra', postOffice: 'Shahapur (Thane) SO', error: '' })
  })

  it('reports an unknown PIN code', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePinCodeLookup('999999'))
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.error).toBe('PIN code not found')
  })

  it('does not apply a stale result after the PIN changes', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ pin }) => usePinCodeLookup(pin), { initialProps: { pin: '400001' } })
    rerender({ pin: '560001' })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toMatchObject({ city: 'Bengaluru', state: 'Karnataka' })
  })
})
