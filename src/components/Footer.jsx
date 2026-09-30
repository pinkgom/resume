const LINK = 'underline underline-offset-4'

const Footer = ({ personalInfo }) => (
  <footer id="contact" aria-labelledby="contact-title" className="border-t border-rule">
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
      <h2 id="contact-title" className="font-serif text-[1.75rem] font-semibold leading-[1.3]">
        연락
      </h2>
      <ul className="mt-6 space-y-2">
        <li>
          <a href={`mailto:${personalInfo.email}`} className={LINK}>
            {personalInfo.email}
          </a>
        </li>
        <li>
          <a href={personalInfo.blog} target="_blank" rel="noopener noreferrer" className={LINK}>
            브런치에서 글 읽기
          </a>
        </li>
        <li className="text-ink-soft">{personalInfo.location}</li>
      </ul>
      <p className="mt-10 text-sm text-ink-soft">
        © {new Date().getFullYear()} {personalInfo.name}
      </p>
    </div>
  </footer>
)

export default Footer
