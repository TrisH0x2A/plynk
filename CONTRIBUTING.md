# Contributing to Plynk

First off, thank you for considering contributing to **Plynk**! 

## Development Setup

### Prerequisites
- **Node.js**: v18 or later
- **pnpm**: v9 or later (`npm install -g pnpm`)
- **Rust**: Latest stable (`rustup default stable`)
- **Tauri Prerequisites**: See [Tauri Prerequisites Guide](https://tauri.app/start/prerequisites/) for your OS.

### Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/TrisH0x2A/plynk.git
   cd plynk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run in development mode:
   ```bash
   pnpm tauri:dev
   ```

4. Run type checking and validation:
   ```bash
   pnpm typecheck
   pnpm build
   ```

## Pull Request Guidelines
- Ensure your changes adhere to the Tech-Noir / Monochrome brutalist aesthetic.
- Verify that both Dark and Light monochrome modes are fully supported with zero visual regressions.
- Ensure all tests and TypeScript compiler checks pass before opening a PR.
