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
