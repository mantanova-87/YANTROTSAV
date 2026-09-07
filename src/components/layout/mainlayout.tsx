import { useLocation, Outlet } from 'react-router-dom'
import { useState, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from '../layout/Navbar'
import Footer from '../layout/Footer'
import HomeIntro from '../HomeIntro'
import CyberLoader from '../common/CyberLoader'

function MainLayout() {
  const location = useLocation()

  const isHome = location.pathname === '/'

  const [introComplete, setIntroComplete] = useState(() => {
    if (!isHome || typeof window === 'undefined') {
      return true
    }

    return Boolean(sessionStorage.getItem('yantrotsav-intro-shown'))
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#050816]">
      <AnimatePresence>
        {isHome && !introComplete && (
          <HomeIntro
            key="yantrotsav-home-intro"
            onComplete={() => setIntroComplete(true)}
          />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[70vh] items-center justify-center bg-[#050816]">
              <CyberLoader variant="inline" size="sm" text="SYNCING SECTOR DATA..." />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout

