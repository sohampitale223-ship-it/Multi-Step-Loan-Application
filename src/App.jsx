import AppRoutes from './routes/AppRoutes'
import { FormProvider } from './context/FormContext'

function App() {
  return <FormProvider><AppRoutes /></FormProvider>
}

export default App
