import { useCallback, useEffect, useMemo, useState } from 'react'
import portfolioData from '../data/portfolio-data.json'
import CareerTimeline from './components/CareerTimeline'
import Footer from './components/Footer'
import Header from './components/Header'
import Ledger from './components/Ledger'
import {
  buildTechIndex,
  buildTimeline,
  describeFilter,
  filterProjects,
  projectIdFromHash,
  toggleFilter,
} from './utils/career'

const { personalInfo, projects } = portfolioData
const NO_FILTER = { track: null, tech: null }

function App() {
  const today = useMemo(() => new Date(), [])
  const timeline = useMemo(() => buildTimeline(projects, today), [today])
  const techIndex = useMemo(() => buildTechIndex(projects, today), [today])

  // 테마 클래스는 index.html의 스크립트가 미리 붙여 둔다
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [filter, setFilter] = useState(NO_FILTER)
  const [openIds, setOpenIds] = useState(() => new Set())
  // 같은 곳으로 다시 이동할 수 있도록 매번 새 객체를 넣는다
  const [scrollTarget, setScrollTarget] = useState(null)

  const visibleProjects = useMemo(() => filterProjects(projects, filter), [filter])
  const visibleIds = useMemo(() => new Set(visibleProjects.map((project) => project.id)), [visibleProjects])
  const filterLabel = describeFilter(filter)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    timeline.skipped.forEach(({ id, reason }) => {
      const why = reason === 'period' ? '기간을 해석할 수 없음' : '분류되는 역할이 없음'
      console.warn(`[career] ${id}: 타임라인에서 제외 (${why})`)
    })
    timeline.unclassified.forEach(({ id, roles }) => {
      console.warn(`[career] ${id}: 분류되지 않은 역할 ${roles.join(', ')}`)
    })
  }, [timeline])

  // 기록을 펼치고 그 위치로 이동한다. 걸러 보기로 숨겨져 있으면 걸러 보기를 해제한다.
  const openProject = useCallback((id) => {
    setFilter((current) =>
      filterProjects(projects, current).some((project) => project.id === id) ? current : NO_FILTER,
    )
    setOpenIds((current) => new Set(current).add(id))
    setScrollTarget({ id })
  }, [])

  useEffect(() => {
    const openFromHash = () => {
      const id = projectIdFromHash(window.location.hash, projects)
      if (id) openProject(id)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [openProject])

  useEffect(() => {
    if (scrollTarget) document.getElementById(scrollTarget.id)?.scrollIntoView({ block: 'start' })
  }, [scrollTarget])

  const toggleEntry = (id) => {
    const opening = !openIds.has(id)
    setOpenIds((current) => {
      const next = new Set(current)
      if (opening) next.add(id)
      else next.delete(id)
      return next
    })
    if (opening) window.history.replaceState(null, '', `#${id}`)
  }

  const pickFilter = (key, value) => {
    setFilter((current) => toggleFilter(current, key, value))
    setScrollTarget({ id: 'ledger' })
  }

  const clearFilter = () => setFilter(NO_FILTER)

  const toggleTheme = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // 저장할 수 없으면 이번 방문에만 적용된다
    }
    setDark(next)
  }

  return (
    <div className="min-h-screen">
      <a
        href="#ledger"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-paper focus:px-3 focus:py-2"
      >
        기록으로 건너뛰기
      </a>
      <Header personalInfo={personalInfo} dark={dark} onToggleTheme={toggleTheme} />
      <main>
        <CareerTimeline
          timeline={timeline}
          filter={filter}
          visibleIds={visibleIds}
          onToggleTrack={(trackId) => pickFilter('track', trackId)}
          onOpenProject={openProject}
        />
        <Ledger
          projects={visibleProjects}
          filterLabel={filterLabel}
          openIds={openIds}
          onToggle={toggleEntry}
          onClearFilter={clearFilter}
          onPickTech={(name) => pickFilter('tech', name)}
          today={today}
        />
        {/* Task 7에서 TechIndex를 넣는다 */}
      </main>
      <Footer personalInfo={personalInfo} />
    </div>
  )
}

export default App
