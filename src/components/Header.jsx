import ThemeToggle from './ThemeToggle'

const SECTIONS = [
  { href: '#ledger', label: '기록' },
  { href: '#tech', label: '기술' },
  { href: '#contact', label: '연락' },
]

const LINK = 'underline underline-offset-4'

const Header = ({ personalInfo, dark, onToggleTheme }) => (
  <header className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:px-8 md:pb-14">
    <nav aria-label="섹션 이동" className="flex items-center justify-end gap-5 text-sm">
      {SECTIONS.map(({ href, label }) => (
        <a key={href} href={href} className="underline-offset-4 hover:underline">
          {label}
        </a>
      ))}
      <ThemeToggle dark={dark} onToggle={onToggleTheme} />
    </nav>

    <div className="mt-10 flex items-center gap-4 md:mt-14 md:gap-5">
      <img
        src={personalInfo.profileImage}
        alt=""
        width="56"
        height="56"
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
      <div>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1]">{personalInfo.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">{personalInfo.nameEn}</p>
      </div>
    </div>

    <p className="mt-6 font-medium">{String(personalInfo.title ?? '').split(' / ').join(', ')}</p>
    {personalInfo.intro && <p className="mt-3 max-w-[68ch]">{personalInfo.intro}</p>}

    <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
      <a href={`mailto:${personalInfo.email}`} className={LINK}>
        {personalInfo.email}
      </a>
      <a href={personalInfo.blog} target="_blank" rel="noopener noreferrer" className={LINK}>
        브런치에서 글 읽기
      </a>
    </p>
  </header>
)

export default Header
