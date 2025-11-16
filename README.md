# Amplify (formerly SparkLabs)

The all-in-one creator platform for content creation, publishing, and monetization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([sign up here](https://supabase.com))
- Optional: API keys for social platforms and AI services

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Krosebrook/CreatorStudioLite.git
cd CreatorStudioLite
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:
   - **Required**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - **Optional**: Add API keys for platforms you want to use

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## 📦 Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🔐 Environment Variables

See `.env.example` for a complete list of supported environment variables.

### Required Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional Platform Integrations
- YouTube, Instagram, TikTok, LinkedIn, Pinterest (OAuth)
- OpenAI, Anthropic (API keys)
- Stripe (for payments)
- AWS S3 (for media storage)

## 🌐 Deploying to Blink.new

This project is optimized for [Blink.new](https://blink.new) deployment:

1. Push your code to GitHub
2. Import the repository in Blink.new
3. Configure environment variables in the Blink.new dashboard
4. Deploy!

### Blink.new Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run smoke tests
- `npm run health-check` - Check system health

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Context API
- **API Integration**: Modular connectors for social platforms

## 📚 Key Features

- ✅ Multi-platform content publishing (YouTube, TikTok, Instagram, LinkedIn, Pinterest)
- ✅ AI-powered content generation (OpenAI, Anthropic)
- ✅ Design tool integration (Canva, Figma)
- ✅ Analytics dashboard
- ✅ Subscription management (Stripe)
- ✅ Team collaboration
- ✅ Audit logging
- ✅ Export/Import functionality

## 🔒 Security

- All sensitive credentials should be stored in environment variables
- Never commit `.env` files to version control
- Use Row Level Security (RLS) in Supabase
- OAuth tokens are handled securely through Supabase Auth

## 📖 Documentation

- [Phase 1 Completion](./PHASE_1_COMPLETE.md)
- [Phase 2 Completion](./PHASE_2_COMPLETE.md)
- [Phase 5 Completion](./PHASE_5_COMPLETE.md)
- [Refactor Debug Notes](./REFACTOR_DEBUG_COMPLETE.md)

## 🐛 Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Update browserslist: `npx update-browserslist-db@latest`

### Development Issues
- Check Supabase credentials are valid
- Verify network connectivity to external APIs
- Check browser console for detailed error messages

## 📄 License

Private - All Rights Reserved

## 🤝 Contributing

This is a private repository. For questions or issues, please contact the repository owner.