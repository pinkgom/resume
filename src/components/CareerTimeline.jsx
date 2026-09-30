import { Fragment, useEffect, useRef, useState } from 'react'
import { TRACK_BG } from './trackStyles'

const LANE_HEIGHT = 16
const LANE_GAP = 4
const TRACK_PADDING = 10
const HINT = '클립을 누르면 해당 기록으로 이동합니다. 빗금은 예정된 기간입니다.'

const trackHeight = (laneCount) => laneCount * LANE_HEIGHT + (laneCount - 1) * LANE_GAP + TRACK_PADDING * 2

const CareerTimeline = ({ timeline, filter, visibleIds, onToggleTrack, onOpenProject }) => {
  const scrollerRef = useRef(null)
  const [active, setActive] = useState(null)
  const { axisStart, axisEnd, now, years, tracks } = timeline
  const span = axisEnd - axisStart
  const percent = (months) => `${(months / span) * 100}%`
  // 격자 행: 1 = 연도, 2..n+1 = 트랙, n+2 = "오늘" 글자
  const labelRow = tracks.length + 2

  // 좁은 화면에서는 최근 연도 쪽에서 시작한다
  useEffect(() => {
    const scroller = scrollerRef.current
    if (scroller) scroller.scrollLeft = scroller.scrollWidth
  }, [])

  return (
    <section id="timeline" aria-labelledby="timeline-title" className="border-y border-rule">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <h2 id="timeline-title" className="sr-only">
          경력 타임라인
        </h2>
        <div ref={scrollerRef} className="overflow-x-auto">
          <div
            className="grid min-w-[960px] grid-cols-[4.5rem_1fr]"
            style={{
              '--now': percent(now - axisStart),
              gridTemplateRows: `1.5rem repeat(${tracks.length}, auto) 1.5rem`,
            }}
          >
            {/* 연도 눈금. 클립 아래에 깔린다. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative"
              style={{ gridColumn: 2, gridRow: `1 / ${labelRow}` }}
            >
              {years.map((year) => (
                <span
                  key={year}
                  className="absolute inset-y-0 border-l border-rule"
                  style={{ left: percent(year * 12 - axisStart) }}
                >
                  {(year - years[0]) % 2 === 0 && (
                    <span className="absolute left-1 top-0 text-xs tabular-nums text-ink-soft">{year}</span>
                  )}
                </span>
              ))}
            </div>

            {/* 가로로 스크롤할 때 트랙 이름 열을 가리는 빈 칸 */}
            <div className="sticky left-0 z-10 bg-paper" style={{ gridColumn: 1, gridRow: 1 }} />
            <div className="sticky left-0 z-10 bg-paper" style={{ gridColumn: 1, gridRow: labelRow }} />

            {tracks.map((track, index) => (
              <Fragment key={track.id}>
                <button
                  type="button"
                  onClick={() => onToggleTrack(track.id)}
                  aria-pressed={filter.track === track.id}
                  className={`sticky left-0 z-10 flex items-center gap-2 border-t border-rule bg-paper pr-2 text-left text-sm ${
                    filter.track === track.id ? 'font-semibold underline underline-offset-4' : ''
                  }`}
                  style={{ gridColumn: 1, gridRow: index + 2 }}
                >
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-sm ${TRACK_BG[track.id]}`} />
                  {track.label}
                </button>
                <div
                  className="timeline-row relative border-t border-rule"
                  style={{ gridColumn: 2, gridRow: index + 2, height: trackHeight(track.laneCount) }}
                >
                  {track.clips.map((clip) => (
                    <a
                      key={clip.id}
                      href={`#${clip.id}`}
                      aria-label={`${clip.name}, ${clip.periodLabel}, ${track.label}`}
                      className={`timeline-clip ${TRACK_BG[track.id]}`}
                      data-dim={!visibleIds.has(clip.id)}
                      data-active={active?.id === clip.id}
                      style={{
                        left: percent(clip.start - axisStart),
                        width: percent(clip.end - clip.start),
                        top: TRACK_PADDING + clip.lane * (LANE_HEIGHT + LANE_GAP),
                      }}
                      onClick={() => onOpenProject(clip.id)}
                      onMouseEnter={() => setActive(clip)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(clip)}
                      onBlur={() => setActive(null)}
                    >
                      {clip.plannedFrom !== null && (
                        <span
                          className="timeline-planned"
                          style={{ width: `${((clip.end - clip.plannedFrom) / (clip.end - clip.start)) * 100}%` }}
                        />
                      )}
                    </a>
                  ))}
                </div>
              </Fragment>
            ))}

            {/* 오늘을 가리키는 플레이헤드. 클립 위에 놓인다. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative"
              style={{ gridColumn: 2, gridRow: `1 / ${labelRow + 1}` }}
            >
              <div className="timeline-playhead">
                <span className="absolute bottom-0 left-0 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                  오늘
                </span>
              </div>
            </div>
          </div>
        </div>
        <p aria-hidden="true" className="mt-3 min-h-[1.5rem] text-sm text-ink-soft">
          {active ? `${active.name}, ${active.periodLabel}` : HINT}
        </p>
      </div>
    </section>
  )
}

export default CareerTimeline
