import { Provider } from 'react-redux'
import { store } from './store'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import AuthModal from './components/auth/AuthModal'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <AuthModal />
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </Provider>
  )
}

export default App
