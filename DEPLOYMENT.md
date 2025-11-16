# Deployment Guide

This guide provides instructions for deploying the Amplify Creator Platform to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Cloud Platform Deployments](#cloud-platform-deployments)
- [Post-Deployment](#post-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project** configured and running
2. **Environment Variables** properly set
3. **Domain Name** (for production)
4. **SSL Certificate** (recommended for production)
5. **Stripe Account** (optional, for payment features)

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional: Analytics
VITE_ANALYTICS_ENABLED=true

# Optional: Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_TEAM_COLLABORATION=true
```

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3000
```

#### Staging
```env
NODE_ENV=staging
VITE_API_URL=https://staging.yourapp.com
```

#### Production
```env
NODE_ENV=production
VITE_API_URL=https://api.yourapp.com
```

## Deployment Options

### Docker Deployment

The easiest way to deploy is using Docker.

#### 1. Build the Docker Image

```bash
docker build -t amplify-creator-platform .
```

#### 2. Run with Docker Compose

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

#### 3. Docker Hub Deployment

```bash
# Tag the image
docker tag amplify-creator-platform your-dockerhub-username/amplify-creator-platform:latest

# Push to Docker Hub
docker push your-dockerhub-username/amplify-creator-platform:latest

# Pull and run on server
docker pull your-dockerhub-username/amplify-creator-platform:latest
docker run -d -p 80:80 --env-file .env your-dockerhub-username/amplify-creator-platform:latest
```

### Cloud Platform Deployments

#### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables** in Vercel dashboard

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Netlify Deployment

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure Environment Variables** in Netlify dashboard

#### AWS Deployment (S3 + CloudFront)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

3. **Upload files**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure S3 for static website hosting**:
   ```bash
   aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
   ```

5. **Create CloudFront distribution** for HTTPS and CDN

#### Google Cloud Platform (Cloud Run)

1. **Build and push Docker image**:
   ```bash
   gcloud builds submit --tag gcr.io/your-project-id/amplify-creator-platform
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy amplify-creator-platform \
     --image gcr.io/your-project-id/amplify-creator-platform \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

#### DigitalOcean App Platform

1. **Connect your GitHub repository** to DigitalOcean App Platform

2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set environment variables** in the DigitalOcean dashboard

4. **Deploy** - DigitalOcean will automatically build and deploy

#### Heroku Deployment

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

4. **Add buildpack**:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set VITE_SUPABASE_URL=your-url
   heroku config:set VITE_SUPABASE_ANON_KEY=your-key
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

## Post-Deployment

### 1. Database Setup

After deploying, run database migrations:

```bash
# Using Supabase CLI
npx supabase db push
```

Or manually execute the SQL files in `supabase/migrations/`

### 2. Configure Supabase Settings

1. **Enable Row Level Security (RLS)** on all tables
2. **Set up authentication providers** (Google, GitHub, etc.)
3. **Configure storage buckets** for media uploads
4. **Set up webhook endpoints** for real-time updates

### 3. DNS Configuration

Point your domain to your deployment:

- **A Record**: Point to your server IP (for traditional hosting)
- **CNAME Record**: Point to your cloud provider (for Vercel, Netlify, etc.)
- **CloudFlare**: Recommended for additional security and CDN

### 4. SSL Certificate

Ensure HTTPS is enabled:
- Most cloud providers (Vercel, Netlify) provide automatic SSL
- For custom servers, use Let's Encrypt or Cloudflare SSL

### 5. CORS Configuration

Update CORS settings in your Supabase project:
- Add your production domain to allowed origins
- Configure API endpoint CORS headers

## Health Checks

The application includes health check endpoints:

- **Docker**: `http://localhost/health`
- **Application**: Run `npm run health-check` to verify services

Monitor these endpoints to ensure the application is running correctly.

## Performance Optimization

### CDN Configuration

Use a CDN to serve static assets:
- CloudFront (AWS)
- Cloud CDN (GCP)
- Cloudflare
- Vercel Edge Network

### Caching Strategy

Configure caching headers in `nginx.conf`:
- Static assets: 1 year cache
- HTML: No cache (for SPA routing)
- API responses: Custom cache based on endpoint

### Bundle Optimization

The build process automatically:
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Code splits for optimal loading
- Compresses assets with gzip

## Monitoring and Maintenance

### Logging

Set up logging for:
- Application errors
- API requests
- User authentication events
- Payment transactions

Recommended tools:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for infrastructure monitoring
- **Supabase Dashboard** for database monitoring

### Performance Monitoring

Monitor key metrics:
- Page load time
- Time to interactive
- API response times
- Database query performance

Tools:
- **Google Lighthouse**
- **WebPageTest**
- **New Relic**
- **Grafana**

### Backup Strategy

Regular backups:
1. **Database**: Daily automatic backups via Supabase
2. **Media Files**: Regular S3/Storage bucket backups
3. **Configuration**: Store in version control

### Security Updates

Maintain security:
1. **Dependencies**: Run `npm audit` weekly
2. **Security Patches**: Apply promptly
3. **Supabase**: Keep updated to latest stable version
4. **SSL Certificates**: Monitor expiration dates

### Scaling Considerations

As your application grows:
1. **Database**: Consider Supabase Pro plan or dedicated instance
2. **Media Storage**: Use CDN for media delivery
3. **Caching**: Implement Redis for session/data caching
4. **Load Balancing**: Add multiple application instances
5. **Database Read Replicas**: For read-heavy workloads

## Rollback Procedure

If a deployment fails:

1. **Vercel/Netlify**: Use dashboard to revert to previous deployment
2. **Docker**: 
   ```bash
   docker pull your-image:previous-tag
   docker-compose up -d
   ```
3. **Traditional Server**: Restore from backup or redeploy previous version

## CI/CD Pipeline

The project includes GitHub Actions workflows:
- **CI**: Runs on every PR (lint, build, test)
- **Security**: CodeQL scanning for vulnerabilities

Consider setting up automated deployments:
- Deploy to staging on merge to `develop`
- Deploy to production on merge to `main`

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/Krosebrook/CreatorStudioLite/issues)
- Review [SECURITY.md](SECURITY.md) for security concerns
- Consult [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

---

**Last Updated**: 2025
**Version**: 1.0.0
