// 커리어 데이터를 화면에 쓰기 좋게 가공하는 순수 함수 모음.
// 시간은 모두 "월 번호"(연도 * 12 + 0부터 센 월)로 다루고, 끝은 배타적이다.

export const TRACKS = [
  { id: 'pm', label: 'PM', keywords: ['manager', 'leader'] },
  { id: 'architect', label: '아키텍트', keywords: ['architect'] },
  { id: 'dev', label: '개발', keywords: ['developer'] },
  { id: 'ops', label: '운영', keywords: ['devops', 'operator', 'qa', 'maintenance'] },
  { id: 'teach', label: '강의', keywords: ['instructor'] },
]

// "2026.08 - 진행중", "2024.01 ~ 2024.12", "2026.8 – 진행 중", "2026.08 - 현재"
const PERIOD_RE = /^\s*(\d{4})\.(\d{1,2})\s*[-~–—]\s*(?:(\d{4})\.(\d{1,2})|진행\s*중|현재)\s*$/

export const monthIndex = (date) => date.getFullYear() * 12 + date.getMonth()

export function parsePeriod(period, today) {
  if (typeof period !== 'string') return null
  const match = period.match(PERIOD_RE)
  if (!match) return null
  const startMonth = Number(match[2])
  if (startMonth < 1 || startMonth > 12) return null
  const start = Number(match[1]) * 12 + startMonth - 1
  if (match[3] === undefined) {
    return { start, end: Math.max(monthIndex(today) + 1, start + 1), ongoing: true }
  }
  const endMonth = Number(match[4])
  if (endMonth < 1 || endMonth > 12) return null
  const end = Number(match[3]) * 12 + endMonth
  if (end <= start) return null
  return { start, end, ongoing: false }
}

const formatMonth = (index) => `${Math.floor(index / 12)}.${String((index % 12) + 1).padStart(2, '0')}`

export function formatPeriod(period, today) {
  const parsed = parsePeriod(period, today)
  if (!parsed) return String(period ?? '')
  const end = parsed.ongoing ? '진행 중' : formatMonth(parsed.end - 1)
  return `${formatMonth(parsed.start)} – ${end}`
}

export function roleTracks(role) {
  const parts = String(role ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const hit = new Set()
  const unclassified = []
  for (const part of parts) {
    const lower = part.toLowerCase()
    const matched = TRACKS.filter((track) => track.keywords.some((keyword) => lower.includes(keyword)))
    if (matched.length === 0) unclassified.push(part)
    matched.forEach((track) => hit.add(track.id))
  }
  return { tracks: TRACKS.filter((track) => hit.has(track.id)).map((track) => track.id), unclassified }
}

// 시작 순으로, 앞 클립이 끝난 첫 줄에 넣는다. 맞닿은 클립(끝 = 시작)은 같은 줄.
export function packLanes(clips) {
  const laneEnds = []
  const placed = [...clips]
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .map((clip) => {
      let lane = laneEnds.findIndex((end) => end <= clip.start)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = clip.end
      return { ...clip, lane }
    })
  return { clips: placed, laneCount: laneEnds.length }
}

export function buildTimeline(projects, today) {
  const thisMonth = monthIndex(today)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const now = thisMonth + (today.getDate() - 1) / daysInMonth
  const byTrack = new Map(TRACKS.map((track) => [track.id, []]))
  const skipped = []
  const unclassified = []
  let minStart = thisMonth
  let maxEnd = thisMonth + 1

  for (const project of projects) {
    const period = parsePeriod(project.period, today)
    const roles = roleTracks(project.role)
    if (roles.unclassified.length > 0) unclassified.push({ id: project.id, roles: roles.unclassified })
    if (!period) {
      skipped.push({ id: project.id, reason: 'period' })
      continue
    }
    if (roles.tracks.length === 0) {
      skipped.push({ id: project.id, reason: 'role' })
      continue
    }
    // 진행 중인 클립은 오늘에서 끝난다. 끝이 오늘보다 뒤면 오늘 이후가 예정 구간.
    const end = period.ongoing && period.start <= now ? now : period.end
    const plannedFrom = end > now ? Math.max(period.start, now) : null
    minStart = Math.min(minStart, period.start)
    maxEnd = Math.max(maxEnd, period.end)
    for (const trackId of roles.tracks) {
      byTrack.get(trackId).push({
        id: project.id,
        name: project.name,
        periodLabel: formatPeriod(project.period, today),
        start: period.start,
        end,
        plannedFrom,
      })
    }
  }

  const axisStart = Math.floor(minStart / 12) * 12
  const axisEnd = Math.ceil(maxEnd / 12) * 12
  const years = []
  for (let year = axisStart / 12; year < axisEnd / 12; year += 1) years.push(year)
  const tracks = TRACKS.map((track) => {
    const { clips, laneCount } = packLanes(byTrack.get(track.id))
    return { id: track.id, label: track.label, clips, laneCount: Math.max(laneCount, 1) }
  })

  return { axisStart, axisEnd, now, years, tracks, skipped, unclassified }
}

export function toList(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim() !== '')
  if (typeof value === 'string' && value.trim() !== '') return [value]
  return []
}

export function splitTech(techStack) {
  const seen = new Set()
  return String(techStack ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => {
      const key = name.toLowerCase()
      if (!name || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function buildTechIndex(projects, today) {
  const thisYear = today.getFullYear()
  const byKey = new Map()
  for (const project of projects) {
    const period = parsePeriod(project.period, today)
    for (const name of splitTech(project.techStack)) {
      const key = name.toLowerCase()
      const entry = byKey.get(key) ?? { name, count: 0, firstYear: null, lastYear: null }
      entry.count += 1
      if (period) {
        const first = Math.floor(period.start / 12)
        // 종료가 미래면 올해까지만 센다
        const last = Math.max(first, Math.min(Math.floor((period.end - 1) / 12), thisYear))
        entry.firstYear = entry.firstYear === null ? first : Math.min(entry.firstYear, first)
        entry.lastYear = entry.lastYear === null ? last : Math.max(entry.lastYear, last)
      }
      byKey.set(key, entry)
    }
  }
  return [...byKey.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  )
}

export function filterProjects(projects, filter) {
  const track = filter?.track ?? null
  const techKey = filter?.tech ? filter.tech.toLowerCase() : null
  return projects.filter((project) => {
    if (track && !roleTracks(project.role).tracks.includes(track)) return false
    if (techKey && !splitTech(project.techStack).some((name) => name.toLowerCase() === techKey)) return false
    return true
  })
}

export function toggleFilter(filter, key, value) {
  const current = filter[key]
  const same = current !== null && String(current).toLowerCase() === String(value).toLowerCase()
  return { ...filter, [key]: same ? null : value }
}

export function describeFilter(filter) {
  const parts = []
  const track = TRACKS.find((item) => item.id === filter?.track)
  if (track) parts.push(`${track.label} 트랙`)
  if (filter?.tech) parts.push(filter.tech)
  return parts.join(', ')
}

const LINK_LABELS = {
  blog: '블로그 글',
  website: '웹사이트',
  youtube: 'YouTube',
  android: 'Android 앱',
  ios: 'iOS 앱',
}

export function linkItems(links) {
  const items = []
  for (const [key, value] of Object.entries(links ?? {})) {
    const label = LINK_LABELS[key] ?? key
    const urls = (Array.isArray(value) ? value : [value]).filter(
      (url) => typeof url === 'string' && /^https?:\/\//.test(url),
    )
    urls.forEach((url, index) => {
      items.push({ label: urls.length > 1 ? `${label} ${index + 1}` : label, url })
    })
  }
  return items
}

export function projectIdFromHash(hash, projects) {
  let id
  try {
    id = decodeURIComponent(String(hash ?? '').replace(/^#/, ''))
  } catch {
    return null
  }
  return projects.some((project) => project.id === id) ? id : null
}
