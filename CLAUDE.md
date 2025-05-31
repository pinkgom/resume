# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML resume/portfolio website for 안경찬 (Ahn Gyeong-chan), hosted on GitHub Pages at https://pinkgom.github.com/resume. The site showcases professional experience and software projects.

## Architecture

**Technology Stack:**
- Static HTML (no build process required)
- Bootstrap-based CSS framework (pre-bundled)
- Font Awesome, Bootstrap Icons, Line Awesome for icons
- Custom JavaScript for profile interactions

**Key Files:**
- `index.html` - Main resume page
- `assets/js/custom/pages/user-profile/general.js` - Profile interaction logic
- `assets/media/images/projects/` - Project screenshots

## Development Commands

```bash
# No build/test commands - this is a static site
# Use VS Code Live Server on port 5501 (configured in .vscode/settings.json)
# Or open index.html directly in a browser
```

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the main branch.

## Content Structure

The resume contains several project sections that may need updates:
- MUSEEK (Music Seek)
- CAOS (CCTV Automated Observation System)
- MBC Digital News Service Management
- EMP (Efficient Mobile Service Packaging)
- Additional enterprise projects

When updating project information, ensure corresponding images exist in `assets/media/images/projects/`.