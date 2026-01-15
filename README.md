# Quilt Designer

An interactive web application for designing quilt patterns with drag-and-drop functionality, pattern library, and export capabilities.

## Live Demo

🌐 **[Try it now on GitHub Pages](https://steveluc.github.io/test1/)**

## Features

- 🎨 **Pattern Designer** - Create solid colors, stripes (horizontal, vertical, diagonal), checkerboard, and quarter-square triangle patterns
- 📚 **Pattern Library** - Save and reuse your custom patterns
- 🔄 **Rotation** - Double-click/tap to rotate patterns 90 degrees
- 🖱️ **Drag & Drop** - Intuitive pattern placement with mouse and touch support
- 💾 **Save/Load** - Save designs as JSON and load them later
- 📸 **Export PNG** - Export finished quilts as high-resolution images
- 📱 **Responsive** - Works on desktop and mobile devices

## Development

### Prerequisites

- Node.js (v18 or later)
- npm

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
test1/
├── quilt.ts           # TypeScript source code
├── styles.css         # Stylesheet
├── index-new.html     # HTML template
├── dist/              # Built files (after npm run build)
│   ├── index.html
│   └── assets/
└── package.json       # Dependencies and scripts
```

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment (Recommended)

Every push to the `main` branch will automatically:
1. Build the project with Vite
2. Deploy to GitHub Pages

**First-time Setup:**
1. Go to your repository Settings → Pages
2. Under "Build and deployment", select "Source: GitHub Actions"
3. Push any change to main branch to trigger deployment

### Manual Deployment

You can also deploy manually:

```bash
# Build the project
npm run build

# Commit and push
git add dist
git commit -m "Build for deployment"
git push
```

The `dist/` folder contains all production-ready files.

## Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Canvas API** - High-quality PNG export
- **CSS Grid** - Responsive quilt layout

## Browser Support

Works in all modern browsers that support:
- ES2020
- CSS Grid
- Canvas API
- Touch events

## License

MIT
