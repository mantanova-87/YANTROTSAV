import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../layout/Navbar'
import Footer from '../layout/Footer'
import HomeIntro from '../HomeIntro'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [introComplete, setIntroComplete] = useState(() => {
    if (!isHome || typeof window === 'undefined') {
      return true
    }

    return Boolean(sessionStorage.getItem('yantrotsav-intro-shown'))
  })

  if (isHome && !introComplete) {
    return (
      <HomeIntro
        onComplete={() => {
          sessionStorage.setItem('yantrotsav-intro-shown', 'true')
          setIntroComplete(true)
        }}
      />
    )
  }

  return (
    <>
      <Navbar />

      <Outlet />

      <Footer />
    </>
  )
}

export default MainLayout