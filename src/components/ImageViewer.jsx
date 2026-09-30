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
