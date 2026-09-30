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
