import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)
const PREF_KEY = 'nomad_prefs'
const PLAN_KEY = 'nomad_plan'
const FAVORITES_KEY = 'nomad_favorites'
const ITINERARY_KEY = 'nomad_itinerary'

const PLAN_STEPS = ['connect', 'workspace', 'msme', 'transport', 'explore']

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export function AppProvider({ children }) {
  // { budget: 'low'|'medium'|'high', workspace: 'cafe'|'coworking' }
  const [prefs, setPrefs] = useState(() => load(PREF_KEY, null))
  // { done: { connect: bool, ... }, started: bool }
  const [plan, setPlan] = useState(() => load(PLAN_KEY, { done: {}, started: false }))
  // array of location ids
  const [favorites, setFavorites] = useState(() => load(FAVORITES_KEY, []))
  // ordered array of location ids
  const [itinerary, setItinerary] = useState(() => load(ITINERARY_KEY, []))

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)) } catch { /* ignore */ }
  }, [prefs])

  useEffect(() => {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)) } catch { /* ignore */ }
  }, [plan])

  useEffect(() => {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)) } catch { /* ignore */ }
  }, [favorites])

  useEffect(() => {
    try { localStorage.setItem(ITINERARY_KEY, JSON.stringify(itinerary)) } catch { /* ignore */ }
  }, [itinerary])

  const savePrefs = (p) => setPrefs(p)

  const toggleStep = (stepId) => {
    setPlan((prev) => ({
      ...prev,
      started: true,
      done: { ...prev.done, [stepId]: !prev.done[stepId] }
    }))
  }

  const restartPlan = () => setPlan({ done: {}, started: false })

  const isFavorite = (id) => favorites.includes(id)
  const toggleFavorite = (id) => setFavorites((prev) => (
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  ))

  const isInItinerary = (id) => itinerary.includes(id)
  const addToItinerary = (id) => setItinerary((prev) => (prev.includes(id) ? prev : [...prev, id]))
  const removeFromItinerary = (id) => setItinerary((prev) => prev.filter((x) => x !== id))
  const reorderItinerary = (newOrder) => setItinerary(newOrder)
  const moveItineraryItem = (id, dir) => setItinerary((prev) => {
    const idx = prev.indexOf(id)
    const swapWith = idx + dir
    if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev
    const next = [...prev]
    ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
    return next
  })

  const currentStepIndex = (() => {
    const idx = PLAN_STEPS.findIndex((s) => !plan.done[s])
    return idx === -1 ? PLAN_STEPS.length : idx + 1
  })()

  const completedCount = PLAN_STEPS.filter((s) => plan.done[s]).length

  return (
    <AppContext.Provider
      value={{
        prefs, savePrefs,
        plan, toggleStep, restartPlan,
        PLAN_STEPS, currentStepIndex, completedCount,
        favorites, isFavorite, toggleFavorite,
        itinerary, isInItinerary, addToItinerary, removeFromItinerary, reorderItinerary, moveItineraryItem
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
