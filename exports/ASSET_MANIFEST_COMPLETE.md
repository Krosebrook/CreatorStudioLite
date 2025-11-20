# SparkLabs UI Asset Manifest

**Project:** SparkLabs Cinematic Demo
**Version:** 1.0.0
**Export Date:** January 20, 2025

---

## Asset Organization

```
exports/
├── ui_components/
│   ├── buttons/
│   ├── cards/
│   ├── forms/
│   ├── navigation/
│   ├── charts/
│   └── layouts/
├── icons/
│   ├── brand/
│   ├── platform/
│   ├── action/
│   └── status/
├── illustrations/
│   ├── avatars/
│   ├── empty-states/
│   └── onboarding/
├── videos/
│   ├── demo-16x9-1080p-60fps.mp4
│   ├── demo-9x16-1080p-60fps.mp4
│   ├── demo-1x1-1080p-60fps.mp4
│   ├── demo-4x5-1080p-60fps.mp4
│   └── teaser-15s-all-formats/
└── screenshots/
    ├── mobile/
    ├── tablet/
    └── desktop/
```

---

## Core UI Components

### 1. Buttons

#### Primary Button
- **Name:** `button-primary.svg`
- **Variants:** Default, Hover, Active, Disabled
- **Sizes:** sm (32px), md (40px), lg (48px)
- **Properties:**
  - Background: Gradient primary-500 to primary-600
  - Text: White, semibold
  - Border Radius: rounded-xl (12px)
  - Shadow: shadow-lg on hover
  - Transform: scale(1.05) on hover
- **Export Formats:** SVG, PNG (@1x, @2x, @3x)
- **Use Cases:** Primary CTAs, form submissions, key actions

#### Secondary Button
- **Name:** `button-secondary.svg`
- **Variants:** Default, Hover, Active, Disabled
- **Properties:**
  - Background: white/10 with backdrop-blur
  - Border: 2px solid white
  - Text: White, semibold
  - Hover: white/20 background
- **Export Formats:** SVG, PNG (@1x, @2x, @3x)

#### Ghost Button
- **Name:** `button-ghost.svg`
- **Properties:**
  - Background: Transparent
  - Text: primary-600, medium weight
  - Hover: bg-primary-50
  - Padding: px-4 py-2
- **Export Formats:** SVG, PNG (@1x, @2x, @3x)

### 2. Cards

#### Metric Card (KPI)
- **Name:** `card-metric.svg`
- **Dimensions:** Flexible width, ~120px height
- **Sections:**
  1. Icon container (40x40px)
  2. Metric value (2xl font)
  3. Label text (sm font)
  4. Trend indicator (icon + percentage)
- **Properties:**
  - Background: White
  - Border Radius: rounded-xl (12px)
  - Shadow: shadow-lg, shadow-xl on hover
  - Padding: p-4 (1rem)
  - Transform: translateY(-4px) on hover
- **Color Variants:**
  - Primary (followers/users)
  - Success (views/growth)
  - Warning (revenue)
  - Error (engagement)
- **Export Formats:** SVG with embedded styles
- **Responsive:** Stacks vertically on mobile

#### Platform Card
- **Name:** `card-platform.svg`
- **Elements:**
  - Platform icon (20x20px)
  - Platform name (medium weight)
  - Follower count (semibold)
  - Engagement rate (success-600 color)
- **Properties:**
  - Background: neutral-50
  - Hover: neutral-100
  - Border Radius: rounded-lg (8px)
  - Padding: p-3 (0.75rem)
- **Platforms Included:**
  - Instagram (Pink #E4405F)
  - YouTube (Red #FF0000)
  - TikTok (Black #000000)
  - LinkedIn (Blue #0077B5)
  - Pinterest (Red #E60023)
- **Export Formats:** SVG, PNG (@2x for retina)

#### Content Studio Panel
- **Name:** `card-studio.svg`
- **Sections:**
  1. Header with gradient background
  2. Media preview area (aspect-video)
  3. Caption input field
  4. Platform selector chips
  5. Publish button
- **Properties:**
  - Background: White
  - Border Radius: rounded-2xl (16px)
  - Shadow: shadow-2xl
  - Header Gradient: primary-500 to primary-600
- **Interactive States:**
  - Input focus ring (primary-500)
  - Platform toggle active/inactive
  - Button hover effects
- **Export Formats:** SVG, PNG (@1x, @2x)
- **Responsive Variants:** Mobile (single column), Desktop (as shown)

### 3. Form Elements

#### Text Input
- **Name:** `input-text.svg`
- **Variants:** Default, Focus, Error, Disabled
- **Properties:**
  - Border: 1px solid neutral-200
  - Focus: ring-2 ring-primary-500, border-transparent
  - Border Radius: rounded-lg (8px)
  - Padding: px-4 py-2
  - Font: text-base
- **Export Formats:** SVG

#### Text Area
- **Name:** `textarea.svg`
- **Same properties as text input**
- **Min Height:** 120px
- **Resize:** vertical only

#### Select Dropdown
- **Name:** `select.svg`
- **Properties:**
  - Chevron down icon on right
  - Same styling as text input
  - Dropdown menu: shadow-lg, rounded-lg
- **Export Formats:** SVG

#### Toggle/Chip Button
- **Name:** `chip-toggle.svg`
- **States:** Active, Inactive
- **Properties:**
  - Active: bg-primary-500, text-white
  - Inactive: bg-neutral-100, text-neutral-700
  - Border Radius: rounded-lg (8px)
  - Padding: px-3 py-1.5
  - Font: text-sm, medium weight
- **Use Case:** Platform selectors, tags, filters
- **Export Formats:** SVG

### 4. Progress Indicators

#### Progress Bar
- **Name:** `progress-bar.svg`
- **Variants:**
  - Primary (gradient primary-500 to primary-600)
  - Success (gradient success-500 to success-600)
  - Warning (gradient warning-500 to warning-600)
  - Neutral (neutral-300)
- **Properties:**
  - Background: neutral-200
  - Height: h-2 (8px)
  - Border Radius: rounded-full
  - Animation: Width transition 1s ease-out
- **Export Formats:** SVG with animation keyframes

#### Circular Progress
- **Name:** `progress-circular.svg`
- **Sizes:** sm (40px), md (60px), lg (80px)
- **Properties:**
  - Stroke width: 4px
  - Colors: primary-500 foreground, neutral-200 background
  - Animation: Stroke-dashoffset for percentage
- **Export Formats:** SVG with SMIL animation

#### Loading Spinner
- **Name:** `spinner.svg`
- **Sizes:** sm, md, lg, xl
- **Animation:** Continuous rotation (360deg, 1s linear infinite)
- **Colors:** primary-500 default, customizable via CSS variable
- **Export Formats:** SVG

### 5. Data Visualization

#### Bar Chart
- **Name:** `chart-bar.svg`
- **Properties:**
  - Bars: Gradient fills matching theme
  - Axes: neutral-300 color, 1px stroke
  - Labels: text-sm, neutral-600
  - Animation: Height from 0 to value on load
- **Export Formats:** SVG with data hooks (updateable values)

#### Line Chart
- **Name:** `chart-line.svg`
- **Properties:**
  - Line: 2px stroke, primary-500
  - Fill: Gradient fade to transparent
  - Points: Circles with hover effect
  - Grid: Dashed neutral-200 lines
- **Export Formats:** SVG with data hooks

#### Donut Chart
- **Name:** `chart-donut.svg`
- **Properties:**
  - Segments: Multiple colors for categories
  - Center: Value display or icon
  - Hover: Segment expansion effect
- **Export Formats:** SVG with interactive segments

---

## Icons

### Brand Icons

#### SparkLabs Logo
- **Name:** `logo-sparklabs.svg`
- **Sizes:** 16px, 24px, 32px, 48px, 64px, 128px, 256px
- **Variants:**
  - Full color (primary gradient)
  - Monochrome (single color)
  - White (on dark backgrounds)
  - Black (on light backgrounds)
- **Properties:**
  - Sparkles icon with rounded square container
  - Optional wordmark below or to the right
- **Export Formats:** SVG, PNG (@1x, @2x, @3x, @4x)
- **Usage:** App icon, splash screen, marketing materials

#### Favicon
- **Name:** `favicon.svg`
- **Sizes:** 16x16, 32x32, 48x48
- **Format:** ICO, SVG, PNG
- **Properties:** Simplified sparkles icon only

### Platform Icons

All platform icons standardized to 20x20px base size.

| Platform | Icon Name | Color | Notes |
|----------|-----------|-------|-------|
| Instagram | `icon-instagram.svg` | #E4405F | Official brand color |
| YouTube | `icon-youtube.svg` | #FF0000 | Play button style |
| TikTok | `icon-tiktok.svg` | #000000 | Musical note |
| LinkedIn | `icon-linkedin.svg` | #0077B5 | Professional network |
| Pinterest | `icon-pinterest.svg` | #E60023 | Pin icon |
| Twitter/X | `icon-twitter.svg` | #1DA1F2 | Bird or X logo |
| Facebook | `icon-facebook.svg` | #1877F2 | F lettermark |
| Twitch | `icon-twitch.svg` | #9146FF | Gaming platform |

**Export Formats:** SVG (outline and filled versions)

### Action Icons

Using Lucide React icon set, exported as standalone SVGs:

- **Camera** (`icon-camera.svg`) - Content capture
- **Zap** (`icon-zap.svg`) - AI features, speed
- **Globe** (`icon-globe.svg`) - Publishing, worldwide
- **Image** (`icon-image.svg`) - Photo content
- **Video** (`icon-video.svg`) - Video content
- **Calendar** (`icon-calendar.svg`) - Scheduling
- **TrendingUp** (`icon-trending-up.svg`) - Growth metrics
- **DollarSign** (`icon-dollar.svg`) - Revenue, monetization
- **Users** (`icon-users.svg`) - Audience, followers
- **Heart** (`icon-heart.svg`) - Likes, engagement
- **MessageCircle** (`icon-message.svg`) - Comments, chat
- **Share** (`icon-share.svg`) - Social sharing
- **Eye** (`icon-eye.svg`) - Views, visibility
- **BarChart** (`icon-bar-chart.svg`) - Analytics

**Properties:**
- Stroke width: 2px
- Size: 24x24px viewBox
- Color: Customizable via CSS variable
- Export: SVG optimized with SVGO

### Status Icons

- **Check** (`icon-check.svg`) - Success, completed
- **X** (`icon-x.svg`) - Close, cancel, error
- **AlertTriangle** (`icon-alert.svg`) - Warning
- **Info** (`icon-info.svg`) - Information
- **Loader** (`icon-loader.svg`) - Processing, loading

**Color Coding:**
- Success: success-500 (#10B981)
- Error: error-500 (#EF4444)
- Warning: warning-500 (#F59E0B)
- Info: primary-500 (#8B5CF6)

---

## Illustrations

### Avatar - Spark AI Assistant

#### Stylized Variant
- **Name:** `avatar-spark-stylized.svg`
- **Design:**
  - Circular gradient (primary-500 to primary-600)
  - Sparkles icon centered
  - Pulsing border when "speaking"
  - Status indicator (green dot)
- **Sizes:** sm (64px), md (96px), lg (128px)
- **Animations:**
  - Wave: Rotation -10deg to +10deg
  - Bob: Vertical movement (floating effect)
  - Celebrate: Scale + rotation combination
  - Talk: Subtle scale pulse
- **Export Formats:** SVG with animation classes, PNG static

#### Realistic Variant
- **Name:** `avatar-spark-realistic.svg`
- **Design:**
  - Human-like face with simplified features
  - Neutral skin tone (gradient #F3E5D8 to #E8D4C0)
  - Hair: Dark gray gradient (#4B5563 to #374151)
  - Expressions: Happy (smile), Thinking (straight mouth + thought bubbles), Excited (wide eyes + open mouth)
  - Ring border: 4px white
- **Sizes:** sm (64px), md (96px), lg (128px)
- **Export Formats:** SVG, PNG (@2x)

### Empty States

#### No Content
- **Name:** `illustration-empty-content.svg`
- **Design:** Simplified graphic with muted colors
- **Text Suggestions:** "No content yet" / "Start creating"

#### No Data
- **Name:** `illustration-empty-data.svg`
- **Design:** Chart with flat line or empty bars
- **Text Suggestions:** "No data available" / "Connect platforms"

#### Error State
- **Name:** `illustration-error.svg`
- **Design:** Alert symbol with supportive visual
- **Text Suggestions:** "Something went wrong" / "Try again"

### Onboarding Illustrations

#### Welcome
- **Name:** `illustration-welcome.svg`
- **Scene:** Sparkles with welcoming gesture
- **Style:** Friendly, inviting, colorful

#### Tutorial Steps
- **Names:** `illustration-step-[1-4].svg`
- **Scenes:** Capture, Generate, Edit, Publish
- **Style:** Consistent with main UI, simplified for clarity

---

## Layout Screenshots

### Desktop Views (1920x1080)

1. **Landing Page**
   - Hero section with CTA
   - Features grid
   - Testimonials
   - Pricing comparison
   - Footer with links

2. **Dashboard**
   - Header with user profile
   - KPI metrics grid (4 columns)
   - Platform performance (2 columns)
   - Content analytics
   - Quick actions sidebar

3. **Content Studio**
   - Media upload/preview
   - Editing tools panel
   - Platform selector
   - Scheduling calendar
   - Publish controls

4. **Analytics**
   - Time range selector
   - Multi-platform charts
   - Detailed metrics tables
   - Export options

### Tablet Views (1024x768)

- **Adjustments:**
  - 2-column grid for metrics
  - Collapsible sidebar navigation
  - Touch-optimized controls
  - Larger tap targets (min 44x44px)

### Mobile Views (375x667 - iPhone SE)

- **Adjustments:**
  - Single column layouts
  - Bottom navigation bar
  - Hamburger menu for secondary actions
  - Full-screen modals for forms
  - Sticky headers on scroll

**Export Format:** PNG at 2x resolution for all devices

---

## Animation Specifications

### Transition Timings

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| Fade | 300ms | ease-out | Opacity changes |
| Slide | 600ms | ease-out | Element entry/exit |
| Scale | 200ms | ease-in-out | Button press, hover |
| Rotate | 500ms | ease-in-out | Icon transformations |
| Morph | 1000ms | ease-out | Logo reveals |
| Count Up | 1000ms | ease-out | Number animations |

### Keyframe Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide Up
```css
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

#### Bounce Slow
```css
@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Export:** CSS file with all animation definitions

---

## Style Variants

### Minimalist Flat
- **Palette:** Reduced saturation, neutral focus
- **Shadows:** Minimal (shadow-sm only)
- **Borders:** 1px solid lines
- **Animations:** Subtle, functional only
- **Typography:** Clean sans-serif, generous spacing

### Cinematic Realism (Default)
- **Palette:** Rich gradients, full saturation
- **Shadows:** Dramatic (shadow-lg, shadow-2xl)
- **Borders:** Rounded corners, soft edges
- **Animations:** Fluid, attention-grabbing
- **Typography:** Bold headings, elegant body text

### Futuristic Neon
- **Palette:** High contrast, electric colors
- **Shadows:** Glowing effects (box-shadow with color)
- **Borders:** Sharp corners, glowing outlines
- **Animations:** Fast, energetic movements
- **Typography:** Tech-inspired fonts, uppercase emphasis

**Export:** CSS file for each variant with theme variables

---

## Theme Variants

### Light Mode (Default)
- **Background:** neutral-50 (#FAFAFA)
- **Text Primary:** neutral-900 (#171717)
- **Text Secondary:** neutral-600 (#525252)
- **Cards:** White (#FFFFFF)
- **Borders:** neutral-200 (#E5E5E5)
- **Focus Ring:** primary-500 (#8B5CF6)

### Dark Mode
- **Background:** neutral-900 (#171717)
- **Text Primary:** white (#FFFFFF)
- **Text Secondary:** neutral-300 (#D4D4D4)
- **Cards:** neutral-800 (#262626)
- **Borders:** neutral-700 (#404040)
- **Focus Ring:** primary-400 (#A78BFA)

**Export:** CSS custom properties for theme switching

---

## Video Export Specifications

### Format Specifications

| Aspect Ratio | Resolution | Codec | Bitrate | Audio | FPS |
|--------------|------------|-------|---------|-------|-----|
| 16:9 (Desktop) | 1920x1080 | H.264 | 8 Mbps | AAC 320kbps | 60 |
| 9:16 (Mobile) | 1080x1920 | H.264 | 8 Mbps | AAC 320kbps | 60 |
| 1:1 (Social) | 1080x1080 | H.264 | 6 Mbps | AAC 320kbps | 60 |
| 4:5 (Instagram) | 1080x1350 | H.264 | 6 Mbps | AAC 320kbps | 60 |

### File Naming Convention
```
sparklabs-demo-[aspect]-[resolution]-[fps]fps-[version].mp4

Examples:
- sparklabs-demo-16x9-1080p-60fps-v1.mp4
- sparklabs-demo-9x16-1080p-60fps-v1.mp4
- sparklabs-teaser-15s-16x9-1080p-60fps-v1.mp4
```

### Metadata Embedding
- **Title:** SparkLabs Creator Platform Demo
- **Description:** All-in-one platform for content creation, publishing, and monetization
- **Keywords:** creator, content, AI, social media, platform
- **Copyright:** © 2025 SparkLabs
- **Author:** SparkLabs Design Team

---

## Accessibility Assets

### High Contrast Variants
All UI components exported with high contrast versions:
- Increased border widths (2px minimum)
- Enhanced focus indicators (3px rings)
- Color contrast ratio 7:1 minimum

### Keyboard Navigation Indicators
- Focus states for all interactive elements
- Skip link graphics
- Tab order visualization aids

### Screen Reader Assets
- ARIA label reference guide
- Semantic HTML structure diagram
- Live region usage map

---

## Implementation Notes

### SVG Optimization
- Run through SVGO with precision:3
- Remove unnecessary metadata
- Combine paths where possible
- Maintain viewBox for scaling
- Embed critical styles, link theme variables

### PNG Export Settings
- Compression: PNG-8 for icons, PNG-24 for photos
- Transparency: Maintained for overlays
- Resolution: @1x, @2x, @3x for all icon sizes
- Color Profile: sRGB for web consistency

### Performance Considerations
- Lazy load illustrations (below fold)
- Use SVG sprites for repeated icons
- Implement skeleton loaders for cards
- Defer non-critical animations

### File Size Targets
- SVG Icons: <2KB each
- SVG Components: <10KB each
- PNG Screenshots: <500KB each
- Video Files: <50MB each (full demo)

---

## Design Tokens (Tailwind Config)

### Colors
```javascript
colors: {
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  // ... (success, warning, error, neutral)
}
```

### Spacing
```javascript
spacing: {
  // Base 4px scale
  '0': '0',
  '1': '0.25rem', // 4px
  '2': '0.5rem',  // 8px
  '3': '0.75rem', // 12px
  '4': '1rem',    // 16px
  // ... up to 96 (384px)
}
```

### Border Radius
```javascript
borderRadius: {
  'none': '0',
  'sm': '0.125rem',  // 2px
  'DEFAULT': '0.25rem', // 4px
  'md': '0.375rem',  // 6px
  'lg': '0.5rem',    // 8px
  'xl': '0.75rem',   // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  'full': '9999px',
}
```

---

## Usage Guidelines

### Component Selection
- Use metric cards for KPIs and real-time data
- Platform cards for social network integration displays
- Progress bars for task completion and loading states
- Studio panel for content creation interfaces

### Color Application
- Primary: Brand elements, CTAs, links
- Success: Positive metrics, confirmations
- Warning: Revenue data, cautions
- Error: Alerts, engagement metrics (when used as accent)
- Neutral: Backgrounds, borders, secondary text

### Typography Hierarchy
1. **Hero Heading** (5xl-6xl) - Landing page titles
2. **Section Heading** (3xl-4xl) - Major sections
3. **Card Title** (xl-2xl) - Component headings
4. **Body Text** (base) - Paragraphs, descriptions
5. **Small Text** (sm) - Labels, captions, metadata

### Spacing Consistency
- **Intra-component:** 2-4 (8-16px)
- **Between components:** 4-6 (16-24px)
- **Section spacing:** 8-12 (32-48px)
- **Page margins:** 6-8 (24-32px) on mobile, 8-16 (32-64px) on desktop

---

## Contact & Support

**Design Team:** design@sparklabs.app
**Asset Requests:** assets@sparklabs.app
**Bug Reports:** bugs@sparklabs.app

**Repository:** `/exports` directory in main project

**Last Updated:** January 20, 2025
**Version:** 1.0.0
**License:** Proprietary - SparkLabs Internal Use Only
