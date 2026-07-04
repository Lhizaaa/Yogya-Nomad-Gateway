import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Layout/Navbar'
import BottomNav from './components/Layout/BottomNav'
import Footer from './components/Layout/Footer'
import AnimatedGradientBg from './components/decorative/AnimatedGradientBg'
import ParticleBackground from './components/decorative/ParticleBackground'
import FloatingShapes from './components/decorative/FloatingShapes'
import OfflineBanner from './components/common/OfflineBanner'
import InstallBanner from './components/common/InstallBanner'
import ChatWidget from './components/Chatbot/ChatWidget'

import Home from './pages/Home'
import TouchdownPage from './pages/TouchdownPage'
import PerimeterMapPage from './pages/PerimeterMapPage'
import LocationDetailPage from './pages/LocationDetailPage'
import StarterKitPage from './pages/StarterKitPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import MySpotsPage from './pages/MySpotsPage'
import ItineraryPage from './pages/ItineraryPage'

const AdminPage = lazy(() => import('./pages/AdminPage'))

function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative z-10"
    >
      {children}
    </motion.main>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedGradientBg fixed />
      <ParticleBackground fixed count={32} />
      <FloatingShapes fixed subtle />
      <OfflineBanner />
      <Navbar />

      <div className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/touchdown" element={<Page><TouchdownPage /></Page>} />
            <Route path="/map" element={<Page><PerimeterMapPage /></Page>} />
            <Route path="/map/:id" element={<Page><LocationDetailPage /></Page>} />
            <Route path="/starter-kit" element={<Page><StarterKitPage /></Page>} />
            <Route path="/articles/:id" element={<Page><ArticleDetailPage /></Page>} />
            <Route path="/my-spots" element={<Page><MySpotsPage /></Page>} />
            <Route path="/itinerary" element={<Page><ItineraryPage /></Page>} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div className="container-app py-20 text-center text-gray-400">Loading…</div>}>
                  <Page><AdminPage /></Page>
                </Suspense>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />
      <BottomNav />
      <InstallBanner />
      <ChatWidget />
    </div>
  )
}
