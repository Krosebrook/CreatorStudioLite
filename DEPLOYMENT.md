# 🚀 Deployment Guide - Amplify

This guide covers deployment to Blink.new and other production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Deploying to Blink.new](#deploying-to-blinknew)
- [Environment Configuration](#environment-configuration)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Services
1. **Supabase Account** (Required)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **GitHub Account** (Required for Blink.new)
   - Repository must be accessible to Blink.new

### Optional Services (based on features needed)
- YouTube API (for YouTube integration)
- TikTok Developer Account (for TikTok integration)
- Instagram Business/Creator Account (for Instagram integration)
- LinkedIn Developer App (for LinkedIn integration)
- Pinterest Developer Account (for Pinterest integration)
- OpenAI API Key (for AI content generation)
- Anthropic API Key (for Claude AI)
- Stripe Account (for payment processing)
- AWS S3 Account (for media storage)

## Deploying to Blink.new

### Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. Verify `.env` is in `.gitignore` (it should be by default)

### Step 2: Import to Blink.new

1. Visit [blink.new](https://blink.new)
2. Click "New Project" or "Import Project"
3. Connect your GitHub account if not already connected
4. Select the `Krosebrook/CreatorStudioLite` repository
5. Choose your branch (usually `main`)

### Step 3: Configure Build Settings

In Blink.new project settings, configure:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Step 4: Environment Variables

Add the following environment variables in Blink.new dashboard:

#### Required Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Application Configuration
```env
VITE_APP_NAME=Amplify
VITE_APP_URL=https://your-domain.blink.new
VITE_LOG_LEVEL=warn
VITE_ENABLE_ANALYTICS=true
```

#### Optional Platform Credentials
Add only the platforms you need:
```env
# YouTube
VITE_YOUTUBE_CLIENT_ID=your_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_client_secret

# Instagram
VITE_INSTAGRAM_CLIENT_ID=your_client_id
VITE_INSTAGRAM_CLIENT_SECRET=your_client_secret

# TikTok
VITE_TIKTOK_CLIENT_KEY=your_client_key
VITE_TIKTOK_CLIENT_SECRET=your_client_secret

# LinkedIn
VITE_LINKEDIN_CLIENT_ID=your_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_client_secret

# Pinterest
VITE_PINTEREST_CLIENT_ID=your_client_id
VITE_PINTEREST_CLIENT_SECRET=your_client_secret

# AI Services
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Payments
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Storage
VITE_AWS_S3_BUCKET=your-bucket-name
VITE_AWS_REGION=us-east-1
```

### Step 5: Deploy

1. Click "Deploy" in Blink.new
2. Wait for build to complete (typically 2-3 minutes)
3. Visit your deployment URL

## Environment Configuration

### Setting Up Supabase

1. **Create Tables**: Run migrations in Supabase SQL Editor
   - User profiles
   - Workspaces
   - Content
   - Analytics
   - Subscriptions
   - Usage tracking
   - Audit logs

2. **Enable Row Level Security (RLS)**: Ensure RLS is enabled on all tables

3. **Configure Storage Buckets**:
   - Create a `media` bucket for user uploads
   - Set appropriate policies for authenticated users

4. **Set Up OAuth Providers** (if using social auth):
   - Enable Google, GitHub, or other providers in Supabase Auth settings

### Configuring OAuth Callbacks

For each social platform, configure OAuth redirect URIs:

**Format**: `https://your-domain.blink.new/api/auth/callback/{platform}`

Examples:
- YouTube: `https://your-domain.blink.new/api/auth/callback/youtube`
- Instagram: `https://your-domain.blink.new/api/auth/callback/instagram`
- TikTok: `https://your-domain.blink.new/api/auth/callback/tiktok`
- LinkedIn: `https://your-domain.blink.new/api/auth/callback/linkedin`
- Pinterest: `https://your-domain.blink.new/api/auth/callback/pinterest`

### Stripe Webhook Configuration

If using Stripe:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.blink.new/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Production Checklist

### Before Going Live

- [ ] All required environment variables configured
- [ ] Supabase project set up with proper RLS policies
- [ ] OAuth redirect URIs configured for all platforms
- [ ] Stripe webhooks configured (if using payments)
- [ ] DNS records configured for custom domain (if applicable)
- [ ] SSL certificate active (Blink.new provides this automatically)
- [ ] Test all critical user flows
- [ ] Verify social platform connections work
- [ ] Test payment processing (if applicable)
- [ ] Review and accept terms of service for all integrated platforms

### Security Checklist

- [ ] All API keys are production keys (not test/development)
- [ ] Supabase RLS policies are properly configured
- [ ] No sensitive data in frontend code or logs
- [ ] HTTPS enforced on all pages
- [ ] Content Security Policy headers configured
- [ ] CORS settings properly configured
- [ ] Rate limiting enabled (if applicable)

### Performance Checklist

- [ ] Images optimized and using appropriate formats
- [ ] Lazy loading implemented for heavy components
- [ ] CDN configured for static assets
- [ ] Caching strategies implemented
- [ ] Database indexes created for frequent queries
- [ ] Bundle size optimized (check with `npm run build`)

## Monitoring & Maintenance

### Health Checks

Run health checks regularly:
```bash
npm run health-check
```

This validates:
- Environment variable configuration
- Database connectivity
- Connector availability
- Workflow system status
- RBAC configuration

### Monitoring Recommendations

1. **Error Tracking**: Consider integrating Sentry or similar service
   - Uncomment error tracking in `ErrorBoundary.tsx`
   - Add Sentry DSN to environment variables

2. **Analytics**: Monitor user behavior and performance
   - Google Analytics
   - Supabase Analytics
   - Custom analytics dashboard (built-in)

3. **Uptime Monitoring**: Use services like:
   - UptimeRobot
   - Pingdom
   - StatusCake

4. **Log Aggregation**: Consider using:
   - Supabase Logs
   - LogRocket
   - Datadog

### Regular Maintenance Tasks

**Weekly**:
- Review error logs
- Check API usage and quotas
- Monitor database performance
- Review audit logs

**Monthly**:
- Update dependencies: `npm update`
- Review and rotate API keys if necessary
- Backup Supabase database
- Review user feedback and bug reports

**Quarterly**:
- Security audit
- Performance optimization review
- Update documentation
- Review and update OAuth application permissions

## Troubleshooting

### Build Failures

**Issue**: Build fails with module not found errors
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue**: TypeScript compilation errors
```bash
# Solution: Check TypeScript version
npm install typescript@latest --save-dev
```

### Runtime Errors

**Issue**: Supabase connection fails
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify RLS policies don't block legitimate requests

**Issue**: OAuth redirects fail
- Verify redirect URIs match exactly in platform developer console
- Check domain is correct (no trailing slashes)
- Ensure HTTPS is enabled

**Issue**: API rate limits exceeded
- Implement caching for frequently accessed data
- Review API call patterns
- Consider upgrading API quotas

### Performance Issues

**Issue**: Slow initial load
- Enable code splitting in `vite.config.ts` (already configured)
- Optimize bundle size
- Use lazy loading for routes

**Issue**: Database queries slow
- Add database indexes
- Review and optimize queries
- Enable Supabase connection pooling

## Getting Help

- **Documentation**: Review `PHASE_*_COMPLETE.md` files
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **Blink.new Support**: Contact through their support channels

## Rollback Procedure

If deployment fails:

1. **In Blink.new**:
   - Go to Deployments tab
   - Find last successful deployment
   - Click "Redeploy" on that version

2. **In Git**:
```bash
# Find last working commit
git log --oneline
# Revert to that commit
git revert <commit-hash>
git push origin main
```

3. **Emergency Maintenance Mode**:
   - Set `VITE_MAINTENANCE_MODE=true` in environment variables
   - Deploy a simple maintenance page

---

## Quick Reference

### Essential Commands
```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Health check
npm run health-check

# Lint code
npm run lint
```

### Important URLs
- Supabase Dashboard: `https://supabase.com/dashboard`
- Stripe Dashboard: `https://dashboard.stripe.com`
- Blink.new Dashboard: `https://blink.new/dashboard`

### Support Contacts
- Project Repository: `https://github.com/Krosebrook/CreatorStudioLite`
- Issues: Create issue in GitHub repository

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
