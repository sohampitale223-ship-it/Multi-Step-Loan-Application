import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import LoanApplication from '@/pages/LoanApplication'
import NotFound from '@/pages/NotFound'
import Review from '@/pages/Review'
import Success from '@/pages/Success'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<LoanApplication />} />
          <Route path="apply" element={<LoanApplication />} />
          <Route path="review" element={<Review />} />
          <Route path="success" element={<Success />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
