// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import data from '../data/portfolio-data.json'
import App from './App'
import { filterProjects, roleTracks, splitTech } from './utils/career'

const { personalInfo, projects } = data
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
  it('머리 영역에 이름, 직함, 소개 문장, 연락 링크를 보여 준다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: personalInfo.name })).toBeTruthy()
    expect(screen.getByText(personalInfo.title.split(' / ').join(', '))).toBeTruthy()
    expect(screen.getByText(personalInfo.intro)).toBeTruthy()
    const mailLinks = screen.getAllByRole('link', { name: personalInfo.email })
    expect(mailLinks[0].getAttribute('href')).toBe(`mailto:${personalInfo.email}`)
  })

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
