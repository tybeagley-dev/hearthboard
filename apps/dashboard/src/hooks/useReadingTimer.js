import { useState, useEffect, useCallback } from 'react'

const READING_KEY = 'fam_dash_reading_timer'

function loadReading() {
  try { return JSON.parse(localStorage.getItem(READING_KEY) ?? 'null') } catch { return null }
}

export function useReadingTimer() {
  const [timer, setTimer] = useState(loadReading)
  const [now, setNow]     = useState(Date.now)

  useEffect(() => {
    const sync = () => setTimer(loadReading())
    window.addEventListener('fam_reading_update', sync)
    return () => window.removeEventListener('fam_reading_update', sync)
  }, [])

  useEffect(() => {
    if (!timer) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer])

  const startTimer = useCallback((minutes) => {
    const data = { endTime: Date.now() + minutes * 60 * 1000 }
    localStorage.setItem(READING_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event('fam_reading_update'))
    setTimer(data)
  }, [])

  const stopTimer = useCallback(() => {
    localStorage.removeItem(READING_KEY)
    window.dispatchEvent(new Event('fam_reading_update'))
    setTimer(null)
  }, [])

  if (!timer) return { active: false, startTimer, stopTimer, minutes: 0, seconds: 0, expired: false }

  const msLeft = timer.endTime - now
  if (msLeft <= -5000) {
    stopTimer()
    return { active: false, startTimer, stopTimer, minutes: 0, seconds: 0, expired: false }
  }

  const totalSec = Math.max(0, Math.ceil(msLeft / 1000))
  return {
    active:  true,
    minutes: Math.floor(totalSec / 60),
    seconds: totalSec % 60,
    expired: msLeft <= 0,
    startTimer,
    stopTimer,
  }
}
