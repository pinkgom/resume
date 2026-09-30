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
