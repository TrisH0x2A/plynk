# PLYNK

<p align="center">
  <strong>High-Performance, 100% Offline Brutalist Kanban Desktop Workspace</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Tauri%20v2%20%7C%20Rust-black?style=for-the-badge&logo=rust&logoColor=white" alt="Tauri + Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-black?style=for-the-badge&logo=react&logoColor=white" alt="React + TypeScript" />
  <img src="https://img.shields.io/badge/Storage-Embedded%20SQLite%20%28Zero%20Cloud%29-black?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-black?style=for-the-badge" alt="License" />
  <a href="https://github.com/TrisH0x2A/plynk"><img src="https://img.shields.io/github/stars/TrisH0x2A/plynk?style=for-the-badge&color=black&logo=github" alt="GitHub Stars" /></a>
</p>

---

## Overview

Plynk is an ultra-fast, local-first Kanban desktop application built from the ground up for developers and power users who value speed, privacy, and minimalist brutalist aesthetics.

Unlike cloud-dependent task management software, Plynk executes completely locally on your system, persists all state in an embedded SQLite database (`plynk.db`), and requires zero network access, zero account creation, and zero external telemetry.

---

## Design System: Tech-Noir & Pure Monochrome

Plynk is engineered around a high-contrast industrial monochrome design language:

- **Dark Mode**: Deep charcoal and obsidian canvas (`#000000` / `#09090B`), sharp zinc borders, and stark white typography.
- **Light Mode**: Inverted paper-white canvas (`#FFFFFF` / `#F4F4F5`), solid dark ink borders, and deep high-contrast status accents.
- **Micro-Interactions**: Hardware-accelerated transitions, fluid drag-and-drop feedback, and streamlined onboarding.

---

## Core Features

- **Workspace Architecture**: Organize projects across multiple discrete workspaces with isolated boards, lists, and activity streams.
- **Fluid Drag & Drop**: Instant list and card reordering powered by `@hello-pangea/dnd` with jitter-free layout shifts.
- **Status & Label System**: Rich card lifecycle management (**ACTIVE**, **IN PROGRESS**, **COMPLETED**, **POSTPONED**) with color-coded classification tags.
- **System Activity Timeline**: Detailed chronological audit logging tracking structural events, renames, status transitions, and administrative actions.
- **Local Backup & Restore**: One-click binary SQLite snapshot export and restore to any folder on your machine.
- **Persistent Theme Switcher**: Instant switching between pure Monochrome Dark and Monochrome Light themes.
- **Zero Telemetry & 100% Privacy**: All cards, boards, and logs remain strictly on your local disk.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Core** | [Tauri v2](https://tauri.app/) (Rust 2021) |
| **Database** | Embedded [SQLite](https://www.sqlite.org/) via `rusqlite` (Bundled) |
| **Frontend** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **State & Cache** | [TanStack React Query v5](https://tanstack.com/query/latest), [Zustand](https://zustand-demo.pmnd.rs/) |
| **Styling** | [TailwindCSS](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TrisH0x2A/plynk.git
   cd plynk
   ```

2. **Install frontend dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the application in development**:
   ```bash
   pnpm tauri:dev
   ```

4. **Build production binaries**:
   ```bash
   pnpm tauri:build
   ```
   Compiled binaries and installers are output to `src-tauri/target/release/bundle/`.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<p align="center">
  Crafted by <a href="https://github.com/TrisH0x2A"><strong>TrisH0x2A</strong></a>
</p>
