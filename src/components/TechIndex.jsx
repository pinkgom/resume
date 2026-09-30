const years = ({ firstYear, lastYear }) => {
  if (firstYear === null) return ''
  return firstYear === lastYear ? `, ${firstYear}` : `, ${firstYear}–${lastYear}`
}

const TechIndex = ({ techIndex, activeTech, onPickTech }) => {
  const activeKey = activeTech ? activeTech.toLowerCase() : null

  return (
    <section id="tech" aria-labelledby="tech-title" className="border-t border-rule">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
        <h2 id="tech-title" className="font-serif text-[1.75rem] font-semibold leading-[1.3]">
          기술 {techIndex.length}개
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          사용한 프로젝트 수와 사용한 해입니다. 누르면 그 기술을 쓴 기록만 봅니다.
        </p>
        <ul className="mt-6 columns-1 gap-x-10 sm:columns-2 lg:columns-4">
          {techIndex.map((tech) => {
            const pressed = tech.name.toLowerCase() === activeKey
            return (
              <li key={tech.name} className="break-inside-avoid">
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onPickTech(tech.name)}
                  className="flex w-full items-baseline justify-between gap-3 border-b border-rule py-1.5 text-left text-sm"
                >
                  <span className={pressed ? 'font-semibold underline underline-offset-4' : 'font-medium'}>
                    {tech.name}
                  </span>{' '}
                  <span className="shrink-0 tabular-nums text-ink-soft">
                    {tech.count}건{years(tech)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default TechIndex
