# HappyWrap Presentation Builder

A modern PowerPoint-style presentation builder for creating beautiful slides with items and hampers.

## Features

- **Split-panel layout**: Controls on the left, live preview on the right
- **Two slide types**: Item slides and Hamper slides
- **Live preview**: WYSIWYG slide preview
- **PDF export**: Download all slides as a single PDF
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- React 18 + TypeScript
- Vite for fast development
- shadcn/ui component library
- Tailwind CSS for styling
- PDF generation with jsPDF and html2canvas

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/happywrap/happywrap.github.io.git
cd happywrap.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

### Deploying to GitHub Pages

```bash
# Deploy to GitHub Pages
node deploy.js
```

The site will be available at: https://happywrap.github.io/

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── SlideEditor.tsx # Left panel slide management
│   ├── SlideForm.tsx   # Slide data input forms
│   ├── SlidePreview.tsx # Right panel preview
│   └── SlideCard.tsx   # Individual slide component
├── data/               # Data layer
│   └── defaultItems.ts # Default item list (easily swappable)
├── hooks/              # Custom React hooks
│   └── usePresentation.ts # Presentation state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── pdfGenerator.ts # PDF export functionality
└── pages/              # Page components
```

## Data Source Swapping

The application is designed for easy data source swapping. Currently uses hardcoded items in `src/data/defaultItems.ts`. To swap data sources:

1. Create a new data provider in `src/data/`
2. Update the import in `usePresentation.ts`
3. Ensure the new data source returns the same `Item` interface

## Technologies Used

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
