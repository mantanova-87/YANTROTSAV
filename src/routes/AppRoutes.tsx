import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/mainlayout'
import Home from '../pages/Home'
import Events from '../pages/Events'
import OurTeam from '../pages/ourteam'
import Contact from '../pages/Contact'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/OurTeam" element={<OurTeam />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes