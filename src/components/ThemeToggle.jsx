const ThemeToggle = ({ dark, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={dark}
    className={`rounded border border-rule px-2.5 py-1 text-sm ${dark ? 'bg-ink text-paper' : ''}`}
  >
    어두운 화면
  </button>
)

export default ThemeToggle
