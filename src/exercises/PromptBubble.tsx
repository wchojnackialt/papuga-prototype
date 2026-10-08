import { Mascot } from '../components/Mascot'

/** Zdanie do przetłumaczenia w dymku maskotki. Teksty ćwiczeń zawsze w DM Sans (DESIGN.md §3). */
export function PromptBubble({ text }: { text: string }) {
  return (
    <div className="mb-6 flex items-end gap-3">
      <Mascot size={64} />
      <p className="sticker relative rounded-md bg-surface px-4 py-3 font-body text-body shadow-st-sm" lang="pl">
        {text}
      </p>
    </div>
  )
}
