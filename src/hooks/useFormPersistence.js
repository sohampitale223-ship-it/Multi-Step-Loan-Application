import { useCallback, useEffect, useState } from 'react'
import { decryptData } from '../utils/encryption'
import { DRAFT_KEY, SCHEMA_VERSION } from './useAutoSave'

export const DRAFT_TTL = 72 * 60 * 60 * 1000

export default function useFormPersistence() {
  const [draft, setDraft] = useState(null)
  const [persistenceError, setPersistenceError] = useState(null)
  const [externalUpdate, setExternalUpdate] = useState(false)
  useEffect(() => {
    let active = true
    async function inspect() {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      try {
        const stored = JSON.parse(raw)
        if (stored.schemaVersion !== SCHEMA_VERSION || !Number.isFinite(stored.savedAt)) throw new Error('invalid')
        if (Date.now() - stored.savedAt > DRAFT_TTL) { localStorage.removeItem(DRAFT_KEY); return }
        const state = await decryptData(stored.encryptedState)
        if (!state || typeof state.formData !== 'object' || !Number.isInteger(state.currentStep)) throw new Error('invalid')
        if (active) setDraft({ state, savedAt: stored.savedAt })
      } catch {
        localStorage.removeItem(DRAFT_KEY)
        if (active) setPersistenceError("We couldn't restore the saved application. The saved data may be corrupted.")
      }
    }
    inspect()
    const onStorage = (event) => { if (event.key === DRAFT_KEY && event.newValue) setExternalUpdate(true) }
    window.addEventListener('storage', onStorage)
    return () => { active = false; window.removeEventListener('storage', onStorage) }
  }, [])
  const discardDraft = useCallback(() => { localStorage.removeItem(DRAFT_KEY); setDraft(null); setPersistenceError(null) }, [])
  const resumeDraft = useCallback(() => { const state = draft?.state || null; setDraft(null); return state }, [draft])
  return { hasSavedDraft: Boolean(draft), savedAt: draft?.savedAt, resumeDraft, discardDraft, persistenceError, externalUpdate }
}
