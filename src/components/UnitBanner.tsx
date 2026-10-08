// DESIGN.md §5: coral, H2, etykieta „Jednostka X · Lekcja Y”, shadow-lg. Zablokowana jednostka: locked.
export function UnitBanner({ unitNo, lessonNo, title, locked }: { unitNo: number; lessonNo: number | null; title: string; locked?: boolean }) {
  return (
    <section className={`sticker rounded-md p-4 shadow-st-lg ${locked ? 'border-dashed bg-locked text-ink-muted shadow-none' : 'bg-coral text-ink'}`}>
      <p className="text-label-caps">
        Jednostka {unitNo}
        {lessonNo !== null && ` · Lekcja ${lessonNo}`}
      </p>
      <h2 className="font-head text-h2">{title}</h2>
    </section>
  )
}
