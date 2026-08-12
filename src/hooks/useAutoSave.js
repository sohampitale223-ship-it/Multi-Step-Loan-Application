import { useCallback, useEffect, useRef, useState } from 'react'
import { encryptData } from '../utils/encryption'

export const DRAFT_KEY = 'loanApplicationDraft'
export const SCHEMA_VERSION = 1

export default function useAutoSave(formState, interval = 30000, enabled = true) {
  const timerRef = useRef(null)
  const latestRef = useRef(formState)
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  useEffect(() => { latestRef.current = formState }, [formState])
  const saveNow = useCallback(async () => {
    if (!enabled) return false
    setIsSaving(true); setSaveError(null)
    try {
      const savedAt = Date.now()
      const encryptedState = await encryptData(latestRef.current)
      const existing = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      if (existing?.savedAt > savedAt) return false
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt, encryptedState }))
      setLastSavedAt(savedAt)
      return true
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save draft')
      return false
    } finally { setIsSaving(false) }
  }, [enabled])
  useEffect(() => {
    if (!enabled) return undefined
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(saveNow, interval)
    return () => clearTimeout(timerRef.current)
  }, [formState, interval, enabled, saveNow])
  return { lastSavedAt, isSaving, saveError, saveNow }
}
