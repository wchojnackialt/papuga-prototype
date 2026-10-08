import { Mascot } from '../components/Mascot'

/** Zaślepka zakładek, które powstają w etapie 4. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Mascot />
      <h1 className="font-head text-h1">{title}</h1>
      <p className="text-small text-ink-muted">Ten ekran powstaje w etapie 4.</p>
    </div>
  )
}
