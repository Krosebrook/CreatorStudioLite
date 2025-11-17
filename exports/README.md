# SparkLabs Cinematic Demo - Export Package

## Quick Start

This folder contains all production assets for the SparkLabs cinematic demo experience, including:

- **Storyboard**: Complete annotated storyboard (STORYBOARD.md)
- **UI Components**: Exportable SVG/PNG components (buttons, cards, icons)
- **Videos**: Demo videos in multiple formats (16:9, 9:16, 1:1)
- **Avatars**: Character assets (stylized + realistic)
- **Style Guide**: Design tokens and visual specifications

## Package Contents

```
/exports/
├── STORYBOARD.md          # 📘 Complete visual storyboard with annotations
├── ASSET_MANIFEST.md      # 📋 Detailed asset catalog and specifications
├── README.md              # 📖 This file
├── storyboard/            # 🎬 PDF storyboard for print/presentation
├── ui_components/         # 🎨 Reusable UI components (SVG/PNG)
├── videos/                # 🎥 Demo videos (landscape/vertical/square)
├── avatars/               # 👤 Avatar character assets
└── style-guide/           # 🎯 Design tokens and guidelines
```

## Documentation

### 1. STORYBOARD.md
Complete scene-by-scene breakdown with:
- Visual descriptions
- Animation timings
- Narration scripts
- Responsive layouts
- Accessibility features

### 2. ASSET_MANIFEST.md
Comprehensive asset catalog with:
- File listings
- Technical specifications
- Usage instructions
- Integration examples

## Quick Links

- **View Storyboard**: [STORYBOARD.md](./STORYBOARD.md)
- **Asset Catalog**: [ASSET_MANIFEST.md](./ASSET_MANIFEST.md)
- **Live Demo**: Run `npm run dev` and click the "Demo" button
- **Repository**: [GitHub](https://github.com/Krosebrook/CreatorStudioLite)

## Usage

### Running the Demo
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Click the "Demo" button in top-right corner
```

### Exporting Assets
All assets are pre-exported in their respective folders:
- UI components: `/exports/ui_components/`
- Videos: `/exports/videos/`
- Avatars: `/exports/avatars/`

### Customization
To modify the demo:
1. Edit `src/components/CinematicDemo/CinematicWalkthrough.tsx`
2. Update scene content, timing, or animations
3. Rebuild: `npm run build`

## Technical Specifications

### Videos
- **Formats**: MP4 (H.264)
- **Resolutions**: 1080p, 720p
- **Frame Rates**: 60fps, 30fps
- **Aspect Ratios**: 16:9, 9:16, 1:1
- **Subtitles**: SRT format included

### UI Components
- **Format**: SVG (scalable) + PNG @2x (retina)
- **Color Space**: sRGB
- **Grid System**: 8pt base
- **Design System**: Based on design-system/tokens.ts

### Avatars
- **Stylized**: SVG with animations
- **Realistic**: PNG @2x with transparency
- **Sizes**: 16px, 24px, 32px, 40px
- **Expressions**: Neutral, Happy, Excited, Thinking
- **Gestures**: Wave, Point, Celebrate

## Accessibility

All assets meet WCAG 2.1 AA standards:
- Color contrast ≥ 4.5:1
- Keyboard navigable
- Screen reader compatible
- Colorblind-safe palettes
- Reduced motion support

## License

MIT License - See [LICENSE](../LICENSE) for details

## Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/CreatorStudioLite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/CreatorStudioLite/discussions)
- **Documentation**: See STORYBOARD.md and ASSET_MANIFEST.md

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Updated**: 2025-11-17
