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
