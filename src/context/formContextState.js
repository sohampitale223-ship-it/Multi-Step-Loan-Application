import { createContext, useContext } from 'react'

export const FormStateContext = createContext(null)

export function useFormContext() {
  const context = useContext(FormStateContext)
  if (!context) throw new Error('useFormContext must be used within a FormProvider')
  return context
}
