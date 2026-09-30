// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import data from '../data/portfolio-data.json'
import App from './App'

const { personalInfo } = data

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
