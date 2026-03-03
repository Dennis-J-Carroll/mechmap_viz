# 🧠 MechMap Viz — Mechanistic Interpretability Visualization

> **Collaborative circuit discovery in GPT-2 transformers**

An interactive visualization and annotation platform for mechanistic interpretability research. Map the hidden circuits inside transformer models — document attention heads, MLP blocks, and trace information flow paths through the neural network's black box.

## ✨ Features

### 🔍 Transformer Architecture Visualization
- Interactive layered view of transformer architectures (GPT-2 Small/Medium/Large/XL)
- Click-to-select attention heads and MLP blocks
- Color-coded importance levels (High/Medium/Low/Unknown) with note indicators
- Configurable model presets and custom architectures

### 📝 Component Annotations
- Annotate individual attention heads and MLP blocks with research findings
- Tag components with predefined labels: *Induction Head*, *Copy Head*, *Name Mover*, *S2 Inhibition*, *Factual Recall*, and more
- Rate component importance for prioritizing research focus
- Full-text notes for detailed documentation

### 🔗 Circuit Path Discovery
- **Map information flow** through the transformer by creating CircuitPaths
- Define ordered sequences of components that form functional circuits
- Label each node's role: *Source*, *Relay*, *Amplifier*, *Inhibitor*, *Sink*
- Track signal types: *positional*, *content*, *name*, *fact*
- Confidence levels: *Verified*, *Likely*, *Speculative*
- Circuit types: *Induction*, *Factual Recall*, *Copy*, *Inhibition*, *Boosting*

### 👥 Collaborative Research
- **Contributor profiles** for multi-researcher projects
- **Comments & discussions** on annotations and circuits
- **Threaded replies** for structured research discourse
- **Public/private projects** for open science or private research
- **Export** to JSON or Markdown for papers and documentation

### 🗄️ Database-Backed Persistence
- SQLite database via Prisma ORM — all annotations, circuits, and comments persisted
- Full CRUD API for projects, annotations, circuit paths, and comments
- Import/export for backup and sharing

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client & create database
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start mapping circuits.

## 🗄️ Database

Uses SQLite (via Prisma) for zero-config setup. The database file is created at `prisma/dev.db`.

### Schema Overview

| Model | Purpose |
|-------|---------|
| **Contributor** | Researchers working on circuit discovery |
| **Project** | Model configuration + research context |
| **Annotation** | Findings about specific heads/MLPs |
| **CircuitPath** | Discovered information flow paths |
| **PathNode** | Individual component in a circuit path |
| **Comment** | Discussion threads on annotations & circuits |

### Database Commands

```bash
# Push schema changes (development)
npm run db:push

# Create a migration
npm run db:migrate

# Reset database
npm run db:reset

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

## 📁 Project Structure

```
mechmap-viz/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/             # REST API routes
│   │   │   ├── projects/    # CRUD for projects
│   │   │   ├── annotations/ # CRUD for annotations
│   │   │   └── export/      # JSON/Markdown export
│   │   ├── globals.css      # Theme & design tokens
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main app page
│   ├── components/
│   │   ├── transformer/     # Core visualization components
│   │   │   ├── TransformerVisualization.tsx
│   │   │   ├── TransformerLayer.tsx
│   │   │   ├── AttentionHead.tsx
│   │   │   ├── MLPBlock.tsx
│   │   │   ├── AnnotationPanel.tsx
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── ProjectSelector.tsx
│   │   │   ├── Legend.tsx
│   │   │   └── Stats.tsx
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/
│   │   └── useProjects.ts   # Data fetching hook
│   ├── lib/
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── store.ts         # Zustand state management
│   │   └── utils.ts         # Utility functions
│   └── types/
│       ├── transformer.ts   # Core type definitions
│       └── api.ts           # API type definitions
├── package.json
└── next.config.ts
```

## 🔬 Research Context

This tool is designed for **mechanistic interpretability** research — the study of what individual components inside neural networks actually *do*. Key concepts:

- **Attention Heads**: Each performs a specific computation (copying tokens, tracking positions, implementing induction, etc.)
- **MLP Blocks**: Process information between attention layers (factual storage, feature computation)
- **Circuits**: Functional pathways where multiple components work together to produce behavior
- **Superposition**: Features may be distributed across multiple components

### Example Circuits to Discover

| Circuit | Components | Function |
|---------|-----------|----------|
| **Induction** | L1H7 → L5H5 | Copy patterns seen before |
| **IOI (Indirect Object)** | L9H8, L10H7 | Track which name goes where |
| **Factual Recall** | L15-MLP → L20H3 | Retrieve stored facts |
| **Greater-Than** | L8H11, L9H1 | Compare numerical quantities |

## 🛠️ Tech Stack

- **Next.js 16** — React framework with App Router
- **TypeScript 5** — Type safety
- **Tailwind CSS 4** — Styling
- **shadcn/ui** — Component library
- **Prisma** — Database ORM (SQLite)
- **Zustand** — State management
- **Framer Motion** — Animations

## 📄 License

MIT
