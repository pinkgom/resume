// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import ImageViewer from './ImageViewer'

const IMAGES = [
  { src: 'images/projects/a.jpg', title: '첫 화면' },
  { src: 'images/projects/b.jpg', title: '둘째 화면' },
  { src: 'images/projects/c.jpg', title: '셋째 화면' },
]

const renderViewer = (props = {}) => {
  const handlers = { onChange: vi.fn(), onClose: vi.fn() }
  render(<ImageViewer images={IMAGES} index={0} {...handlers} {...props} />)
  return handlers
}

beforeEach(() => {
  // jsdom의 dialog는 showModal/close 동작이 없어 열림 상태만 흉내 낸다
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function close() {
    this.removeAttribute('open')
  })
})

afterEach(cleanup)

describe('ImageViewer', () => {
  it('열리면 이미지와 제목, 순서를 보여 준다', () => {
    renderViewer({ index: 1 })
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('img', { name: '둘째 화면' }).getAttribute('src')).toBe('images/projects/b.jpg')
    expect(screen.getByText('2 / 3')).toBeTruthy()
  })

  it('다음과 이전은 끝에서 반대쪽으로 넘어간다', () => {
    const { onChange } = renderViewer({ index: 2 })
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    expect(onChange).toHaveBeenLastCalledWith(0)
    cleanup()
    const second = renderViewer({ index: 0 })
    fireEvent.click(screen.getByRole('button', { name: '이전' }))
    expect(second.onChange).toHaveBeenLastCalledWith(2)
  })

  it('좌우 화살표 키로 넘긴다', () => {
    const { onChange } = renderViewer({ index: 1 })
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(2)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('이미지가 하나면 이전·다음 버튼과 순서를 보여 주지 않는다', () => {
    renderViewer({ images: IMAGES.slice(0, 1) })
    expect(screen.queryByRole('button', { name: '다음' })).toBeNull()
    expect(screen.queryByText('1 / 1')).toBeNull()
    expect(screen.getByRole('button', { name: '닫기' })).toBeTruthy()
  })

  it('닫기 버튼은 dialog를 닫은 뒤 onClose를 부른다', () => {
    const { onClose } = renderViewer()
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Esc로 닫을 때도 dialog.close()를 거쳐 포커스가 썸네일로 돌아가게 한다', () => {
    const { onClose } = renderViewer()
    const cancel = new Event('cancel', { cancelable: true })
    fireEvent(screen.getByRole('dialog'), cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
