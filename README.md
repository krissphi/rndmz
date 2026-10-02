# rndmz

Minimalist shuffle randomizer web application built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- Cryptographically secure random selection using Web Crypto API (`window.crypto.getRandomValues`)
- Weighted probability multipliers per item
- Categorized item management and filtering
- Multi-batch management without data loss
- Non-repeat winner tracking with manual override
- Dynamic word-by-word kinetic font switching during shuffle
- Web Audio API synthesized sound effects
- Data import and export (CSV and JSON formats)
- High-performance virtualized item list rendering
- Localized history and timestamp logs
- Client-side persistence via `localStorage`

## Setup and Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Tech Stack

- Framework: React 18
- Build Tool: Vite
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Effects: canvas-confetti
