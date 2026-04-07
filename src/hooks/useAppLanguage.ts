import React from 'react'

export type AppLanguage = 'vi' | 'en'

const STORAGE_KEY = 'app-language'
const CHANGE_EVENT = 'app-language-changed'

function readLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'vi'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === 'en' ? 'en' : 'vi'
}

function emitLanguageChange(lang: AppLanguage): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<AppLanguage>(CHANGE_EVENT, { detail: lang }))
}

export function setAppLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, lang)
  emitLanguageChange(lang)
}

export function useAppLanguage() {
  const [lang, setLangState] = React.useState<AppLanguage>(() => readLanguage())

  React.useEffect(() => {
    const updateFromStorage = () => {
      setLangState(readLanguage())
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) updateFromStorage()
    }

    const onCustom = () => {
      updateFromStorage()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(CHANGE_EVENT, onCustom)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(CHANGE_EVENT, onCustom)
    }
  }, [])

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  const setLang = React.useCallback((next: AppLanguage) => {
    setAppLanguage(next)
    setLangState(next)
  }, [])

  return { lang, setLang, isVietnamese: lang === 'vi' }
}
