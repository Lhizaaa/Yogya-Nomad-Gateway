import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)
const PREF_KEY = 'nomad_prefs'
const PLAN_KEY = 'nomad_plan'

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

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)) } catch { /* ignore */ }
  }, [prefs])

  useEffect(() => {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)) } catch { /* ignore */ }
  }, [plan])

  const savePrefs = (p) => setPrefs(p)

  const toggleStep = (stepId) => {
    setPlan((prev) => ({
      ...prev,
      started: true,
      done: { ...prev.done, [stepId]: !prev.done[stepId] }
    }))
  }

  const restartPlan = () => setPlan({ done: {}, started: false })

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
        PLAN_STEPS, currentStepIndex, completedCount
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
