import { useCallback, useEffect, useRef, useState } from 'react'
import { validateAadhaar, validatePAN } from '../utils/validators'

export default function useVerification(type, initiallyVerified = false) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(initiallyVerified)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null; setIsVerifying(false); setIsVerified(false); setError(null)
  }, [])
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
  const verify = useCallback((value) => {
    reset()
    const panResult = type.toLowerCase() === 'pan' ? validatePAN(value) : null
    const validationError = panResult ? panResult.error : (!validateAadhaar(value) ? 'Enter a valid Aadhaar number with a correct checksum' : null)
    if (validationError) { setError(validationError); return Promise.resolve(false) }
    setIsVerifying(true)
    return new Promise((resolve) => { timerRef.current = setTimeout(() => { timerRef.current = null; setIsVerifying(false); setIsVerified(true); resolve(true) }, 1500) })
  }, [reset, type])
  return { isVerifying, isVerified, error, verify, reset }
}
