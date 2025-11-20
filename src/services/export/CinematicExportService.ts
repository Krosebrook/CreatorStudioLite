export interface ExportManifest {
  version: string;
  generatedAt: string;
  platform: string;
  assets: {
    storyboard: StoryboardAsset[];
    components: ComponentAsset[];
    videos: VideoAsset[];
    documentation: DocumentAsset[];
  };
}

export interface StoryboardAsset {
  sceneId: string;
  title: string;
  subtitle: string;
  duration: number;
  thumbnailUrl?: string;
  annotations: string[];
}

export interface ComponentAsset {
  name: string;
  type: 'button' | 'card' | 'form' | 'nav' | 'chart' | 'modal';
  variants: string[];
  exportPath: string;
  formats: ('svg' | 'png' | 'jsx')[];
}

export interface VideoAsset {
  name: string;
  duration: number;
  resolution: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  fps: number;
  format: 'mp4' | 'webm';
  size: number;
  url: string;
}

export interface DocumentAsset {
  name: string;
  type: 'storyboard' | 'component-guide' | 'style-guide' | 'readme';
  format: 'md' | 'pdf';
  path: string;
}

export class CinematicExportService {
  private static instance: CinematicExportService;

  private constructor() {}

  public static getInstance(): CinematicExportService {
    if (!CinematicExportService.instance) {
      CinematicExportService.instance = new CinematicExportService();
    }
    return CinematicExportService.instance;
  }

  public async generateManifest(): Promise<ExportManifest> {
    const manifest: ExportManifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      platform: 'SparkLabs Creator Platform',
      assets: {
        storyboard: this.generateStoryboardAssets(),
        components: this.generateComponentAssets(),
        videos: this.generateVideoAssets(),
        documentation: this.generateDocumentationAssets(),
      },
    };

    return manifest;
  }

  private generateStoryboardAssets(): StoryboardAsset[] {
    return [
      {
        sceneId: 'splash',
        title: 'Welcome to SparkLabs',
        subtitle: 'Your All-in-One Creator Platform',
        duration: 3000,
        annotations: [
          'Logo animation with morphing effect',
          'Gradient background from primary-600 to primary-900',
          'Statistics display with fade-in animation',
          'Bounce arrow indicator at bottom',
        ],
      },
      {
        sceneId: 'onboarding',
        title: 'Meet Your AI Assistant',
        subtitle: 'Guided tour of platform capabilities',
        duration: 5000,
        annotations: [
          'Avatar introduction with wave animation',
          'Feature list with checkmarks',
          'Progress bars showing completion status',
          'Two-column layout: intro + preview card',
        ],
      },
      {
        sceneId: 'dashboard',
        title: 'Your Command Center',
        subtitle: 'Real-time insights and performance tracking',
        duration: 6000,
        annotations: [
          'Four metric cards with icons and trends',
          'Platform performance breakdown',
          'Content type performance bars',
          'Live indicator with pulsing animation',
        ],
      },
      {
        sceneId: 'interaction',
        title: 'Create & Publish',
        subtitle: 'Seamless content creation workflow',
        duration: 7000,
        annotations: [
          'Four-step workflow visualization',
          'Content studio interface mockup',
          'Platform selector with active states',
          'Image preview with caption input',
        ],
      },
      {
        sceneId: 'completion',
        title: 'Ready to Amplify?',
        subtitle: 'Start your creator journey today',
        duration: 4000,
        annotations: [
          'Success checkmark with celebration',
          'Three benefit cards: Fast, Smart, Profitable',
          'CTA buttons with hover states',
          'Grid background pattern',
        ],
      },
    ];
  }

  private generateComponentAssets(): ComponentAsset[] {
    return [
      {
        name: 'MetricCard',
        type: 'card',
        variants: ['default', 'hover', 'loading'],
        exportPath: '/exports/components/MetricCard',
        formats: ['svg', 'png', 'jsx'],
      },
      {
        name: 'ProgressBar',
        type: 'chart',
        variants: ['default', 'animated', 'gradient'],
        exportPath: '/exports/components/ProgressBar',
        formats: ['svg', 'jsx'],
      },
      {
        name: 'PlatformButton',
        type: 'button',
        variants: ['active', 'inactive', 'disabled'],
        exportPath: '/exports/components/PlatformButton',
        formats: ['svg', 'png', 'jsx'],
      },
      {
        name: 'AvatarAssistant',
        type: 'modal',
        variants: ['stylized', 'realistic', 'all-actions'],
        exportPath: '/exports/components/AvatarAssistant',
        formats: ['svg', 'png', 'jsx'],
      },
      {
        name: 'ContentStudioCard',
        type: 'card',
        variants: ['default', 'expanded'],
        exportPath: '/exports/components/ContentStudioCard',
        formats: ['svg', 'png', 'jsx'],
      },
    ];
  }

  private generateVideoAssets(): VideoAsset[] {
    return [
      {
        name: 'cinematic-walkthrough-16-9',
        duration: 25000,
        resolution: '1920x1080',
        aspectRatio: '16:9',
        fps: 60,
        format: 'mp4',
        size: 0,
        url: '/exports/videos/walkthrough-16-9.mp4',
      },
      {
        name: 'cinematic-walkthrough-9-16',
        duration: 25000,
        resolution: '1080x1920',
        aspectRatio: '9:16',
        fps: 60,
        format: 'mp4',
        size: 0,
        url: '/exports/videos/walkthrough-9-16.mp4',
      },
      {
        name: 'scene-splash',
        duration: 3000,
        resolution: '1920x1080',
        aspectRatio: '16:9',
        fps: 60,
        format: 'mp4',
        size: 0,
        url: '/exports/videos/scene-splash.mp4',
      },
      {
        name: 'scene-onboarding',
        duration: 5000,
        resolution: '1920x1080',
        aspectRatio: '16:9',
        fps: 60,
        format: 'mp4',
        size: 0,
        url: '/exports/videos/scene-onboarding.mp4',
      },
      {
        name: 'scene-dashboard',
        duration: 6000,
        resolution: '1920x1080',
        aspectRatio: '16:9',
        fps: 60,
        format: 'mp4',
        size: 0,
        url: '/exports/videos/scene-dashboard.mp4',
      },
    ];
  }

  private generateDocumentationAssets(): DocumentAsset[] {
    return [
      {
        name: 'Detailed Storyboard',
        type: 'storyboard',
        format: 'md',
        path: '/exports/STORYBOARD_DETAILED.md',
      },
      {
        name: 'Component Library Guide',
        type: 'component-guide',
        format: 'md',
        path: '/exports/COMPONENT_GUIDE.md',
      },
      {
        name: 'Style Guide & Theme Variants',
        type: 'style-guide',
        format: 'md',
        path: '/exports/STYLE_GUIDE.md',
      },
      {
        name: 'Production Package README',
        type: 'readme',
        format: 'md',
        path: '/exports/README_PRODUCTION_PACKAGE.md',
      },
    ];
  }

  public async exportToJSON(): Promise<string> {
    const manifest = await this.generateManifest();
    return JSON.stringify(manifest, null, 2);
  }

  public async downloadManifest(): Promise<void> {
    const json = await this.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cinematic-demo-manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public generateStoryboardMarkdown(): string {
    const storyboard = this.generateStoryboardAssets();

    let markdown = `# SparkLabs Cinematic Demo - Detailed Storyboard\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `## Overview\n\n`;
    markdown += `This storyboard outlines the complete cinematic walkthrough experience for the SparkLabs Creator Platform. Each scene is designed to showcase key features while maintaining a smooth, engaging narrative flow.\n\n`;
    markdown += `**Total Duration:** ${storyboard.reduce((acc, s) => acc + s.duration, 0) / 1000}s\n\n`;
    markdown += `**Theme Variants:** Light, Dark, Neon\n\n`;
    markdown += `**Aspect Ratios:** 16:9 (Desktop), 9:16 (Mobile), 1:1 (Social)\n\n`;
    markdown += `---\n\n`;

    storyboard.forEach((scene, index) => {
      markdown += `## Scene ${index + 1}: ${scene.title}\n\n`;
      markdown += `**Subtitle:** ${scene.subtitle}\n\n`;
      markdown += `**Duration:** ${scene.duration}ms (${scene.duration / 1000}s)\n\n`;
      markdown += `**Scene ID:** \`${scene.sceneId}\`\n\n`;
      markdown += `### Key Elements\n\n`;
      scene.annotations.forEach((annotation) => {
        markdown += `- ${annotation}\n`;
      });
      markdown += `\n### Accessibility Features\n\n`;
      markdown += `- Screen reader compatible\n`;
      markdown += `- Keyboard navigation support\n`;
      markdown += `- Color contrast ratio: 4.5:1 minimum\n`;
      markdown += `- Alternative text for all visual elements\n\n`;
      markdown += `### Animation Details\n\n`;
      markdown += `- Smooth easing functions (easeInOut)\n`;
      markdown += `- Staggered entry animations\n`;
      markdown += `- Progress-based transitions\n`;
      markdown += `- Responsive timing adjustments\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }

  public generateComponentGuide(): string {
    const components = this.generateComponentAssets();

    let markdown = `# Component Library - Export Guide\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `## Overview\n\n`;
    markdown += `This guide documents all UI components used in the cinematic demo, including variants, states, and export formats.\n\n`;
    markdown += `---\n\n`;

    components.forEach((component) => {
      markdown += `## ${component.name}\n\n`;
      markdown += `**Type:** ${component.type}\n\n`;
      markdown += `**Variants:** ${component.variants.join(', ')}\n\n`;
      markdown += `**Export Path:** \`${component.exportPath}\`\n\n`;
      markdown += `**Available Formats:**\n`;
      component.formats.forEach((format) => {
        markdown += `- ${format.toUpperCase()}\n`;
      });
      markdown += `\n### Usage\n\n`;
      markdown += `\`\`\`tsx\nimport { ${component.name} } from '@/components';\n\n`;
      markdown += `<${component.name} variant="${component.variants[0]}" />\n\`\`\`\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }

  public generateStyleGuide(): string {
    let markdown = `# Style Guide & Theme Variants\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `## Theme Variants\n\n`;
    markdown += `### Light Theme\n\n`;
    markdown += `- **Background:** White to light blue gradient\n`;
    markdown += `- **Primary:** Blue (500-600)\n`;
    markdown += `- **Text:** Dark gray (900)\n`;
    markdown += `- **Accent:** Cyan, Green for success\n\n`;
    markdown += `### Dark Theme\n\n`;
    markdown += `- **Background:** Black to dark gray gradient\n`;
    markdown += `- **Primary:** Slate (600-800)\n`;
    markdown += `- **Text:** White\n`;
    markdown += `- **Accent:** Blue for highlights\n\n`;
    markdown += `### Neon Theme\n\n`;
    markdown += `- **Background:** Deep black\n`;
    markdown += `- **Primary:** Pink to cyan gradient\n`;
    markdown += `- **Text:** Cyan (300-400)\n`;
    markdown += `- **Accent:** Pink with glow effects\n\n`;
    markdown += `## Typography\n\n`;
    markdown += `- **Headings:** Bold, 150% line height\n`;
    markdown += `- **Body:** Regular, 160% line height\n`;
    markdown += `- **Captions:** Small, 140% line height\n\n`;
    markdown += `## Spacing System\n\n`;
    markdown += `- Base unit: 8px\n`;
    markdown += `- Scale: 0.5x, 1x, 1.5x, 2x, 3x, 4x, 6x, 8x\n\n`;
    markdown += `## Animation Principles\n\n`;
    markdown += `- **Duration:** 300ms (quick), 600ms (standard), 1000ms (complex)\n`;
    markdown += `- **Easing:** easeInOut for most, spring for playful\n`;
    markdown += `- **Delays:** Staggered by 100-150ms increments\n\n`;
    markdown += `## Accessibility\n\n`;
    markdown += `- **Contrast Ratios:** Minimum 4.5:1 for text, 3:1 for UI elements\n`;
    markdown += `- **Focus States:** Visible 2px outline\n`;
    markdown += `- **Motion:** Respects prefers-reduced-motion\n`;
    markdown += `- **Keyboard:** Full keyboard navigation support\n\n`;

    return markdown;
  }

  public async downloadAllDocumentation(): Promise<void> {
    const storyboard = this.generateStoryboardMarkdown();
    const componentGuide = this.generateComponentGuide();
    const styleGuide = this.generateStyleGuide();

    const downloads = [
      { filename: 'STORYBOARD_DETAILED.md', content: storyboard },
      { filename: 'COMPONENT_GUIDE.md', content: componentGuide },
      { filename: 'STYLE_GUIDE.md', content: styleGuide },
    ];

    for (const { filename, content } of downloads) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export const cinematicExportService = CinematicExportService.getInstance();
