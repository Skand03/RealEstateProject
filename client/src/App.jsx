import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getMe } from './features/auth/authSlice'
import AppRoutes from './routes/AppRoutes'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('hh_token')
    if (token) dispatch(getMe())
  }, [dispatch])

  return <AppRoutes />
}

export default App
