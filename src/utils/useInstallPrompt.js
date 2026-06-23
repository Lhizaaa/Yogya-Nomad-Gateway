import { useCallback, useEffect, useState } from 'react'

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredEvent(e)
    }
    const onInstalled = () => {
      setDeferredEvent(null)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return
    deferredEvent.prompt()
    await deferredEvent.userChoice
    setDeferredEvent(null)
  }, [deferredEvent])

  return { canInstall: !!deferredEvent && !installed, promptInstall }
}
