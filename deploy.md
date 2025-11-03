# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare production API keys and configuration

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `omoide` folder as the root directory

### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Configuration
OPENAI_API_KEY=your_production_openai_api_key

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your_production_google_cloud_project_id
GOOGLE_CLOUD_PRIVATE_KEY=your_production_google_cloud_private_key
GOOGLE_CLOUD_CLIENT_EMAIL=your_production_google_cloud_client_email

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
```

### 3. Build Configuration

The project is configured with:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Framework**: Next.js

### 4. Custom Domain Setup

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records:
   - **Type**: CNAME
   - **Name**: www (or @)
   - **Value**: cname.vercel-dns.com

### 5. SSL Certificate

Vercel automatically provides SSL certificates for:
- *.vercel.app domains
- Custom domains (Let's Encrypt)

## Build Optimization

### Performance Settings

The project includes:
- Image optimization with WebP/AVIF formats
- Bundle analysis (set `ANALYZE=true`)
- Static asset caching (31536000 seconds)
- Compression enabled

### Security Headers

Configured security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Deployment Automation

### Automatic Deployments

- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches
- **Development**: Local development with `npm run dev`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## Monitoring Setup

After deployment, configure:
1. Vercel Analytics (built-in)
2. Firebase Analytics
3. Error tracking with Vercel Functions logs

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify API keys are valid
   - Review build logs in Vercel dashboard

2. **Runtime Errors**
   - Check Function logs in Vercel dashboard
   - Verify Firebase configuration
   - Test API endpoints individually

3. **Performance Issues**
   - Use Vercel Analytics
   - Check bundle size with `ANALYZE=true`
   - Monitor Core Web Vitals

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)