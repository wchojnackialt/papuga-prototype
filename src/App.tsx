import { useState } from 'react'
import { BottomNav } from './app/BottomNav'
import { PhoneFrame } from './app/PhoneFrame'
import { TopBar } from './app/TopBar'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import type { TabId } from './config/nav.config'

// Etap 0: ekran kontrolny fundamentu (tokeny, typografia, komponenty bazowe).
// Wartości w pasku są tymczasowe; od etapu 1 pochodzą ze stanu persony.
export default function App() {
  const [tab, setTab] = useState<TabId>('path')
  const [modal, setModal] = useState(false)

  return (
    <PhoneFrame>
      <TopBar streak={412} xp={12480} hearts={2} />
      <main className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <section className="sticker rounded-md bg-coral p-4 shadow-st-lg">
          <p className="text-label-caps">Jednostka 1 · Lekcja 1</p>
          <h2 className="font-head text-h2">Podstawy</h2>
        </section>

        <section className="space-y-1">
          <p className="font-head text-display">Lekcja ukończona!</p>
          <h1 className="font-head text-h1">Zażółć gęślą jaźń</h1>
          <p className="text-body">Poproszę kawę z mlekiem. Świetnie! Twoja seria jest zagrożona 🔥</p>
          <p className="text-small text-ink-muted">Tekst pomocniczy, DM Sans 14/20</p>
        </section>

        <section className="flex flex-wrap gap-2">
          {['paper', 'surface', 'coral', 'lavender', 'lime', 'sun', 'flame', 'heart', 'locked'].map((c) => (
            <span key={c} className={`sticker h-10 w-10 rounded-sm shadow-st-sm bg-${c}`} title={c} />
          ))}
        </section>

        <section className="space-y-3">
          <Button variant="primary">Sprawdź</Button>
          <Button variant="action" onClick={() => setModal(true)}>
            Otwórz modal
          </Button>
          <Button variant="ghost">Pomiń</Button>
          <Button disabled>Zablokowane</Button>
        </section>
      </main>
      <BottomNav active={tab} onChange={setTab} />

      <Modal open={modal} onClose={() => setModal(false)} title="Skończyły Ci się serca">
        <p className="mb-5 text-body">Wróć za 4 godziny albo wybierz Papuga Plus.</p>
        <div className="space-y-3">
          <Button variant="action">Wypróbuj Papuga Plus</Button>
          <Button variant="ghost" onClick={() => setModal(false)}>
            Poczekaj 4 godziny
          </Button>
        </div>
      </Modal>
    </PhoneFrame>
  )
}
