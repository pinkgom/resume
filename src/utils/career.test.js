import { describe, expect, it } from 'vitest'
import data from '../../data/portfolio-data.json'
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
