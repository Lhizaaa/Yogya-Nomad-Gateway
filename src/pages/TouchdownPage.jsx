import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Laptop, Coffee, Bus, Compass, Check, Wallet, RotateCcw, Play } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/common/Button'
import GlassCard from '../components/common/GlassCard'
import WeatherWidget from '../components/Home/WeatherWidget'
import CompletionCelebration from '../components/Touchdown/CompletionCelebration'
import { logEvent } from '../utils/eventLogger'

const STEP_META = {
  connect: { icon: Wifi, color: 'from-sky-500 to-blue-600' },
  workspace: { icon: Laptop, color: 'from-brand-500 to-brand-700' },
  msme: { icon: Coffee, color: 'from-amber-500 to-orange-600' },
  transport: { icon: Bus, color: 'from-emerald-500 to-teal-600' },
  explore: { icon: Compass, color: 'from-violet-500 to-purple-600' }
}

// Which preference dimension drives each step's personalized description.
const STEP_VARIANT_BY = {
  connect: 'budget',
  workspace: 'workspace',
  msme: 'budget',
  transport: 'budget',
  explore: 'budget'
}

export default function TouchdownPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { prefs, savePrefs, plan, toggleStep, restartPlan, PLAN_STEPS, currentStepIndex, completedCount } = useApp()

  // stage: 'welcome' | 'form' | 'plan'
  const [stage, setStage] = useState(prefs ? 'plan' : 'welcome')
  const [budget, setBudget] = useState(prefs?.budget || null)
  const [workspace, setWorkspace] = useState(prefs?.workspace || null)
  const [showResume, setShowResume] = useState(plan.started && completedCount > 0)
  const [toast, setToast] = useState('')

  useEffect(() => { logEvent('screen_view', 'touchdown') }, [])

  const allDone = completedCount === PLAN_STEPS.length

  // Log completion once when the final step is checked.
  useEffect(() => {
    if (allDone) logEvent('plan_completed', `${prefs?.budget || ''}/${prefs?.workspace || ''}`)
  }, [allDone, prefs])

  const shareCompletion = async () => {
    const text = t('touchdown.celebration.shareText')
    try {
      if (navigator.share) {
        await navigator.share({ title: t('brand'), text, url: window.location.origin })
        return
      }
      await navigator.clipboard.writeText(`${text} ${window.location.origin}`)
    } catch { /* ignore */ }
    setToast(t('common.copied'))
    setTimeout(() => setToast(''), 1800)
  }

  const submit = () => {
    if (!budget || !workspace) return
    savePrefs({ budget, workspace })
    logEvent('preferences_saved', `${budget}/${workspace}`)
    setStage('plan')
  }

  const progress = Math.round((completedCount / PLAN_STEPS.length) * 100)

  // Active preferences driving the personalized plan (saved prefs win, fall back to local picks)
  const planBudget = prefs?.budget || budget || 'medium'
  const planWorkspace = prefs?.workspace || workspace || 'cafe'

  const stepDesc = (id) => {
    const dim = STEP_VARIANT_BY[id]
    const variantKey = dim === 'workspace' ? planWorkspace : planBudget
    return t(`touchdown.plan.${id}.${variantKey}`, t(`touchdown.steps.${id}.desc`))
  }

  const budgetLabelKey = { low: 'budgetLow', medium: 'budgetMedium', high: 'budgetHigh' }
  const workspaceLabelKey = { cafe: 'quietCafe', coworking: 'dedicatedDesk' }

  return (
    <div className="relative">
      <section className="relative overflow-hidden py-10">
        <div className="container-app relative z-10 max-w-2xl">
          <div className="mb-5"><WeatherWidget /></div>
          <AnimatePresence mode="wait">
            {/* WELCOME */}
            {stage === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <GlassCard className="p-8 text-center">
                  <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl">
                    <Play size={28} />
                  </span>
                  <h1 className="mt-5 text-2xl font-extrabold text-gray-900 dark:text-white">{t('touchdown.welcomeTitle')}</h1>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">{t('touchdown.welcomeDesc')}</p>

                  {showResume ? (
                    <div className="mt-6 rounded-2xl bg-brand-50 dark:bg-white/5 border border-brand-200/60 dark:border-white/10 p-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{t('touchdown.resumeTitle')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('touchdown.resumeDesc', { step: currentStepIndex })}</p>
                      <div className="mt-3 flex gap-2 justify-center">
                        <Button onClick={() => setStage('plan')}>{t('touchdown.resume')}</Button>
                        <Button variant="secondary" onClick={() => { restartPlan(); setShowResume(false) }}>
                          <RotateCcw size={15} /> {t('touchdown.restart')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="mt-6" onClick={() => setStage('form')}>{t('touchdown.start')}</Button>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* FORM */}
            {stage === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <GlassCard className="p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Wallet size={18} className="text-brand-500" /> {t('touchdown.q1')}
                  </h2>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[['low', t('touchdown.budgetLow')], ['medium', t('touchdown.budgetMedium')], ['high', t('touchdown.budgetHigh')]].map(([v, label]) => (
                      <OptionPill key={v} active={budget === v} onClick={() => setBudget(v)}>{label}</OptionPill>
                    ))}
                  </div>

                  <h2 className="mt-7 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Laptop size={18} className="text-brand-500" /> {t('touchdown.q2')}
                  </h2>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[['cafe', t('touchdown.quietCafe')], ['coworking', t('touchdown.dedicatedDesk')]].map(([v, label]) => (
                      <OptionPill key={v} active={workspace === v} onClick={() => setWorkspace(v)}>{label}</OptionPill>
                    ))}
                  </div>

                  <Button className="mt-8 w-full" disabled={!budget || !workspace} onClick={submit}>
                    {t('touchdown.generate')}
                  </Button>
                </GlassCard>
              </motion.div>
            )}

            {/* PLAN */}
            {stage === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('touchdown.planTitle')}</h1>
                  <Button variant="ghost" onClick={() => { restartPlan(); setBudget(null); setWorkspace(null); savePrefs(null); setStage('welcome'); setShowResume(false) }}>
                    <RotateCcw size={15} /> {t('touchdown.restart')}
                  </Button>
                </div>

                {/* personalized profile */}
                <div className="mb-5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('touchdown.profileLabel')}:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/20 px-3 py-1 text-xs font-semibold">
                    <Wallet size={12} /> {t(`touchdown.${budgetLabelKey[planBudget]}`)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/20 px-3 py-1 text-xs font-semibold">
                    <Laptop size={12} /> {t(`touchdown.${workspaceLabelKey[planWorkspace]}`)}
                  </span>
                </div>

                {/* celebration when all steps are done */}
                <AnimatePresence>
                  {allDone && <CompletionCelebration key="celebration" onShare={shareCompletion} />}
                </AnimatePresence>

                {/* progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{t('touchdown.progress')}</span><span>{progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                  </div>
                </div>

                <ol className="space-y-3">
                  {PLAN_STEPS.map((id, i) => {
                    const meta = STEP_META[id]
                    const done = !!plan.done[id]
                    return (
                      <motion.li key={id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                        <GlassCard className="p-4 flex items-start gap-3">
                          <span className={`shrink-0 grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.color} text-white shadow`}>
                            <meta.icon size={18} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white">{t(`touchdown.steps.${id}.title`)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{stepDesc(id)}</div>
                            {id === 'connect' && (
                              <Button variant="secondary" className="mt-2 !py-1.5 !text-xs" onClick={() => navigate('/map?filter=wifi-spot')}>
                                <Wifi size={13} /> {t('touchdown.showWifi')}
                              </Button>
                            )}
                            {id === 'workspace' && (
                              <Button variant="secondary" className="mt-2 !py-1.5 !text-xs" onClick={() => navigate(`/map?filter=${planWorkspace}`)}>
                                <Laptop size={13} /> {t(`touchdown.${workspaceLabelKey[planWorkspace]}`)}
                              </Button>
                            )}
                          </div>
                          <button
                            onClick={() => toggleStep(id)}
                            aria-label="toggle step"
                            className={`shrink-0 grid place-items-center w-7 h-7 rounded-full border-2 transition-colors ${
                              done ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <AnimatePresence>
                              {done && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                                  <Check size={15} className="text-white" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </GlassCard>
                      </motion.li>
                    )
                  })}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function OptionPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold border-2 transition-all ${
        active
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300'
          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300'
      }`}
    >
      {children}
    </button>
  )
}
