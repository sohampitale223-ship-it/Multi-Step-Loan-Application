import { useMemo, useState } from 'react'
import { FormStateContext } from './formContextState'

export function FormProvider({ children }) {
  const [formData, setFormData] = useState({})
  const updateFormData = (values) => setFormData((current) => ({ ...current, ...values }))
  const value = useMemo(() => ({ formData, updateFormData }), [formData])
  return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>
}

export default FormProvider
