# Amplify Creator Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

The all-in-one creator platform for content creation, publishing, and monetization. Built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

- **Content Management**: Create, edit, and manage content across multiple platforms
- **Multi-Platform Publishing**: Publish to Instagram, Facebook, Twitter, LinkedIn, TikTok, and YouTube
- **Analytics Dashboard**: Track performance metrics and engagement across all platforms
- **Monetization**: Stripe integration for subscriptions and payments
- **Team Collaboration**: Multi-user support with role-based access control (RBAC)
- **Media Management**: Upload, process, and organize media files
- **Content Templates**: Reusable templates for consistent branding
- **Scheduling**: Schedule posts for optimal engagement times
- **Email Notifications**: Automated notifications for important events
- **Audit Logging**: Track all system activities for compliance
- **Export/Import**: Backup and restore your data

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account (for database and authentication)
- Stripe account (for payment processing, optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/CreatorStudioLite.git
   cd CreatorStudioLite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   Run the database migrations:
   ```bash
   # Using Supabase CLI
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## 🏗️ Build for Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🧪 Testing

Run the smoke tests:

```bash
npm test
```

Run health checks:

```bash
npm run health-check
```

## 📚 Project Structure

```
CreatorStudioLite/
├── api/                    # API endpoints (auth, webhooks)
├── scripts/                # Utility scripts (health checks, smoke tests)
├── src/
│   ├── components/         # React components
│   ├── config/            # Configuration files
│   ├── connectors/        # Social platform connectors
│   ├── contexts/          # React contexts
│   ├── design-system/     # UI components and theme
│   ├── lib/               # External library wrappers
│   ├── rbac/              # Role-based access control
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── workflows/         # Job queue and workflow management
├── supabase/              # Database migrations
└── dist/                  # Production build output
```

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

Key security practices:
- Never commit `.env` files
- Use Row Level Security (RLS) in Supabase
- Rotate API keys regularly
- Keep dependencies updated (`npm audit`)
- Review the [Security Policy](SECURITY.md) for detailed guidelines

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Report bugs via [GitHub Issues](https://github.com/Krosebrook/CreatorStudioLite/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/Krosebrook/CreatorStudioLite/discussions)

## 🗺️ Roadmap

- [x] Phase 1: Core architecture and authentication
- [x] Phase 2: Multi-platform connectors
- [x] Phase 5: Analytics, monetization, and enterprise features
- [ ] Advanced AI content generation
- [ ] Mobile application
- [ ] Advanced analytics and insights
- [ ] WhiteLabel solutions

## 💡 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Icons**: Heroicons, Lucide React
- **Validation**: Zod
- **Build Tool**: Vite
- **Linting**: ESLint

## 🌟 Acknowledgments

Built with modern web technologies and best practices for scalability and maintainability.

---

Made with ❤️ by the CreatorStudioLite team
