import { Provider } from 'react-redux'
import { store } from './store'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import AuthModal from './components/auth/AuthModal'

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <AuthModal />
      </AuthProvider>
    </Provider>
  )
}

export default App
