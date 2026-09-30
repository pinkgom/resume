# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Project Overview

This is the public profile site for Ahn Gyeong-chan, built with **React 18**, **Vite**, and **Tailwind CSS**.
It shows a 24-year career as an editing-style timeline (five role tracks) above a single expandable ledger of all projects. Light and dark themes are supported.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Testing**: Vitest, Testing Library (jsdom)
- **Deployment**: GitHub Pages (`main` push triggers a public deploy)

## Project Structure

```
resume/
├── src/
│   ├── components/       # UI Components (Header, CareerTimeline, Ledger, etc.)
│   ├── utils/            # Pure data logic (career.js) and its tests
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles and Tailwind directives
├── public/               # Static assets
├── data/                 # Data files (e.g., portfolio content)
├── dist/                 # Build output (generated)
└── [Config Files]        # vite.config.js, tailwind.config.js, etc.
```

## Development Commands

- **Start Dev Server**: `npm run dev` (runs on http://localhost:3000)
- **Run Tests**: `npm test`
- **Build for Production**: `npm run build`
- **Preview Build**: `npm run preview`
- **Deploy**: push to `main` (GitHub Actions). Work on a branch and merge after review.

## Key Components

- `utils/career.js`: Pure data logic (period parsing, role → track mapping, lane packing, tech index, filtering)
- `Header.jsx`: Name, titles, intro, contact links
- `CareerTimeline.jsx`: Five role tracks with project clips and a "today" playhead
- `Ledger.jsx` / `LedgerEntry.jsx`: Single project list, entries expand in place, each has a `#project_id` URL
- `ImageViewer.jsx`: Native `<dialog>` screenshot viewer
- `TechIndex.jsx`: Tech index aggregated from project data, click to filter
- `Footer.jsx`: Contact
- `ThemeToggle.jsx`: Dark screen toggle

## Guidelines

- **Styling**: Use Tailwind CSS utility classes. Avoid inline styles or separate CSS files unless necessary for complex animations.
- **Components**: Functional components with Hooks.
- **Data**: Content should generally be managed in JSON files in `data/` or constants, rather than hardcoded in components, to facilitate updates.
- **Design**: Follow `docs/superpowers/specs/2026-09-30-portfolio-redesign-design.md`. Use only the color tokens in `src/index.css` (no Tailwind default colors), no cards/shadows/gradients, and no motion beyond the one-time playhead sweep.
- **Logic**: Keep data logic in `src/utils/career.js` with tests; components only render.
