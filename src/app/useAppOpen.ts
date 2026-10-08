import { useEffect } from 'react'
import { useStore } from '../engine/store'

/** Zdarzenie `app_opened` i reguły otwarcia (seria, serca, tydzień ligi) raz na uruchomienie. */
let opened = false
export function useAppOpen() {
  useEffect(() => {
    if (opened) return // StrictMode w dev montuje efekt dwa razy
    opened = true
    useStore.getState().appOpened()
  }, [])
}
