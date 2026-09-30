# 포트폴리오 리디자인(편집 타임라인) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공개 프로필 사이트 전체를 "편집 타임라인" 정체성으로 다시 만든다. 첫 화면은 역할별 5개 트랙의 경력 타임라인이고, 그 아래에 23건을 그 자리에서 펼쳐 읽는 단일 기록 목록이 온다.

**Architecture:** 데이터 가공(기간 해석, 트랙 분류, 줄 배치, 기술 색인, 걸러 보기)은 전부 `src/utils/career.js`의 순수 함수로 두고 Vitest로 검증한다. 컴포넌트는 가공된 값을 받아 그리기만 하고, 상태(걸러 보기, 펼친 기록, 테마)는 `App`이 가진다. 색과 서체는 CSS 변수로 정의해 Tailwind 이름으로 쓴다.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3.4, Vitest 2, jsdom, @testing-library/react. 애니메이션 라이브러리는 쓰지 않는다(CSS만).

**Spec:** `docs/superpowers/specs/2026-09-30-portfolio-redesign-design.md` (실행자는 이 계획과 함께 스펙을 읽는다)

## Global Constraints

- 작업 브랜치는 `redesign/edit-timeline`. `main`에 푸시하면 곧바로 공개 배포되므로 이 계획의 어떤 단계에서도 `main`에 커밋·병합·푸시하지 않는다. 원격 푸시도 하지 않는다.
- `data/portfolio-data.json`의 `projects` 구조는 바꾸지 않는다. `personalInfo.intro` 한 필드만 추가한다.
- `intro` 문안은 글자 그대로: `방송국에서 현장에서 사용되는 시스템을 설계하고 만듭니다. 2002년 통신망 관리 시스템 개발로 시작해 아키텍트와 IT 강사, 프로젝트 관리를 거쳤고, 지금은 방송에 쓰이는 AI 서비스를 연구 개발하고 있습니다.`
- 색은 스펙 4.1의 토큰만 쓴다. Tailwind 기본 색(`gray-*`, `blue-*` 등)을 쓰지 않는다. 유일한 예외는 이미지 보기 창 뒤를 어둡게 덮는 `backdrop:bg-black/70`이다. 트랙 색은 역할을 뜻할 때만 쓴다. `playhead` 색은 오늘 세로선에만 쓴다.
- 서체는 Hahmlet(이름, 섹션 제목, 프로젝트명)과 IBM Plex Sans KR(그 외 전부). 고정폭(모노) 서체 금지. 레이블을 전부 대문자로 쓰지 않는다.
- 기간, 연도, 횟수에는 `tabular-nums`를 쓴다. 본문 한 줄은 `max-w-[68ch]`.
- 카드, 그림자, 그라디언트, 배경 블러 금지. 구분은 1px `rule` 선으로만. 전부 왼쪽 정렬. 콘텐츠 최대 폭 1200px, 좌우 여백 모바일 16px / 데스크톱 32px.
- 모서리 반경: 클립 2px, 썸네일과 버튼 4px, 프로필 그림만 원형. 그 밖에는 0.
- 움직임은 페이지 로드 시 플레이헤드 이동 한 번(1.2초)뿐. `prefers-reduced-motion: reduce`면 없음. 스크롤 등장 효과, 호버 확대, 반복 애니메이션 금지.
- 대비: 본문 글자 대 배경 4.5:1 이상, 클립과 플레이헤드 대 배경 3:1 이상.
- 링크와 버튼 글자 끝에 화살표(→)를 붙이지 않는다. 아이콘만으로 된 링크를 만들지 않는다.
- 스타일은 Tailwind 유틸리티 클래스로 쓴다. 인라인 `style`은 데이터에서 계산되는 위치·크기에만 쓴다.
- 코드 주석과 화면 문구는 한국어.

## Review Focus

스펙이 직접 말하지 않지만 이 사이트를 쓰는 사람(방문자, 그리고 JSON을 고치는 본인)이 가장 부딪히기 쉬운 상황. 각 항목의 테스트는 괄호 안의 작업에 들어 있다.

1. **새 역할명을 적은 프로젝트를 추가한다** (예: `AI Engineer`). 페이지가 깨지지 않고, 그 프로젝트는 기록 목록에 나오며 타임라인에서만 빠진다. (Task 1 `buildTimeline`, Task 6 `Ledger`)
2. **기간을 조금 다르게 적는다** (`2027.1 – 진행 중`, `2026.08 - 현재`, 엔 대시). 같은 뜻이면 해석된다. 해석이 안 되면 적은 그대로 표시된다. (Task 1 `parsePeriod`, `formatPeriod`)
3. **항목이 빠졌거나 모양이 다른 프로젝트** (`images`·`links`·`nameEn`·`techStack` 없음, `description`이 문자열, 한 프로젝트 안에 같은 기술이 두 번). 펼쳐도 오류가 없고 빈 항목은 제목째 생략된다. (Task 2 `toList`, `splitTech`, `linkItems`, Task 6 `Ledger`)
4. **없는 기록이나 깨진 주소로 들어온다** (`#no_such_project`, `#%E0%A4%A`, `#ledger`). 아무것도 펼치지 않고 정상 표시된다. (Task 2 `projectIdFromHash`, Task 7 `App`)
5. **몇 년 뒤에 방문한다** (예: 2031년). 시간축이 그 해까지 늘어나고, 진행 중인 클립은 오늘까지 이어지며, 끝난 프로젝트에는 예정 빗금이 남지 않는다. (Task 1 `buildTimeline`, Task 2 `buildTechIndex`)

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/utils/career.js` (생성) | 기간 해석, 트랙 분류, 줄 배치, 타임라인 구성, 기술 색인, 걸러 보기, 링크·해시 보조 함수. React 비의존 |
| `src/utils/career.test.js` (생성) | 위 함수의 테스트 |
| `src/tokens.test.js` (생성) | `index.css` 색 토큰의 대비 기준 테스트 |
| `src/index.css` (전면 교체) | 색 토큰(CSS 변수), 기본 스타일, 타임라인 전용 클래스와 움직임 |
| `tailwind.config.js` (전면 교체) | 토큰에 Tailwind 이름 부여, 서체 |
| `index.html` (수정) | 메타 정보, 폰트, 테마 초기화 스크립트 |
| `data/portfolio-data.json` (수정) | `personalInfo.intro` 추가 |
| `src/App.jsx` (전면 교체) | 상태(걸러 보기, 펼친 기록, 테마), 해시 처리, 조립 |
| `src/App.test.jsx` (생성) | 조립된 페이지의 동작 테스트 |
| `src/components/Header.jsx` (생성) | 소개 영역 |
| `src/components/ThemeToggle.jsx` (전면 교체) | 어두운 화면 전환 버튼 |
| `src/components/Footer.jsx` (생성) | 연락 |
| `src/components/trackStyles.js` (생성) | 트랙 id → Tailwind 배경 클래스 |
| `src/components/CareerTimeline.jsx` (생성) | 타임라인 |
| `src/components/CareerTimeline.test.jsx` (생성) | 타임라인 동작 테스트 |
| `src/components/Ledger.jsx` (생성) | 기록 목록, 건수와 걸러 보기 표시 |
| `src/components/LedgerEntry.jsx` (생성) | 기록 한 행과 펼친 내용 |
| `src/components/ImageViewer.jsx` (생성) | `<dialog>` 이미지 보기 |
| `src/components/Ledger.test.jsx` (생성) | 기록 목록 동작 테스트 |
| `src/components/TechIndex.jsx` (생성) | 기술 색인 |
| 삭제 | `Hero.jsx`, `Timeline.jsx`, `Projects.jsx`, `Skills.jsx`, `Contact.jsx`, `Navigation.jsx`, `ScrollToTop.jsx` |

### 화면 확인 방법 (Task 4부터 공통으로 쓰는 명령)

프로덕션 빌드를 미리보기 서버로 띄워 캡처한다. 배포와 같은 `/resume/` 경로에서 이미지가 뜨는지도 함께 확인된다.

```bash
SHOTS="${TMPDIR:-/tmp}/resume-shots" && mkdir -p "$SHOTS"
npm run build
npx vite preview --port 4173 --strictPort   # 백그라운드로 실행. 브라우저 탭이 하나 열릴 수 있다
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "1280,900" --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/desktop-light.png"
```

`--channel chrome`은 설치된 Chrome을 쓴다. Chrome이 없다는 오류가 나면 `npx -y playwright@1 install chromium`을 한 번 실행하고 `--channel chrome`을 빼고 다시 실행한다. 캡처한 PNG는 Read 도구로 열어 눈으로 확인한다. 확인이 끝나면 미리보기 서버를 종료한다.

---

### Task 1: 테스트 환경과 기간·트랙·타임라인 로직

**Files:**
- Modify: `package.json` (devDependencies, `test` 스크립트)
- Create: `src/utils/career.js`
- Test: `src/utils/career.test.js`

**Interfaces:**
- Consumes: 없음
- Produces (모두 `src/utils/career.js`의 named export):
  - `TRACKS: Array<{ id: 'pm'|'architect'|'dev'|'ops'|'teach', label: string, keywords: string[] }>`
  - `monthIndex(date: Date): number` — `연도 * 12 + 월(0부터)`
  - `parsePeriod(period: unknown, today: Date): { start: number, end: number, ongoing: boolean } | null` — `end`는 배타적(종료 월의 다음 달)
  - `formatPeriod(period: unknown, today: Date): string`
  - `roleTracks(role: unknown): { tracks: string[], unclassified: string[] }`
  - `packLanes(clips: Array<{ start: number, end: number }>): { clips: Array<clip & { lane: number }>, laneCount: number }`
  - `buildTimeline(projects: object[], today: Date): { axisStart: number, axisEnd: number, now: number, years: number[], tracks: Array<{ id, label, laneCount: number, clips: Array<{ id, name, periodLabel, start, end, plannedFrom: number|null, lane }> }>, skipped: Array<{ id, reason: 'period'|'role' }>, unclassified: Array<{ id, roles: string[] }> }`

- [ ] **Step 1: 테스트 도구 설치와 스크립트 추가**

```bash
git checkout redesign/edit-timeline
npm install -D vitest@^2.1.9 jsdom@^25.0.1 @testing-library/react@^16.1.0 @testing-library/dom@^10.4.0
```

`package.json`의 `scripts`에 한 줄을 추가한다.

```json
"test": "vitest run",
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/utils/career.test.js`:

```js
import { describe, expect, it } from 'vitest'
import data from '../../data/portfolio-data.json'
import { buildTimeline, formatPeriod, packLanes, parsePeriod, roleTracks } from './career'

// 2026-09-30. 9월은 30일이므로 now = 24320 + 29/30
const TODAY = new Date(2026, 8, 30)
const NOW = 2026 * 12 + 8 + 29 / 30

describe('parsePeriod', () => {
  it('하이픈으로 구분한 기간을 월 단위로 해석한다', () => {
    expect(parsePeriod('2026.04 - 2028.12', TODAY)).toEqual({ start: 24315, end: 24348, ongoing: false })
  })

  it('물결표로 구분한 기간을 해석한다', () => {
    expect(parsePeriod('2024.01 ~ 2024.12', TODAY)).toEqual({ start: 24288, end: 24300, ongoing: false })
  })

  it('진행중이면 오늘이 속한 달의 다음 달을 끝으로 한다', () => {
    expect(parsePeriod('2026.08 - 진행중', TODAY)).toEqual({ start: 24319, end: 24321, ongoing: true })
  })

  it.each(['2026.08 – 진행 중', '2026.08 - 현재', '2026.8 ~ 진행중', '  2026.08-진행중  '])(
    '같은 뜻의 다른 표기 "%s"도 해석한다',
    (period) => {
      expect(parsePeriod(period, TODAY)).toEqual({ start: 24319, end: 24321, ongoing: true })
    },
  )

  it('아직 시작하지 않은 진행중 프로젝트는 시작 달 한 달로 본다', () => {
    expect(parsePeriod('2027.01 - 진행중', TODAY)).toEqual({ start: 24324, end: 24325, ongoing: true })
  })

  it.each(['미정', '', '2024.13 - 2025.01', '2025.05 - 2025.01', '2024.01', undefined, null, 2024])(
    '해석할 수 없는 값 %j은 null이다',
    (period) => {
      expect(parsePeriod(period, TODAY)).toBeNull()
    },
  )
})

describe('formatPeriod', () => {
  it('표기를 통일한다', () => {
    expect(formatPeriod('2024.01 ~ 2024.12', TODAY)).toBe('2024.01 – 2024.12')
    expect(formatPeriod('2026.8 - 진행중', TODAY)).toBe('2026.08 – 진행 중')
  })

  it('해석할 수 없으면 적힌 그대로 돌려준다', () => {
    expect(formatPeriod('미정', TODAY)).toBe('미정')
    expect(formatPeriod(undefined, TODAY)).toBe('')
  })
})

describe('roleTracks', () => {
  it('역할을 트랙으로 분류하고 표의 순서로 돌려준다', () => {
    expect(roleTracks('Fullstack Developer, Software Architect, Project Manager')).toEqual({
      tracks: ['pm', 'architect', 'dev'],
      unclassified: [],
    })
  })

  it.each([
    ['Project Leader', 'pm'],
    ['Technical Architect', 'architect'],
    ['Application Architect', 'architect'],
    ['Full Stack Developer', 'dev'],
    ['Backend Developer', 'dev'],
    ['Client Developer', 'dev'],
    ['System Developer', 'dev'],
    ['DevOps', 'ops'],
    ['Operator', 'ops'],
    ['QA', 'ops'],
    ['System Maintenance', 'ops'],
    ['IT Instructor', 'teach'],
  ])('%s은 %s 트랙이다', (role, track) => {
    expect(roleTracks(role).tracks).toEqual([track])
  })

  it('같은 트랙의 역할이 여럿이어도 한 번만 넣는다', () => {
    expect(roleTracks('DevOps, Operator, QA').tracks).toEqual(['ops'])
  })

  it('분류되지 않는 역할은 unclassified로 돌려준다', () => {
    expect(roleTracks('AI Engineer, Project Manager')).toEqual({ tracks: ['pm'], unclassified: ['AI Engineer'] })
  })

  it.each([undefined, null, ''])('역할이 %j이면 빈 결과다', (role) => {
    expect(roleTracks(role)).toEqual({ tracks: [], unclassified: [] })
  })
})

describe('packLanes', () => {
  it('겹치는 클립은 다른 줄에 놓는다', () => {
    const { clips, laneCount } = packLanes([
      { id: 'a', start: 0, end: 10 },
      { id: 'b', start: 5, end: 15 },
    ])
    expect(laneCount).toBe(2)
    expect(clips.map(({ id, lane }) => [id, lane])).toEqual([['a', 0], ['b', 1]])
  })

  it('맞닿은 클립은 같은 줄에 놓는다', () => {
    const { clips, laneCount } = packLanes([
      { id: 'b', start: 10, end: 20 },
      { id: 'a', start: 0, end: 10 },
    ])
    expect(laneCount).toBe(1)
    expect(clips.map(({ id, lane }) => [id, lane])).toEqual([['a', 0], ['b', 0]])
  })

  it('빈 배열은 줄이 없다', () => {
    expect(packLanes([])).toEqual({ clips: [], laneCount: 0 })
  })
})

describe('buildTimeline', () => {
  const FIXTURE = [
    { id: 'a', name: 'A', period: '2026.07 - 진행중', role: 'Project Manager, Fullstack Developer' },
    { id: 'b', name: 'B', period: '2026.04 - 2028.12', role: 'Project Manager' },
    { id: 'c', name: 'C', period: '2024.01 ~ 2024.12', role: 'DevOps' },
  ]
  const track = (timeline, id) => timeline.tracks.find((item) => item.id === id)
  const clip = (timeline, trackId, id) => track(timeline, trackId).clips.find((item) => item.id === id)

  it('시간축은 가장 이른 시작 해의 1월부터 가장 늦은 종료 해의 12월까지다', () => {
    const timeline = buildTimeline(FIXTURE, TODAY)
    expect(timeline.axisStart).toBe(2024 * 12)
    expect(timeline.axisEnd).toBe(2029 * 12)
    expect(timeline.years).toEqual([2024, 2025, 2026, 2027, 2028])
    expect(timeline.now).toBeCloseTo(NOW, 6)
  })

  it('트랙 다섯 개를 항상 돌려주고 빈 트랙도 한 줄을 가진다', () => {
    const timeline = buildTimeline(FIXTURE, TODAY)
    expect(timeline.tracks.map((item) => item.id)).toEqual(['pm', 'architect', 'dev', 'ops', 'teach'])
    expect(track(timeline, 'teach')).toMatchObject({ clips: [], laneCount: 1 })
  })

  it('프로젝트는 자기 역할의 모든 트랙에 클립으로 나온다', () => {
    const timeline = buildTimeline(FIXTURE, TODAY)
    expect(track(timeline, 'pm').clips.map((item) => item.id)).toEqual(['b', 'a'])
    expect(track(timeline, 'pm').laneCount).toBe(2)
    expect(track(timeline, 'dev').clips.map((item) => item.id)).toEqual(['a'])
    expect(clip(timeline, 'pm', 'a')).toMatchObject({ name: 'A', periodLabel: '2026.07 – 진행 중', lane: 1 })
  })

  it('진행 중인 클립은 오늘에서 끝나고 예정 구간이 없다', () => {
    const a = clip(buildTimeline(FIXTURE, TODAY), 'pm', 'a')
    expect(a.end).toBeCloseTo(NOW, 6)
    expect(a.plannedFrom).toBeNull()
  })

  it('종료일이 미래인 클립은 오늘 이후가 예정 구간이다', () => {
    const b = clip(buildTimeline(FIXTURE, TODAY), 'pm', 'b')
    expect(b.end).toBe(24348)
    expect(b.plannedFrom).toBeCloseTo(NOW, 6)
  })

  it('끝난 클립은 예정 구간이 없다', () => {
    expect(clip(buildTimeline(FIXTURE, TODAY), 'ops', 'c')).toMatchObject({ start: 24288, end: 24300, plannedFrom: null })
  })

  it('분류되지 않는 역할이나 해석 못 한 기간의 프로젝트는 타임라인에서만 빠진다', () => {
    const timeline = buildTimeline(
      [
        ...FIXTURE,
        { id: 'x', name: 'X', period: '2027.01 - 진행중', role: 'AI Engineer' },
        { id: 'y', name: 'Y', period: '미정', role: 'Backend Developer' },
        { id: 'z', name: 'Z' },
      ],
      TODAY,
    )
    expect(timeline.skipped).toEqual([
      { id: 'x', reason: 'role' },
      { id: 'y', reason: 'period' },
      { id: 'z', reason: 'period' },
    ])
    expect(timeline.unclassified).toEqual([{ id: 'x', roles: ['AI Engineer'] }])
    expect(timeline.tracks.flatMap((item) => item.clips).map((item) => item.id).sort()).toEqual(['a', 'a', 'b', 'c'])
  })

  it('몇 년 뒤에 보면 시간축이 그 해까지 늘고 진행 중인 클립이 오늘까지 이어진다', () => {
    const later = new Date(2031, 2, 15)
    const timeline = buildTimeline(FIXTURE, later)
    expect(timeline.axisEnd).toBe(2032 * 12)
    expect(clip(timeline, 'pm', 'a').end).toBeCloseTo(timeline.now, 6)
    expect(clip(timeline, 'pm', 'b')).toMatchObject({ end: 24348, plannedFrom: null })
  })

  it('프로젝트가 없어도 올해 한 해의 빈 시간축을 돌려준다', () => {
    const timeline = buildTimeline([], TODAY)
    expect(timeline.years).toEqual([2026])
    expect(timeline.tracks).toHaveLength(5)
  })

  it('실제 데이터의 모든 프로젝트가 타임라인에 올라간다', () => {
    const timeline = buildTimeline(data.projects, TODAY)
    expect(timeline.skipped).toEqual([])
    expect(timeline.unclassified).toEqual([])
    const onTimeline = new Set(timeline.tracks.flatMap((item) => item.clips).map((item) => item.id))
    expect(onTimeline.size).toBe(data.projects.length)
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `npm test`
Expected: FAIL. `Failed to resolve import "./career"` (파일이 아직 없음)

- [ ] **Step 4: 구현**

`src/utils/career.js`:

```js
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
```

- [ ] **Step 5: 통과 확인**

Run: `npm test`
Expected: PASS. `career.test.js`의 모든 테스트 통과

- [ ] **Step 6: 커밋**

```bash
git add package.json package-lock.json src/utils/career.js src/utils/career.test.js
git commit -m "feat: 기간 해석·트랙 분류·타임라인 구성 로직 추가"
```

---

### Task 2: 기술 색인, 걸러 보기, 보조 함수

**Files:**
- Modify: `src/utils/career.js` (파일 끝에 추가)
- Test: `src/utils/career.test.js` (파일 끝에 추가)

**Interfaces:**
- Consumes: Task 1의 `TRACKS`, `parsePeriod`, `roleTracks`
- Produces (모두 `src/utils/career.js`의 named export):
  - `toList(value: unknown): string[]` — 배열이면 비어 있지 않은 문자열만, 문자열이면 한 개짜리 배열, 그 외 `[]`
  - `splitTech(techStack: unknown): string[]` — 쉼표로 나누고, 대소문자 무시 중복 제거
  - `buildTechIndex(projects: object[], today: Date): Array<{ name: string, count: number, firstYear: number|null, lastYear: number|null }>`
  - `filterProjects(projects: object[], filter: { track: string|null, tech: string|null }): object[]`
  - `toggleFilter(filter, key: 'track'|'tech', value: string): filter` — 같은 값이면 해제
  - `describeFilter(filter): string` — 예: `'개발 트랙, NodeJs'`, 조건이 없으면 `''`
  - `linkItems(links: unknown): Array<{ label: string, url: string }>`
  - `projectIdFromHash(hash: unknown, projects: object[]): string | null`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/utils/career.test.js` 맨 위의 import 문을 아래로 바꾼다.

```js
import {
  buildTechIndex,
  buildTimeline,
  describeFilter,
  filterProjects,
  formatPeriod,
  linkItems,
  packLanes,
  parsePeriod,
  projectIdFromHash,
  roleTracks,
  splitTech,
  toList,
  toggleFilter,
} from './career'
```

파일 끝에 추가한다.

```js
describe('toList', () => {
  it('배열은 비어 있지 않은 문자열만 남긴다', () => {
    expect(toList(['가', '', '  ', '나', 3, null])).toEqual(['가', '나'])
  })

  it('문자열은 한 개짜리 목록으로 만든다', () => {
    expect(toList('한 줄 개요')).toEqual(['한 줄 개요'])
  })

  it.each([undefined, null, '', 42, {}])('%j은 빈 목록이다', (value) => {
    expect(toList(value)).toEqual([])
  })
})

describe('splitTech', () => {
  it('쉼표로 나누고 공백을 없앤다', () => {
    expect(splitTech(' NodeJs ,MySQL,  Docker')).toEqual(['NodeJs', 'MySQL', 'Docker'])
  })

  it('한 프로젝트 안에서 대소문자만 다른 중복과 빈 항목을 없앤다', () => {
    expect(splitTech('VLM, VectorDB, LLM, vlm, , ')).toEqual(['VLM', 'VectorDB', 'LLM'])
  })

  it.each([undefined, null, ''])('%j은 빈 목록이다', (value) => {
    expect(splitTech(value)).toEqual([])
  })
})

describe('buildTechIndex', () => {
  const FIXTURE = [
    { id: 'a', period: '2026.07 - 진행중', techStack: 'FastAPI, FFMPEG, LLM' },
    { id: 'b', period: '2026.04 - 2028.12', techStack: 'Python, LLM, LLM' },
    { id: 'c', period: '2014.01 ~ 2016.05', techStack: 'NodeJs, FFMpeg' },
    { id: 'd', period: '미정', techStack: 'NodeJs' },
    { id: 'e', period: '2011.01 ~ 2013.12' },
  ]

  it('사용 횟수 내림차순, 같으면 이름순으로 정렬한다', () => {
    expect(buildTechIndex(FIXTURE, TODAY).map(({ name, count }) => [name, count])).toEqual([
      ['FFMPEG', 2],
      ['LLM', 2],
      ['NodeJs', 2],
      ['FastAPI', 1],
      ['Python', 1],
    ])
  })

  it('대소문자만 다른 기술은 합치고 처음 나온 표기를 쓴다', () => {
    const ffmpeg = buildTechIndex(FIXTURE, TODAY).find((item) => item.name.toLowerCase() === 'ffmpeg')
    expect(ffmpeg).toEqual({ name: 'FFMPEG', count: 2, firstYear: 2014, lastYear: 2026 })
  })

  it('종료가 미래이거나 진행 중이면 마지막 연도는 올해다', () => {
    const index = buildTechIndex(FIXTURE, TODAY)
    expect(index.find((item) => item.name === 'Python')).toMatchObject({ firstYear: 2026, lastYear: 2026 })
    expect(index.find((item) => item.name === 'FastAPI')).toMatchObject({ firstYear: 2026, lastYear: 2026 })
  })

  it('기간을 해석하지 못한 프로젝트는 횟수에만 넣는다', () => {
    expect(buildTechIndex(FIXTURE, TODAY).find((item) => item.name === 'NodeJs')).toEqual({
      name: 'NodeJs',
      count: 2,
      firstYear: 2014,
      lastYear: 2016,
    })
    expect(buildTechIndex([{ id: 'd', period: '미정', techStack: 'Go' }], TODAY)).toEqual([
      { name: 'Go', count: 1, firstYear: null, lastYear: null },
    ])
  })

  it('몇 년 뒤에 보면 진행 중인 기술의 마지막 연도가 그 해가 된다', () => {
    const index = buildTechIndex(FIXTURE, new Date(2031, 2, 15))
    expect(index.find((item) => item.name === 'FastAPI')).toMatchObject({ firstYear: 2026, lastYear: 2031 })
    expect(index.find((item) => item.name === 'Python')).toMatchObject({ firstYear: 2026, lastYear: 2028 })
  })

  it('실제 데이터에서 같은 기술이 대소문자만 달리 두 번 나오지 않는다', () => {
    const names = buildTechIndex(data.projects, TODAY).map((item) => item.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('filterProjects', () => {
  const FIXTURE = [
    { id: 'a', role: 'Project Manager, Fullstack Developer', techStack: 'FastAPI, LLM' },
    { id: 'b', role: 'Project Manager', techStack: 'Python, LLM' },
    { id: 'c', role: 'DevOps', techStack: 'NodeJs' },
    { id: 'd' },
  ]
  const ids = (filter) => filterProjects(FIXTURE, filter).map((project) => project.id)

  it('조건이 없으면 전부 돌려준다', () => {
    expect(ids({ track: null, tech: null })).toEqual(['a', 'b', 'c', 'd'])
  })

  it('트랙으로 거른다', () => {
    expect(ids({ track: 'pm', tech: null })).toEqual(['a', 'b'])
  })

  it('기술로 거르며 대소문자를 무시한다', () => {
    expect(ids({ track: null, tech: 'llm' })).toEqual(['a', 'b'])
  })

  it('둘 다 있으면 둘 다 만족해야 한다', () => {
    expect(ids({ track: 'dev', tech: 'LLM' })).toEqual(['a'])
    expect(ids({ track: 'ops', tech: 'LLM' })).toEqual([])
  })
})

describe('toggleFilter', () => {
  it('값을 설정하고 다른 조건은 그대로 둔다', () => {
    expect(toggleFilter({ track: 'pm', tech: null }, 'tech', 'LLM')).toEqual({ track: 'pm', tech: 'LLM' })
  })

  it('같은 값을 다시 고르면 해제한다(대소문자 무시)', () => {
    expect(toggleFilter({ track: null, tech: 'FFMPEG' }, 'tech', 'FFMpeg')).toEqual({ track: null, tech: null })
    expect(toggleFilter({ track: 'dev', tech: null }, 'track', 'dev')).toEqual({ track: null, tech: null })
  })

  it('다른 값을 고르면 바꾼다', () => {
    expect(toggleFilter({ track: 'dev', tech: null }, 'track', 'pm')).toEqual({ track: 'pm', tech: null })
  })
})

describe('describeFilter', () => {
  it('조건을 사람이 읽는 말로 바꾼다', () => {
    expect(describeFilter({ track: null, tech: null })).toBe('')
    expect(describeFilter({ track: 'dev', tech: null })).toBe('개발 트랙')
    expect(describeFilter({ track: null, tech: 'NodeJs' })).toBe('NodeJs')
    expect(describeFilter({ track: 'pm', tech: 'LLM' })).toBe('PM 트랙, LLM')
  })
})

describe('linkItems', () => {
  it('키마다 이름을 붙인다', () => {
    expect(linkItems({ website: 'https://the14f.com', ios: 'https://apps.apple.com/kr/app/14f/id1' })).toEqual([
      { label: '웹사이트', url: 'https://the14f.com' },
      { label: 'iOS 앱', url: 'https://apps.apple.com/kr/app/14f/id1' },
    ])
  })

  it('배열이면 번호를 붙인다', () => {
    expect(linkItems({ blog: ['https://brunch.co.kr/@a/1', 'https://brunch.co.kr/@a/2'] })).toEqual([
      { label: '블로그 글 1', url: 'https://brunch.co.kr/@a/1' },
      { label: '블로그 글 2', url: 'https://brunch.co.kr/@a/2' },
    ])
  })

  it('모르는 키는 키 이름을 그대로 쓴다', () => {
    expect(linkItems({ github: 'https://github.com/pinkgom' })).toEqual([
      { label: 'github', url: 'https://github.com/pinkgom' },
    ])
  })

  it('http(s)가 아닌 주소와 빈 값은 버린다', () => {
    expect(linkItems({ blog: 'javascript:alert(1)', website: '', youtube: null })).toEqual([])
  })

  it.each([undefined, null, {}])('%j은 빈 목록이다', (links) => {
    expect(linkItems(links)).toEqual([])
  })
})

describe('projectIdFromHash', () => {
  const PROJECTS = [{ id: 'project_magic' }, { id: 'project_muse' }]

  it('해시가 가리키는 프로젝트 id를 돌려준다', () => {
    expect(projectIdFromHash('#project_magic', PROJECTS)).toBe('project_magic')
  })

  it.each(['', '#', '#ledger', '#no_such_project', '#%E0%A4%A', undefined, null])(
    '프로젝트가 아닌 해시 %j은 null이다',
    (hash) => {
      expect(projectIdFromHash(hash, PROJECTS)).toBeNull()
    },
  )
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL. 새로 추가한 describe 블록들이 `... is not a function`으로 실패하고 Task 1의 테스트는 통과

- [ ] **Step 3: 구현**

`src/utils/career.js` 끝에 추가한다.

```js
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
```

- [ ] **Step 4: 통과 확인**

Run: `npm test`
Expected: PASS. 전체 통과

- [ ] **Step 5: 커밋**

```bash
git add src/utils/career.js src/utils/career.test.js
git commit -m "feat: 기술 색인·걸러 보기·링크·해시 보조 함수 추가"
```

---

### Task 3: 디자인 토큰, 서체, 메타 정보, 소개 문장

**Files:**
- Modify: `src/index.css` (전면 교체)
- Modify: `tailwind.config.js` (전면 교체)
- Modify: `index.html` (전면 교체)
- Modify: `data/portfolio-data.json` (`personalInfo`에 `intro` 추가)
- Test: `src/tokens.test.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - Tailwind 색 이름: `paper`, `ink`, `ink-soft`, `rule`, `playhead`, `track-pm`, `track-architect`, `track-dev`, `track-ops`, `track-teach` (예: `bg-paper`, `text-ink-soft`, `border-rule`, `bg-track-dev`)
  - Tailwind 서체 이름: `font-sans`(IBM Plex Sans KR, 기본), `font-serif`(Hahmlet)
  - CSS 변수: `--paper`, `--ink`, `--ink-soft`, `--rule`, `--playhead`, `--track-*` (값은 `R G B` 세 숫자)
  - `<html>`의 `dark` 클래스: 페이지 로드 전에 `index.html`의 스크립트가 붙인다
  - `personalInfo.intro: string`

- [ ] **Step 1: 실패하는 대비 테스트 작성**

`src/tokens.test.js`:

```js
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

// ":root { --paper: 237 240 243; ... }" 블록에서 토큰을 읽는다
function readTokens(selector) {
  const block = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))
  if (!block) throw new Error(`${selector} 블록을 찾을 수 없습니다`)
  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)].map(([, name, r, g, b]) => [
      name,
      [Number(r), Number(g), Number(b)],
    ]),
  )
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

const TEXT = ['ink', 'ink-soft']
const MARKS = ['playhead', 'track-pm', 'track-architect', 'track-dev', 'track-ops', 'track-teach']

describe.each([
  ['라이트', ':root'],
  ['다크', '\\.dark'],
])('%s 테마 색 토큰', (_, selector) => {
  const tokens = readTokens(selector)

  it('필요한 토큰이 모두 있다', () => {
    expect(Object.keys(tokens).sort()).toEqual(['paper', 'rule', ...TEXT, ...MARKS].sort())
  })

  it.each(TEXT)('글자색 %s은 배경과 4.5:1 이상이다', (name) => {
    expect(contrast(tokens[name], tokens.paper)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(MARKS)('표시색 %s은 배경과 3:1 이상이다', (name) => {
    expect(contrast(tokens[name], tokens.paper)).toBeGreaterThanOrEqual(3)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL. `:root 블록을 찾을 수 없습니다`

- [ ] **Step 3: `src/index.css` 전면 교체**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* 색 토큰. 값은 "R G B". tailwind.config.js에서 이름을 붙인다. */
  :root {
    --paper: 237 240 243;
    --ink: 22 33 44;
    --ink-soft: 90 102 115;
    --rule: 197 205 214;
    --playhead: 226 58 46;
    --track-pm: 173 122 10;
    --track-architect: 30 142 153;
    --track-dev: 75 143 79;
    --track-ops: 168 69 138;
    --track-teach: 61 95 184;
  }

  .dark {
    --paper: 16 26 35;
    --ink: 228 234 240;
    --ink-soft: 147 161 174;
    --rule: 43 58 71;
    --playhead: 255 90 79;
    --track-pm: 224 176 64;
    --track-architect: 79 184 194;
    --track-dev: 120 184 123;
    --track-ops: 208 120 180;
    --track-teach: 124 152 230;
  }

  html {
    scroll-padding-top: 1rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }

  body {
    @apply bg-paper font-sans text-ink antialiased;
    line-height: 1.7;
  }

  :focus-visible {
    outline: 2px solid rgb(var(--ink));
    outline-offset: 2px;
  }
}
```

- [ ] **Step 4: `tailwind.config.js` 전면 교체**

```js
/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        ink: token('ink'),
        'ink-soft': token('ink-soft'),
        rule: token('rule'),
        playhead: token('playhead'),
        track: {
          pm: token('track-pm'),
          architect: token('track-architect'),
          dev: token('track-dev'),
          ops: token('track-ops'),
          teach: token('track-teach'),
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans KR"', 'system-ui', 'sans-serif'],
        serif: ['Hahmlet', 'serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: `index.html` 전면 교체**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>안경찬 | AI Engineer, Project Manager, Software Architect</title>
    <meta name="description" content="방송국에서 현장에서 사용되는 시스템을 설계하고 만듭니다. 2002년 통신망 관리 시스템 개발로 시작해 아키텍트와 IT 강사, 프로젝트 관리를 거쳤고, 지금은 방송에 쓰이는 AI 서비스를 연구 개발하고 있습니다." />
    <meta name="keywords" content="안경찬, AI Engineer, Project Manager, Software Architect, Fullstack Developer, IT Instructor, 방송, MBC" />
    <meta name="author" content="안경찬" />

    <meta property="og:title" content="안경찬 | AI Engineer, Project Manager, Software Architect" />
    <meta property="og:description" content="방송국에서 현장에서 사용되는 시스템을 설계하고 만듭니다. 2002년 통신망 관리 시스템 개발로 시작해 아키텍트와 IT 강사, 프로젝트 관리를 거쳤고, 지금은 방송에 쓰이는 AI 서비스를 연구 개발하고 있습니다." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://pinkgom.github.io/resume" />
    <meta property="og:image" content="https://pinkgom.github.io/resume/images/profile_background.jpg" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@500;600;700&family=IBM+Plex+Sans+KR:wght@400;500;600&display=swap" rel="stylesheet" />

    <!-- 화면이 그려지기 전에 테마를 정한다. 저장된 선택이 없으면 시스템 설정을 따른다. -->
    <script>
      (function () {
        var saved = null
        try {
          saved = localStorage.getItem('theme')
        } catch (error) {}
        var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        if (saved === 'dark' || (saved !== 'light' && systemDark)) {
          document.documentElement.classList.add('dark')
        }
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 소개 문장 추가**

`data/portfolio-data.json`의 `personalInfo`에서 `profileImage` 줄 뒤에 `intro`를 추가한다. 결과:

```json
        "profileImage": "images/profile_background.jpg",
        "intro": "방송국에서 현장에서 사용되는 시스템을 설계하고 만듭니다. 2002년 통신망 관리 시스템 개발로 시작해 아키텍트와 IT 강사, 프로젝트 관리를 거쳤고, 지금은 방송에 쓰이는 AI 서비스를 연구 개발하고 있습니다."
    },
```

- [ ] **Step 7: 통과 확인**

Run: `npm test`
Expected: PASS. `tokens.test.js` 포함 전체 통과

Run: `npm run build`
Expected: 빌드 성공. (기존 컴포넌트가 아직 남아 있어 화면은 어색하지만 빌드는 된다. Task 4에서 교체한다.)

- [ ] **Step 8: 커밋**

```bash
git add src/index.css src/tokens.test.js tailwind.config.js index.html data/portfolio-data.json
git commit -m "feat: 색·서체 토큰과 메타 정보, 소개 문장 추가"
```

---

### Task 4: 앱 뼈대 (Header, Footer, ThemeToggle), 기존 컴포넌트와 의존성 제거

**Files:**
- Create: `src/components/Header.jsx`, `src/components/Footer.jsx`
- Modify: `src/components/ThemeToggle.jsx` (전면 교체), `src/App.jsx` (전면 교체), `package.json`
- Delete: `src/components/Hero.jsx`, `Timeline.jsx`, `Projects.jsx`, `Skills.jsx`, `Contact.jsx`, `Navigation.jsx`, `ScrollToTop.jsx`

**Interfaces:**
- Consumes: Task 2의 `buildTechIndex`, `buildTimeline`, `describeFilter`, `filterProjects`, `projectIdFromHash`, `toggleFilter`; Task 3의 Tailwind 이름과 `personalInfo.intro`
- Produces:
  - `Header({ personalInfo, dark: boolean, onToggleTheme: () => void })`
  - `Footer({ personalInfo })` — `id="contact"`
  - `ThemeToggle({ dark: boolean, onToggle: () => void })` — 이름이 `어두운 화면`인 버튼, `aria-pressed`
  - `App` 안에서 이후 작업이 쓰는 값과 핸들러: `today: Date`, `timeline`, `techIndex`, `filter`, `visibleProjects`, `visibleIds: Set<string>`, `openIds: Set<string>`, `openProject(id)`, `toggleEntry(id)`, `pickFilter(key, value)`, `clearFilter()`
  - 섹션 id: `timeline`, `ledger`, `tech`, `contact` (Header의 이동 링크가 `#ledger`, `#tech`, `#contact`를 가리킨다)

- [ ] **Step 1: 기존 컴포넌트 삭제와 의존성 제거**

```bash
git rm src/components/Hero.jsx src/components/Timeline.jsx src/components/Projects.jsx src/components/Skills.jsx src/components/Contact.jsx src/components/Navigation.jsx src/components/ScrollToTop.jsx
npm uninstall aos @types/aos swiper react-intersection-observer framer-motion react-icons
```

- [ ] **Step 2: `src/components/ThemeToggle.jsx` 전면 교체**

```jsx
const ThemeToggle = ({ dark, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={dark}
    className={`rounded border border-rule px-2.5 py-1 text-sm ${dark ? 'bg-ink text-paper' : ''}`}
  >
    어두운 화면
  </button>
)

export default ThemeToggle
```

- [ ] **Step 3: `src/components/Header.jsx` 작성**

```jsx
import ThemeToggle from './ThemeToggle'

const SECTIONS = [
  { href: '#ledger', label: '기록' },
  { href: '#tech', label: '기술' },
  { href: '#contact', label: '연락' },
]

const LINK = 'underline underline-offset-4'

const Header = ({ personalInfo, dark, onToggleTheme }) => (
  <header className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:px-8 md:pb-14">
    <nav aria-label="섹션 이동" className="flex items-center justify-end gap-5 text-sm">
      {SECTIONS.map(({ href, label }) => (
        <a key={href} href={href} className="underline-offset-4 hover:underline">
          {label}
        </a>
      ))}
      <ThemeToggle dark={dark} onToggle={onToggleTheme} />
    </nav>

    <div className="mt-10 flex items-center gap-4 md:mt-14 md:gap-5">
      <img
        src={personalInfo.profileImage}
        alt=""
        width="56"
        height="56"
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
      <div>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1]">{personalInfo.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">{personalInfo.nameEn}</p>
      </div>
    </div>

    <p className="mt-6 font-medium">{String(personalInfo.title ?? '').split(' / ').join(', ')}</p>
    {personalInfo.intro && <p className="mt-3 max-w-[68ch]">{personalInfo.intro}</p>}

    <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
      <a href={`mailto:${personalInfo.email}`} className={LINK}>
        {personalInfo.email}
      </a>
      <a href={personalInfo.blog} target="_blank" rel="noopener noreferrer" className={LINK}>
        브런치에서 글 읽기
      </a>
    </p>
  </header>
)

export default Header
```

- [ ] **Step 4: `src/components/Footer.jsx` 작성**

```jsx
const LINK = 'underline underline-offset-4'

const Footer = ({ personalInfo }) => (
  <footer id="contact" aria-labelledby="contact-title" className="border-t border-rule">
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
      <h2 id="contact-title" className="font-serif text-[1.75rem] font-semibold leading-[1.3]">
        연락
      </h2>
      <ul className="mt-6 space-y-2">
        <li>
          <a href={`mailto:${personalInfo.email}`} className={LINK}>
            {personalInfo.email}
          </a>
        </li>
        <li>
          <a href={personalInfo.blog} target="_blank" rel="noopener noreferrer" className={LINK}>
            브런치에서 글 읽기
          </a>
        </li>
        <li className="text-ink-soft">{personalInfo.location}</li>
      </ul>
      <p className="mt-10 text-sm text-ink-soft">
        © {new Date().getFullYear()} {personalInfo.name}
      </p>
    </div>
  </footer>
)

export default Footer
```

- [ ] **Step 5: `src/App.jsx` 전면 교체**

상태와 핸들러는 이 단계에서 모두 만든다. `<main>` 안의 섹션은 Task 5~7에서 하나씩 넣는다.

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import portfolioData from '../data/portfolio-data.json'
import Footer from './components/Footer'
import Header from './components/Header'
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
      <main>{/* Task 5~7에서 CareerTimeline, Ledger, TechIndex를 넣는다 */}</main>
      <Footer personalInfo={personalInfo} />
    </div>
  )
}

export default App
```

- [ ] **Step 6: 테스트와 빌드 확인**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: 빌드 성공. 삭제한 컴포넌트나 제거한 패키지를 찾는 오류가 없어야 한다.

Run: `grep -rnE "framer-motion|react-icons|react-intersection-observer|swiper|from 'aos|aos/dist" src index.html; echo "exit $?"`
Expected: 출력 없이 `exit 1`

- [ ] **Step 7: 화면 확인**

```bash
SHOTS="${TMPDIR:-/tmp}/resume-shots" && mkdir -p "$SHOTS"
npx vite preview --port 4173 --strictPort   # 백그라운드로 실행
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "1280,900" --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t4-desktop-light.png"
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "390,844" --color-scheme dark --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t4-mobile-dark.png"
```

두 PNG를 Read 도구로 열어 확인한다.
- 이름이 명조(Hahmlet)로 크게, 그 옆에 원형 프로필 그림이 보인다. 프로필 그림이 깨지지 않았다.
- 직함이 쉼표로 이어진 한 줄, 그 아래 소개 문장, 이메일과 브런치 링크가 보인다.
- 라이트는 회청색 배경(`#EDF0F3`), 다크는 어두운 남색 배경(`#101A23`)이다.
- 맨 아래 "연락" 섹션이 보인다. 그라디언트, 그림자, 둥근 카드가 없다.

확인 후 미리보기 서버를 종료한다.

- [ ] **Step 8: 커밋**

```bash
git add -A src package.json package-lock.json
git commit -m "feat: 새 머리·연락 영역으로 앱 뼈대 교체, 기존 섹션과 애니메이션 의존성 제거"
```

---

### Task 5: 경력 타임라인 (CareerTimeline)

**Files:**
- Create: `src/components/trackStyles.js`, `src/components/CareerTimeline.jsx`
- Modify: `src/index.css` (파일 끝에 추가), `src/App.jsx`
- Test: `src/components/CareerTimeline.test.jsx`

**Interfaces:**
- Consumes: Task 1의 `buildTimeline` 반환값; Task 4 `App`의 `timeline`, `filter`, `visibleIds`, `pickFilter`, `openProject`
- Produces:
  - `TRACK_BG: Record<'pm'|'architect'|'dev'|'ops'|'teach', string>` (`src/components/trackStyles.js`) — 트랙 id → Tailwind 배경 클래스
  - `CareerTimeline({ timeline, filter: { track, tech }, visibleIds: Set<string>, onToggleTrack: (trackId) => void, onOpenProject: (projectId) => void })` — `id="timeline"`
  - CSS 클래스: `timeline-row`, `timeline-clip`, `timeline-planned`, `timeline-playhead`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/components/CareerTimeline.test.jsx`:

```jsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { buildTimeline } from '../utils/career'
import CareerTimeline from './CareerTimeline'

const TODAY = new Date(2026, 8, 30)
const PROJECTS = [
  { id: 'a', name: 'A', period: '2026.07 - 진행중', role: 'Project Manager, Fullstack Developer' },
  { id: 'b', name: 'B', period: '2026.04 - 2028.12', role: 'Project Manager' },
  { id: 'c', name: 'C', period: '2024.01 ~ 2024.12', role: 'DevOps' },
]

const renderTimeline = (props = {}) => {
  const handlers = { onToggleTrack: vi.fn(), onOpenProject: vi.fn() }
  render(
    <CareerTimeline
      timeline={buildTimeline(PROJECTS, TODAY)}
      filter={{ track: null, tech: null }}
      visibleIds={new Set(['a', 'b', 'c'])}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

afterEach(cleanup)

describe('CareerTimeline', () => {
  it('프로젝트를 역할 트랙마다 기록으로 가는 링크로 그린다', () => {
    renderTimeline()
    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'A, 2026.07 – 진행 중, PM' }).getAttribute('href')).toBe('#a')
    expect(screen.getByRole('link', { name: 'A, 2026.07 – 진행 중, 개발' })).toBeTruthy()
  })

  it('클립이 없는 트랙도 이름을 보여 준다', () => {
    renderTimeline()
    for (const label of ['PM', '아키텍트', '개발', '운영', '강의']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy()
    }
  })

  it('트랙 이름을 누르면 그 트랙 id를 넘긴다', () => {
    const { onToggleTrack } = renderTimeline()
    fireEvent.click(screen.getByRole('button', { name: '개발' }))
    expect(onToggleTrack).toHaveBeenCalledWith('dev')
  })

  it('걸러 보기 중인 트랙은 눌린 상태로 표시한다', () => {
    renderTimeline({ filter: { track: 'ops', tech: null } })
    expect(screen.getByRole('button', { name: '운영' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'PM' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('조건에 맞지 않는 클립을 흐리게 표시한다', () => {
    renderTimeline({ visibleIds: new Set(['c']) })
    expect(screen.getByRole('link', { name: 'B, 2026.04 – 2028.12, PM' }).dataset.dim).toBe('true')
    expect(screen.getByRole('link', { name: 'C, 2024.01 – 2024.12, 운영' }).dataset.dim).toBe('false')
  })

  it('클립을 누르면 그 프로젝트 id를 넘긴다', () => {
    const { onOpenProject } = renderTimeline()
    fireEvent.click(screen.getByRole('link', { name: 'B, 2026.04 – 2028.12, PM' }))
    expect(onOpenProject).toHaveBeenCalledWith('b')
  })

  it('클립에 포인터를 올리면 이름과 기간을 보여 주고 같은 프로젝트의 클립을 함께 강조한다', () => {
    renderTimeline()
    const pmClip = screen.getByRole('link', { name: 'A, 2026.07 – 진행 중, PM' })
    fireEvent.mouseEnter(pmClip)
    expect(screen.getByText('A, 2026.07 – 진행 중')).toBeTruthy()
    expect(pmClip.dataset.active).toBe('true')
    expect(screen.getByRole('link', { name: 'A, 2026.07 – 진행 중, 개발' }).dataset.active).toBe('true')
    fireEvent.mouseLeave(pmClip)
    expect(screen.queryByText('A, 2026.07 – 진행 중')).toBeNull()
  })

  it('종료일이 미래인 클립에만 예정 구간을 그린다', () => {
    renderTimeline()
    expect(screen.getByRole('link', { name: 'B, 2026.04 – 2028.12, PM' }).querySelector('.timeline-planned')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'C, 2024.01 – 2024.12, 운영' }).querySelector('.timeline-planned')).toBeNull()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL. `Failed to resolve import "./CareerTimeline"`

- [ ] **Step 3: `src/components/trackStyles.js` 작성**

```js
// Tailwind가 클래스를 찾을 수 있도록 이름을 조합하지 않고 전부 적는다.
export const TRACK_BG = {
  pm: 'bg-track-pm',
  architect: 'bg-track-architect',
  dev: 'bg-track-dev',
  ops: 'bg-track-ops',
  teach: 'bg-track-teach',
}
```

- [ ] **Step 4: `src/components/CareerTimeline.jsx` 작성**

```jsx
import { Fragment, useEffect, useRef, useState } from 'react'
import { TRACK_BG } from './trackStyles'

const LANE_HEIGHT = 16
const LANE_GAP = 4
const TRACK_PADDING = 10
const HINT = '클립을 누르면 해당 기록으로 이동합니다. 빗금은 예정된 기간입니다.'

const trackHeight = (laneCount) => laneCount * LANE_HEIGHT + (laneCount - 1) * LANE_GAP + TRACK_PADDING * 2

const CareerTimeline = ({ timeline, filter, visibleIds, onToggleTrack, onOpenProject }) => {
  const scrollerRef = useRef(null)
  const [active, setActive] = useState(null)
  const { axisStart, axisEnd, now, years, tracks } = timeline
  const span = axisEnd - axisStart
  const percent = (months) => `${(months / span) * 100}%`
  // 격자 행: 1 = 연도, 2..n+1 = 트랙, n+2 = "오늘" 글자
  const labelRow = tracks.length + 2

  // 좁은 화면에서는 최근 연도 쪽에서 시작한다
  useEffect(() => {
    const scroller = scrollerRef.current
    if (scroller) scroller.scrollLeft = scroller.scrollWidth
  }, [])

  return (
    <section id="timeline" aria-labelledby="timeline-title" className="border-y border-rule">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <h2 id="timeline-title" className="sr-only">
          경력 타임라인
        </h2>
        <div ref={scrollerRef} className="overflow-x-auto">
          <div
            className="grid min-w-[960px] grid-cols-[4.5rem_1fr]"
            style={{
              '--now': percent(now - axisStart),
              gridTemplateRows: `1.5rem repeat(${tracks.length}, auto) 1.5rem`,
            }}
          >
            {/* 연도 눈금. 클립 아래에 깔린다. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative"
              style={{ gridColumn: 2, gridRow: `1 / ${labelRow}` }}
            >
              {years.map((year) => (
                <span
                  key={year}
                  className="absolute inset-y-0 border-l border-rule"
                  style={{ left: percent(year * 12 - axisStart) }}
                >
                  {(year - years[0]) % 2 === 0 && (
                    <span className="absolute left-1 top-0 text-xs tabular-nums text-ink-soft">{year}</span>
                  )}
                </span>
              ))}
            </div>

            {/* 가로로 스크롤할 때 트랙 이름 열을 가리는 빈 칸 */}
            <div className="sticky left-0 z-10 bg-paper" style={{ gridColumn: 1, gridRow: 1 }} />
            <div className="sticky left-0 z-10 bg-paper" style={{ gridColumn: 1, gridRow: labelRow }} />

            {tracks.map((track, index) => (
              <Fragment key={track.id}>
                <button
                  type="button"
                  onClick={() => onToggleTrack(track.id)}
                  aria-pressed={filter.track === track.id}
                  className={`sticky left-0 z-10 flex items-center gap-2 border-t border-rule bg-paper pr-2 text-left text-sm ${
                    filter.track === track.id ? 'font-semibold underline underline-offset-4' : ''
                  }`}
                  style={{ gridColumn: 1, gridRow: index + 2 }}
                >
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-sm ${TRACK_BG[track.id]}`} />
                  {track.label}
                </button>
                <div
                  className="timeline-row relative border-t border-rule"
                  style={{ gridColumn: 2, gridRow: index + 2, height: trackHeight(track.laneCount) }}
                >
                  {track.clips.map((clip) => (
                    <a
                      key={clip.id}
                      href={`#${clip.id}`}
                      aria-label={`${clip.name}, ${clip.periodLabel}, ${track.label}`}
                      className={`timeline-clip ${TRACK_BG[track.id]}`}
                      data-dim={!visibleIds.has(clip.id)}
                      data-active={active?.id === clip.id}
                      style={{
                        left: percent(clip.start - axisStart),
                        width: percent(clip.end - clip.start),
                        top: TRACK_PADDING + clip.lane * (LANE_HEIGHT + LANE_GAP),
                      }}
                      onClick={() => onOpenProject(clip.id)}
                      onMouseEnter={() => setActive(clip)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(clip)}
                      onBlur={() => setActive(null)}
                    >
                      {clip.plannedFrom !== null && (
                        <span
                          className="timeline-planned"
                          style={{ width: `${((clip.end - clip.plannedFrom) / (clip.end - clip.start)) * 100}%` }}
                        />
                      )}
                    </a>
                  ))}
                </div>
              </Fragment>
            ))}

            {/* 오늘을 가리키는 플레이헤드. 클립 위에 놓인다. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative"
              style={{ gridColumn: 2, gridRow: `1 / ${labelRow + 1}` }}
            >
              <div className="timeline-playhead">
                <span className="absolute bottom-0 left-0 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                  오늘
                </span>
              </div>
            </div>
          </div>
        </div>
        <p aria-hidden="true" className="mt-3 min-h-[1.5rem] text-sm text-ink-soft">
          {active ? `${active.name}, ${active.periodLabel}` : HINT}
        </p>
      </div>
    </section>
  )
}

export default CareerTimeline
```

- [ ] **Step 5: 타임라인 스타일 추가**

`src/index.css` 끝에 추가한다.

```css
@layer components {
  .timeline-clip {
    position: absolute;
    display: block;
    height: 16px;
    min-width: 6px;
    border-radius: 2px;
  }

  .timeline-clip[data-dim='true'] {
    opacity: 0.25;
  }

  .timeline-clip[data-active='true'] {
    outline: 2px solid rgb(var(--ink));
    outline-offset: 1px;
  }

  /* 예정 구간: 배경색 빗금으로 클립 색을 덜어 낸다 */
  .timeline-planned {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    border-radius: 0 2px 2px 0;
    background-image: repeating-linear-gradient(135deg, rgb(var(--paper)) 0 2px, transparent 2px 5px);
  }

  .timeline-playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--now);
  }

  .timeline-playhead::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 1.5rem;
    left: -1px;
    width: 2px;
    background: rgb(var(--playhead));
  }
}

/* 페이지를 열 때 한 번: 플레이헤드가 시작에서 오늘까지 가고, 지나간 자리에 클립이 드러난다 */
@media (prefers-reduced-motion: no-preference) {
  .timeline-playhead {
    animation: playhead-sweep 1.2s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }

  .timeline-row {
    animation: clip-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
}

@keyframes playhead-sweep {
  from {
    left: 0;
  }
}

@keyframes clip-reveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  99% {
    clip-path: inset(0 calc(100% - var(--now)) 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

- [ ] **Step 6: `App`에 연결**

`src/App.jsx`의 import에 한 줄 추가한다.

```jsx
import CareerTimeline from './components/CareerTimeline'
```

`<main>` 줄을 아래로 바꾼다.

```jsx
      <main>
        <CareerTimeline
          timeline={timeline}
          filter={filter}
          visibleIds={visibleIds}
          onToggleTrack={(trackId) => pickFilter('track', trackId)}
          onOpenProject={openProject}
        />
        {/* Task 6~7에서 Ledger, TechIndex를 넣는다 */}
      </main>
```

- [ ] **Step 7: 통과 확인**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 8: 화면 확인**

```bash
SHOTS="${TMPDIR:-/tmp}/resume-shots" && mkdir -p "$SHOTS"
npx vite preview --port 4173 --strictPort   # 백그라운드로 실행
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "1280,900" --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t5-desktop-light.png"
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "1280,900" --color-scheme dark --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t5-desktop-dark.png"
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "390,844" --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t5-mobile-light.png"
sips -g pixelWidth "$SHOTS/t5-mobile-light.png"
```

PNG를 Read 도구로 열어 확인한다.
- 트랙 5개(PM, 아키텍트, 개발, 운영, 강의)가 위에서 아래로, 각자 다른 색의 클립으로 보인다.
- 연도 숫자가 2002부터 2년 간격으로 보이고 클립과 겹쳐 읽기 어렵지 않다.
- 빨간 세로선이 2026년 가을 위치에 있고 아래에 "오늘"이 있다.
- 2026년 이후로 이어지는 국책과제 클립(PM, 아키텍트 트랙)의 오늘 이후 구간이 빗금이다.
- 같은 트랙에서 겹치는 클립이 서로 다른 줄에 있다. 다크에서도 클립이 배경과 구분된다.
- 모바일: `sips`가 출력한 `pixelWidth`가 `390`이다(페이지가 가로로 넘치지 않음). 타임라인은 최근 연도 쪽이 보인다.

확인 후 미리보기 서버를 종료한다.

- [ ] **Step 9: 커밋**

```bash
git add src/components/trackStyles.js src/components/CareerTimeline.jsx src/components/CareerTimeline.test.jsx src/index.css src/App.jsx
git commit -m "feat: 역할별 트랙의 경력 타임라인 추가"
```

---

### Task 6: 기록 목록 (Ledger, LedgerEntry, ImageViewer)

**Files:**
- Create: `src/components/Ledger.jsx`, `src/components/LedgerEntry.jsx`, `src/components/ImageViewer.jsx`
- Modify: `src/App.jsx`
- Test: `src/components/Ledger.test.jsx`

**Interfaces:**
- Consumes: Task 1~2의 `TRACKS`, `formatPeriod`, `linkItems`, `roleTracks`, `splitTech`, `toList`; Task 5의 `TRACK_BG`; Task 4 `App`의 `visibleProjects`, `filterLabel`, `openIds`, `toggleEntry`, `clearFilter`, `pickFilter`, `today`
- Produces:
  - `Ledger({ projects: object[], filterLabel: string, openIds: Set<string>, onToggle: (id) => void, onClearFilter: () => void, onPickTech: (name) => void, today: Date })` — `id="ledger"`
  - `LedgerEntry({ project, open: boolean, onToggle: (id) => void, onPickTech: (name) => void, today: Date })` — 행의 `<li>`는 `id={project.id}`, 행 버튼은 `aria-expanded`
  - `ImageViewer({ images: Array<{ src, title }>, index: number, onChange: (index) => void, onClose: () => void })`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/components/Ledger.test.jsx`:

```jsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Ledger from './Ledger'

const TODAY = new Date(2026, 8, 30)
const FULL = {
  id: 'p_full',
  name: '전체 항목 프로젝트',
  nameEn: 'Full Project',
  period: '2024.01 ~ 2024.12',
  role: 'Project Manager, DevOps',
  description: ['개요 한 줄'],
  tasks: ['업무 한 줄'],
  techStack: 'NodeJs, MySQL',
  images: [],
  links: {},
}
const MINIMAL = { id: 'p_min', name: '최소 항목 프로젝트' }
const UNKNOWN_ROLE = { id: 'p_new', name: '새 역할 프로젝트', period: '미정', role: 'AI Engineer' }

const renderLedger = (props = {}) => {
  const handlers = { onToggle: vi.fn(), onClearFilter: vi.fn(), onPickTech: vi.fn() }
  render(
    <Ledger projects={[FULL, MINIMAL]} filterLabel="" openIds={new Set()} today={TODAY} {...handlers} {...props} />,
  )
  return handlers
}

afterEach(cleanup)

describe('Ledger', () => {
  it('건수와 접힌 행을 보여 준다', () => {
    renderLedger()
    expect(screen.getByRole('heading', { name: '기록 2건' })).toBeTruthy()
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(2)
    expect(screen.getByText('2024.01 – 2024.12')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '전체 보기' })).toBeNull()
  })

  it('행을 누르면 그 프로젝트 id를 넘긴다', () => {
    const { onToggle } = renderLedger()
    fireEvent.click(screen.getByRole('button', { name: /전체 항목 프로젝트/ }))
    expect(onToggle).toHaveBeenCalledWith('p_full')
  })

  it('펼친 행은 내용이 있는 항목만 보여 준다', () => {
    renderLedger({ openIds: new Set(['p_full']) })
    expect(screen.getByRole('button', { name: /전체 항목 프로젝트/ }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('개요 한 줄')).toBeTruthy()
    expect(screen.getByText('업무 한 줄')).toBeTruthy()
    expect(screen.getByText('기술')).toBeTruthy()
    expect(screen.queryByText('화면')).toBeNull()
    expect(screen.queryByText('링크')).toBeNull()
  })

  it('펼친 행의 기술을 누르면 그 기술 이름을 넘긴다', () => {
    const { onPickTech } = renderLedger({ openIds: new Set(['p_full']) })
    fireEvent.click(screen.getByRole('button', { name: 'NodeJs' }))
    expect(onPickTech).toHaveBeenCalledWith('NodeJs')
  })

  it('링크와 화면이 있으면 보여 준다', () => {
    const project = {
      ...FULL,
      images: [{ src: 'images/projects/a.jpg', title: '첫 화면' }],
      links: { blog: ['https://brunch.co.kr/@a/1', 'https://brunch.co.kr/@a/2'], website: 'https://example.com' },
    }
    renderLedger({ projects: [project], openIds: new Set(['p_full']) })
    expect(screen.getByRole('button', { name: '첫 화면 크게 보기' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '블로그 글 2' }).getAttribute('href')).toBe('https://brunch.co.kr/@a/2')
    expect(screen.getByRole('link', { name: '웹사이트' }).getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('불러오지 못한 이미지는 숨긴다', () => {
    const project = { ...FULL, images: [{ src: 'images/projects/missing.jpg', title: '없는 화면' }] }
    renderLedger({ projects: [project], openIds: new Set(['p_full']) })
    fireEvent.error(screen.getByRole('button', { name: '없는 화면 크게 보기' }).querySelector('img'))
    expect(screen.queryByRole('button', { name: '없는 화면 크게 보기' })).toBeNull()
    expect(screen.queryByText('화면')).toBeNull()
  })

  it('항목이 거의 없는 프로젝트도 펼칠 수 있다', () => {
    renderLedger({ openIds: new Set(['p_min']) })
    expect(screen.getByRole('button', { name: /최소 항목 프로젝트/ }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.queryByText('개요')).toBeNull()
    expect(screen.queryByText('기술')).toBeNull()
  })

  it('해석 못 한 기간은 적힌 그대로, 분류 안 되는 역할은 표시 없이 보여 준다', () => {
    renderLedger({ projects: [UNKNOWN_ROLE] })
    expect(screen.getByText('미정')).toBeTruthy()
    expect(screen.getByRole('button', { name: /새 역할 프로젝트/ })).toBeTruthy()
  })

  it('개요가 문자열이어도 보여 준다', () => {
    renderLedger({ projects: [{ ...FULL, description: '문자열 개요' }], openIds: new Set(['p_full']) })
    expect(screen.getByText('문자열 개요')).toBeTruthy()
  })

  it('걸러 보기 중이면 조건과 전체 보기 버튼을 보여 준다', () => {
    const { onClearFilter } = renderLedger({ filterLabel: '개발 트랙' })
    expect(screen.getByRole('heading', { name: '기록 2건, 개발 트랙' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '전체 보기' }))
    expect(onClearFilter).toHaveBeenCalled()
  })

  it('조건에 맞는 기록이 없으면 안내한다', () => {
    renderLedger({ projects: [], filterLabel: '강의 트랙, LLM' })
    expect(screen.getByRole('heading', { name: '기록 0건, 강의 트랙, LLM' })).toBeTruthy()
    expect(screen.getByText('조건에 맞는 기록이 없습니다.')).toBeTruthy()
    expect(screen.getByRole('button', { name: '전체 보기' })).toBeTruthy()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL. `Failed to resolve import "./Ledger"`

- [ ] **Step 3: `src/components/ImageViewer.jsx` 작성**

```jsx
import { useEffect, useRef } from 'react'

const BUTTON = 'rounded border border-rule px-3 py-1 text-sm'

const ImageViewer = ({ images, index, onChange, onClose }) => {
  const dialogRef = useRef(null)
  const image = images[index]
  const many = images.length > 1

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // close()를 먼저 불러야 브라우저가 포커스를 썸네일로 되돌린다
  const close = () => {
    dialogRef.current?.close()
    onClose()
  }

  const step = (delta) => onChange((index + delta + images.length) % images.length)

  const onKeyDown = (event) => {
    if (!many) return
    if (event.key === 'ArrowLeft') step(-1)
    if (event.key === 'ArrowRight') step(1)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={image.title}
      onCancel={onClose}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        // 바깥(어두운 영역)을 누르면 닫는다
        if (event.target === dialogRef.current) close()
      }}
      className="m-auto w-[min(64rem,92vw)] rounded bg-paper p-0 text-ink backdrop:bg-black/70"
    >
      <figure className="p-4">
        <img src={image.src} alt={image.title} className="mx-auto max-h-[70vh] w-auto max-w-full" />
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            {image.title}
            {many && (
              <span className="ml-3 tabular-nums text-ink-soft">
                {index + 1} / {images.length}
              </span>
            )}
          </span>
          <span className="flex gap-2">
            {many && (
              <>
                <button type="button" onClick={() => step(-1)} className={BUTTON}>
                  이전
                </button>
                <button type="button" onClick={() => step(1)} className={BUTTON}>
                  다음
                </button>
              </>
            )}
            <button type="button" onClick={close} className={BUTTON}>
              닫기
            </button>
          </span>
        </figcaption>
      </figure>
    </dialog>
  )
}

export default ImageViewer
```

- [ ] **Step 4: `src/components/LedgerEntry.jsx` 작성**

```jsx
import { useState } from 'react'
import { TRACKS, formatPeriod, linkItems, roleTracks, splitTech, toList } from '../utils/career'
import ImageViewer from './ImageViewer'
import { TRACK_BG } from './trackStyles'

const TRACK_LABEL = Object.fromEntries(TRACKS.map((track) => [track.id, track.label]))
const LINK = 'underline underline-offset-4'

const Detail = ({ title, children }) => (
  <div className="grid gap-y-1 md:grid-cols-[11rem_1fr] md:gap-x-6">
    <dt className="text-sm font-medium text-ink-soft">{title}</dt>
    <dd className="max-w-[68ch]">{children}</dd>
  </div>
)

const LedgerEntry = ({ project, open, onToggle, onPickTech, today }) => {
  const [failed, setFailed] = useState(() => new Set())
  const [viewing, setViewing] = useState(null)

  const panelId = `${project.id}-detail`
  const { tracks } = roleTracks(project.role)
  const description = toList(project.description)
  const tasks = toList(project.tasks)
  const techs = splitTech(project.techStack)
  const images = (Array.isArray(project.images) ? project.images : []).filter(
    (image) => image?.src && !failed.has(image.src),
  )
  const links = linkItems(project.links)

  return (
    <li id={project.id} className="border-t border-rule">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(project.id)}
          className="grid w-full grid-cols-1 gap-x-6 gap-y-1 py-4 text-left md:grid-cols-[11rem_1fr_auto] md:items-baseline"
        >
          <span className="text-sm tabular-nums text-ink-soft">{formatPeriod(project.period, today)}</span>
          <span>
            <span className="block font-serif text-xl font-semibold leading-[1.4]">{project.name}</span>
            {project.nameEn && <span className="block text-sm text-ink-soft">{project.nameEn}</span>}
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {tracks.map((trackId) => (
              <span key={trackId} className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${TRACK_BG[trackId]}`} />
                {TRACK_LABEL[trackId]}
              </span>
            ))}
          </span>
        </button>
      </h3>

      {open && (
        <dl id={panelId} className="space-y-5 pb-8">
          {description.length > 0 && (
            <Detail title="개요">
              <ul className="list-disc space-y-1 pl-5">
                {description.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Detail>
          )}
          {tasks.length > 0 && (
            <Detail title="주요 업무">
              <ul className="list-disc space-y-1 pl-5">
                {tasks.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Detail>
          )}
          {techs.length > 0 && (
            <Detail title="기술">
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {techs.map((name) => (
                  <li key={name}>
                    <button type="button" onClick={() => onPickTech(name)} className={LINK}>
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </Detail>
          )}
          {images.length > 0 && (
            <Detail title="화면">
              <ul className="flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <li key={image.src}>
                    <button type="button" onClick={() => setViewing(index)} aria-label={`${image.title} 크게 보기`}>
                      <img
                        src={image.src}
                        alt=""
                        loading="lazy"
                        onError={() => setFailed((current) => new Set(current).add(image.src))}
                        className="h-24 w-40 rounded border border-rule object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </Detail>
          )}
          {links.length > 0 && (
            <Detail title="링크">
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {links.map(({ label, url }) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </Detail>
          )}
        </dl>
      )}

      {viewing !== null && images[viewing] && (
        <ImageViewer images={images} index={viewing} onChange={setViewing} onClose={() => setViewing(null)} />
      )}
    </li>
  )
}

export default LedgerEntry
```

- [ ] **Step 5: `src/components/Ledger.jsx` 작성**

```jsx
import LedgerEntry from './LedgerEntry'

const Ledger = ({ projects, filterLabel, openIds, onToggle, onClearFilter, onPickTech, today }) => (
  <section id="ledger" aria-labelledby="ledger-title" className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 id="ledger-title" className="font-serif text-[1.75rem] font-semibold leading-[1.3]">
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
```

- [ ] **Step 6: `App`에 연결**

`src/App.jsx`의 import에 한 줄 추가한다.

```jsx
import Ledger from './components/Ledger'
```

`<main>` 안의 `{/* Task 6~7에서 Ledger, TechIndex를 넣는다 */}` 줄을 아래로 바꾼다.

```jsx
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
```

- [ ] **Step 7: 통과 확인**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 8: 화면 확인**

이미지가 있는 기록을 펼친 상태로 캡처한다(`#project_muse`는 화면 12장이 있다).

```bash
SHOTS="${TMPDIR:-/tmp}/resume-shots" && mkdir -p "$SHOTS"
npx vite preview --port 4173 --strictPort   # 백그라운드로 실행
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "1280,900" --wait-for-timeout 2000 "http://localhost:4173/resume/#project_muse" "$SHOTS/t6-desktop-light.png"
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "390,844" --color-scheme dark --wait-for-timeout 2000 "http://localhost:4173/resume/#project_magic" "$SHOTS/t6-mobile-dark.png"
sips -g pixelWidth "$SHOTS/t6-mobile-dark.png"
```

PNG를 Read 도구로 열어 확인한다.
- "기록 23건" 제목 아래 23개 행이 최신순으로, 가는 선으로만 구분되어 보인다.
- 기간 열의 숫자가 세로로 가지런하다. 프로젝트명은 명조, 그 아래 영문명은 작은 글자다.
- 행 오른쪽의 역할 표시 색이 타임라인의 트랙 색과 같다.
- 펼친 MUSE 행에 개요, 주요 업무, 기술, 화면(썸네일이 깨지지 않음)이 보인다.
- 모바일: `pixelWidth`가 `390`이고, 행이 세로로 쌓여 읽힌다. 펼친 MAGIC 행에 화면·링크 제목이 없다.

확인 후 미리보기 서버를 종료한다.

- [ ] **Step 9: 커밋**

```bash
git add src/components/Ledger.jsx src/components/LedgerEntry.jsx src/components/ImageViewer.jsx src/components/Ledger.test.jsx src/App.jsx
git commit -m "feat: 그 자리에서 펼치는 단일 기록 목록 추가"
```

---

### Task 7: 기술 색인 (TechIndex)과 페이지 통합 테스트

**Files:**
- Create: `src/components/TechIndex.jsx`
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: Task 2의 `buildTechIndex` 반환값, `filterProjects`, `roleTracks`, `splitTech`; Task 4 `App`의 `techIndex`, `filter`, `pickFilter`; Task 5~6의 컴포넌트
- Produces:
  - `TechIndex({ techIndex: Array<{ name, count, firstYear, lastYear }>, activeTech: string|null, onPickTech: (name) => void })` — `id="tech"`. 각 항목은 이름이 `"<기술명> <n>건, <연도>"`로 시작하는 버튼, `aria-pressed`

- [ ] **Step 1: 실패하는 통합 테스트 작성**

`src/App.test.jsx`:

```jsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import data from '../data/portfolio-data.json'
import App from './App'
import { filterProjects, roleTracks, splitTech } from './utils/career'

const { projects } = data
const entryButton = (id) => document.getElementById(id).querySelector('button[aria-expanded]')
const ledgerHeading = () => screen.getByRole('heading', { name: /^기록 \d+건/ }).textContent
const expandedCount = () => document.querySelectorAll('button[aria-expanded="true"]').length

beforeEach(() => {
  window.location.hash = ''
  document.documentElement.classList.remove('dark')
  localStorage.clear()
  // jsdom에는 scrollIntoView가 없다
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(cleanup)

describe('App', () => {
  it('모든 프로젝트를 접힌 행으로 보여 준다', () => {
    render(<App />)
    expect(ledgerHeading()).toBe(`기록 ${projects.length}건`)
    for (const project of projects) {
      expect(entryButton(project.id).getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('주소의 해시가 가리키는 기록을 펼친다', () => {
    window.location.hash = `#${projects[1].id}`
    render(<App />)
    expect(entryButton(projects[1].id).getAttribute('aria-expanded')).toBe('true')
    expect(expandedCount()).toBe(1)
  })

  it.each(['#no_such_project', '#%E0%A4%A', '#ledger'])('프로젝트가 아닌 해시 %s는 무시한다', (hash) => {
    window.location.hash = hash
    render(<App />)
    expect(ledgerHeading()).toBe(`기록 ${projects.length}건`)
    expect(expandedCount()).toBe(0)
  })

  it('행을 펼치면 주소 해시가 그 기록을 가리킨다', () => {
    render(<App />)
    const { id } = projects[2]
    fireEvent.click(entryButton(id))
    expect(entryButton(id).getAttribute('aria-expanded')).toBe('true')
    expect(window.location.hash).toBe(`#${id}`)
    fireEvent.click(entryButton(id))
    expect(entryButton(id).getAttribute('aria-expanded')).toBe('false')
  })

  it('트랙 이름을 누르면 그 트랙의 기록만 남고, 다시 누르면 전부 보인다', () => {
    render(<App />)
    const expected = filterProjects(projects, { track: 'dev', tech: null }).length
    fireEvent.click(screen.getByRole('button', { name: '개발' }))
    expect(ledgerHeading()).toBe(`기록 ${expected}건, 개발 트랙`)
    fireEvent.click(screen.getByRole('button', { name: '개발' }))
    expect(ledgerHeading()).toBe(`기록 ${projects.length}건`)
  })

  it('기술 색인에서 기술을 누르면 그 기술을 쓴 기록만 남는다', () => {
    render(<App />)
    const tech = splitTech(projects[0].techStack)[0]
    const expected = filterProjects(projects, { track: null, tech }).length
    fireEvent.click(screen.getByRole('button', { name: (name) => name.startsWith(`${tech} `) }))
    expect(ledgerHeading()).toBe(`기록 ${expected}건, ${tech}`)
    fireEvent.click(screen.getByRole('button', { name: '전체 보기' }))
    expect(ledgerHeading()).toBe(`기록 ${projects.length}건`)
  })

  it('걸러 보기로 숨겨진 기록을 해시로 열면 걸러 보기를 해제한다', () => {
    render(<App />)
    const hidden = projects.find((project) => !roleTracks(project.role).tracks.includes('teach'))
    fireEvent.click(screen.getByRole('button', { name: '강의' }))
    expect(document.getElementById(hidden.id)).toBeNull()
    window.location.hash = `#${hidden.id}`
    fireEvent(window, new Event('hashchange'))
    expect(ledgerHeading()).toBe(`기록 ${projects.length}건`)
    expect(entryButton(hidden.id).getAttribute('aria-expanded')).toBe('true')
  })

  it('어두운 화면 버튼은 테마를 바꾸고 선택을 저장한다', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '어두운 화면' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: '어두운 화면' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL. `기술 색인에서 기술을 누르면…` 테스트만 실패한다(색인 버튼이 아직 없어 `Unable to find an accessible element with the role "button"`). `App`의 나머지 테스트는 통과한다. 다른 테스트가 실패하면 Task 4~6의 구현을 먼저 고친다.

- [ ] **Step 3: `src/components/TechIndex.jsx` 작성**

```jsx
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
```

- [ ] **Step 4: `App`에 연결**

`src/App.jsx`의 import에 한 줄 추가한다.

```jsx
import TechIndex from './components/TechIndex'
```

`<main>` 안의 `{/* Task 7에서 TechIndex를 넣는다 */}` 줄을 아래로 바꾼다.

```jsx
        <TechIndex techIndex={techIndex} activeTech={filter.tech} onPickTech={(name) => pickFilter('tech', name)} />
```

- [ ] **Step 5: 통과 확인**

Run: `npm test`
Expected: PASS. 전체 통과

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 6: 화면 확인**

```bash
SHOTS="${TMPDIR:-/tmp}/resume-shots" && mkdir -p "$SHOTS"
npx vite preview --port 4173 --strictPort   # 백그라운드로 실행
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "1280,900" --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t7-desktop-light.png"
npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "390,844" --wait-for-timeout 2000 http://localhost:4173/resume/ "$SHOTS/t7-mobile-light.png"
sips -g pixelWidth "$SHOTS/t7-mobile-light.png"
```

PNG를 Read 도구로 열어 확인한다.
- 기록 목록 아래 "기술 81개"(데이터가 바뀌면 숫자도 달라진다) 제목과 여러 단으로 나뉜 색인이 보인다. 맨 위는 `NodeJs 9건, 2011–2026`이다.
- 횟수와 연도가 각 단의 오른쪽에 가지런히 정렬되어 있다.
- 모바일: `pixelWidth`가 `390`이고 색인이 한 단으로 보인다.

확인 후 미리보기 서버를 종료한다.

- [ ] **Step 7: 커밋**

```bash
git add src/components/TechIndex.jsx src/App.jsx src/App.test.jsx
git commit -m "feat: 자동 집계 기술 색인과 걸러 보기 연결, 페이지 통합 테스트 추가"
```

---

### Task 8: 전체 검증과 문서 갱신

**Files:**
- Modify: `README.md` (전면 교체), `CLAUDE.md`

**Interfaces:**
- Consumes: Task 1~7의 결과 전부
- Produces: 없음(검증과 문서)

- [ ] **Step 1: 테스트와 빌드 전체 실행**

Run: `npm test`
Expected: PASS. `career.test.js`, `tokens.test.js`, `CareerTimeline.test.jsx`, `Ledger.test.jsx`, `App.test.jsx` 전부 통과

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 2: 금지 항목이 남아 있지 않은지 확인**

```bash
grep -rnE "gradient|shadow|backdrop-blur|uppercase|font-mono|animate-|text-(gray|blue|purple|pink|green)-|bg-(gray|blue|purple|pink|green|white)-?" src --include=*.jsx; echo "exit $?"
```

Expected: 출력 없이 `exit 1`. 출력이 있으면 해당 클래스를 토큰 기반 클래스로 바꾸거나 지운다.

- [ ] **Step 3: 네 가지 화면 캡처**

```bash
SHOTS="${TMPDIR:-/tmp}/resume-shots" && mkdir -p "$SHOTS"
npx vite preview --port 4173 --strictPort   # 백그라운드로 실행
for size in "1280,900:desktop" "390,844:mobile"; do
  for scheme in light dark; do
    npx -y playwright@1 screenshot --channel chrome --full-page --viewport-size "${size%%:*}" --color-scheme "$scheme" --wait-for-timeout 2000 "http://localhost:4173/resume/#project_caos" "$SHOTS/final-${size##*:}-$scheme.png"
  done
done
sips -g pixelWidth "$SHOTS/final-mobile-light.png" "$SHOTS/final-mobile-dark.png"
```

네 장을 Read 도구로 열어 스펙 5절의 구성(머리, 타임라인, 기록, 기술, 연락)과 Global Constraints를 하나씩 대조한다.
- 두 모바일 캡처의 `pixelWidth`가 `390`이다.
- 펼친 CCTV 자동관제 행에 썸네일 16장이 깨지지 않고 보인다(배포 경로 `/resume/`에서 이미지가 뜬다는 확인).
- 다크에서 글자와 클립이 모두 읽힌다. 라이트·다크 모두 빨간색은 오늘 세로선에만 있다.
- 카드, 그림자, 그라디언트가 없다. 전부 왼쪽 정렬이다.

어긋난 곳이 있으면 해당 컴포넌트를 고치고 Step 1부터 다시 한다.

- [ ] **Step 4: 키보드 동작 확인**

미리보기 서버가 떠 있는 상태에서 브라우저로 `http://localhost:4173/resume/`을 열고 키보드만으로 확인한다. (브라우저를 직접 다룰 수 없는 실행 환경이면 이 단계는 본인 확인 항목으로 최종 보고에 남긴다.)
- Tab을 처음 누르면 "기록으로 건너뛰기" 링크가 보이고, Enter를 누르면 기록 섹션으로 간다.
- Tab으로 타임라인 클립에 포커스하면 외곽선이 보이고 아래 안내 줄에 이름과 기간이 나온다. Enter를 누르면 그 기록이 펼쳐진다.
- 기록 행에서 Enter나 Space로 펼치고 접는다.
- 썸네일에서 Enter로 크게 보기를 열고, 좌우 화살표로 넘기고, Esc로 닫으면 포커스가 썸네일로 돌아온다.
- 운영체제의 "동작 줄이기"를 켜고 새로고침하면 플레이헤드가 움직이지 않고 처음부터 제자리에 있다.

확인 후 미리보기 서버를 종료한다.

- [ ] **Step 5: `README.md` 전면 교체**

````markdown
# 안경찬 포트폴리오

> 2002년부터의 프로젝트를 역할별 타임라인과 기록 목록으로 보여 주는 공개 프로필 페이지

공개 주소: https://pinkgom.github.io/resume

## 구성

- **머리**: 이름, 직함, 소개, 연락 링크
- **타임라인**: 역할별 5개 트랙(PM, 아키텍트, 개발, 운영, 강의)에 프로젝트를 클립으로 올린 도표. 빨간 세로선이 오늘이고, 빗금은 예정된 기간이다. 클립을 누르면 해당 기록으로 이동한다.
- **기록**: 모든 프로젝트의 단일 목록. 행을 누르면 그 자리에서 펼쳐진다. 기록마다 주소가 있다(예: `#project_magic`).
- **기술**: 프로젝트 데이터에서 자동 집계한 색인. 기술이나 트랙 이름을 누르면 기록을 걸러 본다.
- **연락**: 이메일, 브런치, 위치

밝은 화면과 어두운 화면을 지원하고, 처음에는 시스템 설정을 따른다.

## 기술 스택

- React 18, Vite 5, Tailwind CSS 3
- Vitest, Testing Library (테스트)
- GitHub Pages (배포)

애니메이션 라이브러리는 쓰지 않는다. 움직임은 페이지를 열 때 플레이헤드가 한 번 지나가는 것뿐이고 CSS로 구현했다.

## 프로젝트 구조

```
resume/
├── data/
│   └── portfolio-data.json     # 모든 콘텐츠
├── public/images/              # 프로필, 프로젝트 화면
├── src/
│   ├── utils/
│   │   └── career.js           # 기간 해석, 트랙 분류, 타임라인 구성, 기술 색인, 걸러 보기
│   ├── components/
│   │   ├── Header.jsx          # 소개 영역
│   │   ├── CareerTimeline.jsx  # 타임라인
│   │   ├── Ledger.jsx          # 기록 목록
│   │   ├── LedgerEntry.jsx     # 기록 한 행과 펼친 내용
│   │   ├── ImageViewer.jsx     # 화면 크게 보기
│   │   ├── TechIndex.jsx       # 기술 색인
│   │   ├── Footer.jsx          # 연락
│   │   ├── ThemeToggle.jsx     # 어두운 화면 전환
│   │   └── trackStyles.js      # 트랙 색 클래스
│   ├── App.jsx                 # 상태와 조립
│   ├── main.jsx
│   └── index.css               # 색 토큰, 타임라인 스타일
├── docs/superpowers/           # 설계 스펙과 구현 계획
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## 시작하기

```bash
git clone https://github.com/pinkgom/resume.git
cd resume
npm install
npm run dev      # http://localhost:3000
```

```bash
npm test         # 테스트
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 콘텐츠 수정

모든 내용은 `data/portfolio-data.json`에 있다. 프로젝트를 추가하려면 `projects` 배열 맨 앞에 항목을 넣는다.

```json
{
    "id": "project_example",
    "name": "프로젝트 이름",
    "nameEn": "Project Name",
    "period": "2027.01 - 진행중",
    "status": "In progress",
    "role": "Project Manager, Fullstack Developer",
    "description": ["개요 한 줄"],
    "tasks": ["주요 업무 한 줄"],
    "techStack": "FastAPI, NextJs",
    "images": [{ "src": "images/projects/example.png", "title": "화면 제목" }],
    "links": { "blog": "https://...", "website": "https://..." }
}
```

- `period`는 `2024.01 ~ 2024.12` 또는 `2027.01 - 진행중` 형식으로 적는다. 다른 형식이면 기록에는 적은 그대로 나오고 타임라인에서는 빠진다.
- `role`의 각 역할은 단어로 트랙이 정해진다: Manager·Leader → PM, Architect → 아키텍트, Developer → 개발, DevOps·Operator·QA·Maintenance → 운영, Instructor → 강의. 새 단어를 쓰려면 `src/utils/career.js`의 `TRACKS`에 추가한다.
- `links`의 키는 `blog`, `website`, `youtube`, `android`, `ios`. `blog`는 배열도 된다.
- 개발 서버에서는 타임라인에 올라가지 못한 프로젝트가 콘솔 경고로 나온다.

## 디자인

- 색과 서체는 `src/index.css`의 CSS 변수와 `tailwind.config.js`에 정의되어 있다.
- 서체: Hahmlet(이름, 제목, 프로젝트명), IBM Plex Sans KR(본문)
- 트랙 색 5가지는 역할을 뜻할 때만 쓴다. 빨간색은 오늘을 가리키는 선에만 쓴다.
- 자세한 원칙은 `docs/superpowers/specs/2026-09-30-portfolio-redesign-design.md` 참조. 색을 바꾸면 `npm test`가 대비 기준(글자 4.5:1, 표시 3:1)을 검사한다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 GitHub Pages에 배포한다. 공개 사이트이므로 작업은 브랜치에서 하고 확인 후 병합한다.

## 라이선스

MIT License

## 연락

**안경찬**

- Email: joypinkgom@gmail.com
- Blog: https://brunch.co.kr/@joypinkgom
````

- [ ] **Step 6: `CLAUDE.md` 갱신**

`## Project Overview` 아래 두 줄을 아래로 바꾼다.

```markdown
This is the public profile site for Ahn Gyeong-chan, built with **React 18**, **Vite**, and **Tailwind CSS**.
It shows a 24-year career as an editing-style timeline (five role tracks) above a single expandable ledger of all projects. Light and dark themes are supported.
```

`## Tech Stack` 목록을 아래로 바꾼다.

```markdown
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Testing**: Vitest, Testing Library (jsdom)
- **Deployment**: GitHub Pages (`main` push triggers a public deploy)
```

`## Development Commands` 목록을 아래로 바꾼다.

```markdown
- **Start Dev Server**: `npm run dev` (runs on http://localhost:3000)
- **Run Tests**: `npm test`
- **Build for Production**: `npm run build`
- **Preview Build**: `npm run preview`
- **Deploy**: push to `main` (GitHub Actions). Work on a branch and merge after review.
```

`## Key Components` 목록을 아래로 바꾼다.

```markdown
- `utils/career.js`: Pure data logic (period parsing, role → track mapping, lane packing, tech index, filtering)
- `Header.jsx`: Name, titles, intro, contact links
- `CareerTimeline.jsx`: Five role tracks with project clips and a "today" playhead
- `Ledger.jsx` / `LedgerEntry.jsx`: Single project list, entries expand in place, each has a `#project_id` URL
- `ImageViewer.jsx`: Native `<dialog>` screenshot viewer
- `TechIndex.jsx`: Tech index aggregated from project data, click to filter
- `Footer.jsx`: Contact
- `ThemeToggle.jsx`: Dark screen toggle
```

`## Guidelines` 목록 끝에 아래 항목을 추가한다.

```markdown
- **Design**: Follow `docs/superpowers/specs/2026-09-30-portfolio-redesign-design.md`. Use only the color tokens in `src/index.css` (no Tailwind default colors), no cards/shadows/gradients, and no motion beyond the one-time playhead sweep.
- **Logic**: Keep data logic in `src/utils/career.js` with tests; components only render.
```

- [ ] **Step 7: 커밋**

```bash
git add README.md CLAUDE.md
git commit -m "docs: 리디자인에 맞춰 README와 CLAUDE.md 갱신"
```

- [ ] **Step 8: 완료 보고**

`main`에 병합하거나 푸시하지 않는다. 본인에게 다음을 보고하고 병합 여부를 묻는다.
- 브랜치 이름(`redesign/edit-timeline`)과 커밋 목록(`git log --oneline main..HEAD`)
- `npm test`, `npm run build` 결과
- 최종 캡처 네 장의 경로
- Step 4에서 직접 확인하지 못한 항목이 있으면 그 목록
