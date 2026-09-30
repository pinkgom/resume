import LedgerEntry from './LedgerEntry'

const Ledger = ({ projects, filterLabel, openIds, onToggle, onClearFilter, onPickTech, today }) => (
  <section id="ledger" aria-labelledby="ledger-title" className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      {/* 걸러 보기를 고르면 App이 이 제목으로 포커스를 옮긴다 */}
      <h2 id="ledger-title" tabIndex={-1} className="font-serif text-[1.75rem] font-semibold leading-[1.3]">
        기록 {projects.length}건{filterLabel ? `, ${filterLabel}` : ''}
      </h2>
      {filterLabel && (
        <button type="button" onClick={onClearFilter} className="underline underline-offset-4">
          전체 보기
        </button>
      )}
    </div>

    {projects.length === 0 ? (
      <p className="mt-6">조건에 맞는 기록이 없습니다.</p>
    ) : (
      <ol className="mt-6 border-b border-rule">
        {projects.map((project) => (
          <LedgerEntry
            key={project.id}
            project={project}
            open={openIds.has(project.id)}
            onToggle={onToggle}
            onPickTech={onPickTech}
            today={today}
          />
        ))}
      </ol>
    )}
  </section>
)

export default Ledger
