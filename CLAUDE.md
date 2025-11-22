# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Project Overview

This is a modern portfolio website for Ahn Gyeong-chan, built with **React 18**, **Vite**, and **Tailwind CSS**.
It features a responsive design, dark mode support, and interactive elements using Framer Motion.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Animation**: Framer Motion, AOS (Animate On Scroll)
- **Icons**: React Icons
- **Deployment**: GitHub Pages (`gh-pages`)

## Project Structure

```
resume/
├── src/
│   ├── components/       # UI Components (Hero, Timeline, Projects, etc.)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles and Tailwind directives
├── public/               # Static assets
├── data/                 # Data files (e.g., portfolio content)
├── dist/                 # Build output (generated)
└── [Config Files]        # vite.config.js, tailwind.config.js, etc.
```

## Development Commands

- **Start Dev Server**: `npm run dev` (runs on http://localhost:5173 by default)
- **Build for Production**: `npm run build`
- **Preview Build**: `npm run preview`
- **Deploy**: `npm run deploy` (builds and pushes to `gh-pages` branch)

## Key Components

- `Hero.jsx`: Landing section
- `Timeline.jsx`: Experience history
- `Projects.jsx`: Project showcase with filtering
- `Skills.jsx`: Technical skills display
- `Contact.jsx`: Contact information
- `ThemeToggle.jsx`: Dark/Light mode switcher

## Guidelines

- **Styling**: Use Tailwind CSS utility classes. Avoid inline styles or separate CSS files unless necessary for complex animations.
- **Components**: Functional components with Hooks.
- **Data**: Content should generally be managed in JSON files in `data/` or constants, rather than hardcoded in components, to facilitate updates.