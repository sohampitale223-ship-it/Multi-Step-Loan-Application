import { useEffect, useState } from 'react'
import pinCodeData from '../utils/pinCodeData.json'

const empty = { city: '', state: '', postOffice: '', isLoading: false, error: '' }

export default function usePinCodeLookup(pinCode) {
  const [result, setResult] = useState({ ...empty, pinCode: '' })
  useEffect(() => {
    if (!/^\d{6}$/.test(pinCode || '')) return undefined
    let active = true
    const timer = setTimeout(() => {
      if (!active) return
      const match = pinCodeData.find((item) => item.pinCode === pinCode)
      setResult(match ? { city: match.city, state: match.state, postOffice: match.postOffice, isLoading: false, error: '', pinCode } : { ...empty, error: 'PIN code not found', pinCode })
    }, 500)
    return () => { active = false; clearTimeout(timer) }
  }, [pinCode])
  if (!/^\d{6}$/.test(pinCode || '')) return empty
  return result.pinCode === pinCode ? result : { ...empty, isLoading: true }
}
