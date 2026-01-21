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

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

⚠️ **[Documentation Audit Report](./DOCUMENTATION_AUDIT_REPORT.md)** - Production-readiness audit (January 2026)  
📊 **[Audit Implementation Summary](./DOCUMENTATION_AUDIT_IMPLEMENTATION_SUMMARY.md)** - Quick overview and next steps

### 📖 For Users & Product Teams
- **[Quick Feature Recommendation](./docs/FEATURE_RECOMMENDATION_QUICK_REF.md)** - Next features to build (2-page summary)
- **[Strategic Analysis](./docs/STRATEGIC_FEATURE_ANALYSIS.md)** - Comprehensive market analysis and planning
- **[Roadmap](./docs/NEXT_FEATURES_ROADMAP.md)** - Implementation roadmap and timeline

### 🔧 For Developers
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Component Documentation](./docs/COMPONENTS.md)** - UI component library guide
- **[Development Guide](./docs/DEVELOPMENT.md)** - Getting started and best practices
- **[API Reference](./API.md)** - Complete API documentation
- **[API Error Codes](./API_ERROR_CODES.md)** - Error handling guide [Placeholder]
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions [Placeholder]
- **[RBAC Guide](./docs/RBAC_GUIDE.md)** - Roles and permissions [Placeholder]
- **[Connector Guide](./docs/CONNECTOR_GUIDE.md)** - Platform integration [Placeholder]

### 🚀 For DevOps & Operations
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to various platforms [Incomplete]
- **[Monitoring Guide](./MONITORING.md)** - Set up observability [Incomplete]
- **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Pre-launch verification
- **[Disaster Recovery](./DISASTER_RECOVERY.md)** - Backup and recovery [Placeholder] ⚠️
- **[Incident Response](./INCIDENT_RESPONSE.md)** - On-call procedures [Placeholder] ⚠️
- **[Runbook](./RUNBOOK.md)** - Production troubleshooting [Placeholder] ⚠️
- **[Scaling Guide](./SCALING_GUIDE.md)** - Horizontal scaling [Placeholder]

### 🔒 For Security & Compliance
- **[Security Policy](./SECURITY.md)** - Security guidelines and vulnerability reporting
- **[Security Threat Model](./SECURITY_THREAT_MODEL.md)** - Attack vectors and mitigations [Placeholder] ⚠️
- **[Penetration Testing Guide](./PENETRATION_TESTING_GUIDE.md)** - Security testing [Placeholder]
- **[Data Protection & Compliance](./DATA_PROTECTION_COMPLIANCE.md)** - GDPR compliance [Placeholder] ⚠️

### 💾 For Database & Data
- **[Database Schema](./DATABASE_SCHEMA.md)** - Complete schema documentation [Placeholder] ⚠️
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Database migrations [Placeholder] ⚠️
- **[Data Dictionary](./DATA_DICTIONARY.md)** - Field definitions [Placeholder]

### 🧪 For Testing & QA
- **[Testing Strategy](./TESTING_STRATEGY.md)** - Testing standards [Placeholder]
- **[Test Writing Guide](./TEST_WRITING_GUIDE.md)** - How to write tests [Placeholder]
- **[E2E Testing](./E2E_TESTING.md)** - End-to-end testing [Placeholder]

📋 **[Full Documentation Index](./docs/README.md)** - Complete list of all documentation

⚠️ **Note:** Documents marked with [Placeholder] require content creation. Documents marked with ⚠️ are critical for production launch.

## 📚 Project Structure

```
CreatorStudioLite/
├── api/                    # API endpoints (auth, webhooks)
├── docs/                   # 📖 Documentation
│   ├── ARCHITECTURE.md    # System architecture
│   ├── COMPONENTS.md      # Component library
│   ├── DEVELOPMENT.md     # Development guide
│   └── README.md          # Documentation index
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

- **Documentation**: Check the comprehensive guides in `/docs` directory
  - [Architecture](./docs/ARCHITECTURE.md) - System design and patterns
  - [Components](./docs/COMPONENTS.md) - UI component guide
  - [Development](./docs/DEVELOPMENT.md) - Getting started
- **Product Roadmap**: See [Feature Recommendation](./docs/FEATURE_RECOMMENDATION_QUICK_REF.md) for next planned features
- **Issues**: Report bugs via [GitHub Issues](https://github.com/Krosebrook/CreatorStudioLite/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/Krosebrook/CreatorStudioLite/discussions)

## 🗺️ Roadmap

- [x] Phase 1: Core architecture and authentication
- [x] Phase 2: Multi-platform connectors
- [x] Phase 5: Analytics, monetization, and enterprise features
- [ ] **Phase 6: Enhanced AI content generation** (Next - Q1 2026)
- [ ] **Phase 7: Advanced analytics and predictive insights** (Next - Q1 2026)
- [ ] Phase 8: Advanced automation workflows
- [ ] Phase 9: Mobile application
- [ ] Phase 10: Custom integrations API
- [ ] Phase 11: WhiteLabel solutions

📋 **[View Strategic Feature Analysis & Roadmap](./docs/FEATURE_RECOMMENDATION_QUICK_REF.md)**

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
