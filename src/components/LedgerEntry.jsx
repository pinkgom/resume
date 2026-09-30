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
                {description.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </Detail>
          )}
          {tasks.length > 0 && (
            <Detail title="주요 업무">
              <ul className="list-disc space-y-1 pl-5">
                {tasks.map((line, index) => (
                  <li key={index}>{line}</li>
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
                  <li key={`${index}-${image.src}`}>
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
                {links.map(({ label, url }, index) => (
                  <li key={index}>
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
