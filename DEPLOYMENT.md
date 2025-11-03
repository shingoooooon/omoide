# Omoide Deployment Guide

This guide covers the deployment process for the Omoide application to production environments.

## Quick Start

1. **Setup Environment Variables**
   ```bash
   npm run setup:vercel
   ```

2. **Deploy to Vercel**
   ```bash
   npm run deploy
   ```

3. **Run Health Check**
   ```bash
   npm run health-check
   ```

## Deployment Platforms

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments, edge functions, and global CDN.

#### Prerequisites

- [Vercel CLI](https://vercel.com/cli) installed globally
- GitHub repository connected to Vercel
- Environment variables configured

#### Step-by-Step Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**
   ```bash
   npm run setup:vercel
   ```
   
   Or manually set them in the Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `OPENAI_API_KEY`
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_PRIVATE_KEY`
   - `GOOGLE_CLOUD_CLIENT_EMAIL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Verify Deployment**
   ```bash
   npm run health-check -- --url https://your-domain.vercel.app
   ```

#### Custom Domain Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Configure DNS records as instructed
5. SSL certificate will be automatically provisioned

### Docker Deployment

For self-hosted deployments, you can use the provided Dockerfile.

#### Build Docker Image

```bash
docker build -t omoide \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
  --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id \
  .
```

#### Run Container

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_key \
  -e GOOGLE_CLOUD_PROJECT_ID=your_project_id \
  -e GOOGLE_CLOUD_PRIVATE_KEY=your_private_key \
  -e GOOGLE_CLOUD_CLIENT_EMAIL=your_client_email \
  -e NEXTAUTH_URL=https://your-domain.com \
  -e NEXTAUTH_SECRET=your_secret \
  omoide
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `my-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID | `G-XXXXXXXXXX` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud Project ID | `my-project-id` |
| `GOOGLE_CLOUD_PRIVATE_KEY` | Google Cloud Service Account Private Key | `-----BEGIN PRIVATE KEY-----...` |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | Google Cloud Service Account Email | `service@project.iam.gserviceaccount.com` |
| `NEXTAUTH_URL` | Production URL | `https://your-domain.com` |
| `NEXTAUTH_SECRET` | NextAuth Secret | Random string |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VERCEL_URL` | Vercel deployment URL | Auto-set by Vercel |
| `NODE_ENV` | Environment | `production` |

## Monitoring and Analytics

The application includes built-in monitoring and analytics:

### Firebase Analytics
- Automatically tracks user interactions
- Monitors performance metrics
- Provides user behavior insights

### Error Tracking
- Captures and logs application errors
- Provides error context and stack traces
- Integrates with Firebase Analytics

### Performance Monitoring
- Tracks Core Web Vitals
- Monitors API response times
- Measures user engagement metrics

### Development Monitoring Dashboard

In development mode, access the monitoring dashboard by clicking the 📊 button in the bottom-right corner.

## CI/CD Pipeline

The project includes GitHub Actions for automated testing and deployment:

### Workflow Features
- Automated testing on pull requests
- Type checking and linting
- Automatic deployment to Vercel on main branch
- Health checks after deployment

### Setup GitHub Actions

1. Add repository secrets in GitHub:
   - All environment variables listed above
   - `VERCEL_TOKEN` (from Vercel dashboard)
   - `VERCEL_ORG_ID` (from Vercel dashboard)
   - `VERCEL_PROJECT_ID` (from Vercel dashboard)

2. Push to main branch to trigger deployment

## Health Checks

After deployment, run health checks to ensure everything is working:

```bash
# Check default deployment
npm run health-check

# Check specific URL
npm run health-check -- --url https://your-domain.com

# Check with custom timeout
TIMEOUT=15000 npm run health-check
```

The health check verifies:
- ✅ Application loads correctly
- ✅ Critical pages are accessible
- ✅ API endpoints respond
- ✅ Performance metrics
- ✅ Security headers

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify API keys are valid and have proper permissions
   - Review build logs in Vercel dashboard

2. **Runtime Errors**
   - Check Function logs in Vercel dashboard
   - Verify Firebase configuration
   - Test API endpoints individually

3. **Performance Issues**
   - Use Vercel Analytics to identify bottlenecks
   - Check bundle size with `npm run build:analyze`
   - Monitor Core Web Vitals

4. **Authentication Issues**
   - Verify Firebase Auth configuration
   - Check domain settings in Firebase console
   - Ensure NEXTAUTH_URL matches deployment URL

### Getting Help

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Consult [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)

## Security Considerations

- All sensitive environment variables are properly secured
- API keys are restricted to specific domains/IPs where possible
- HTTPS is enforced for all production traffic
- Security headers are configured in `next.config.ts`
- Firebase Security Rules are properly configured

## Performance Optimization

The application is optimized for production with:

- ✅ Static generation where possible
- ✅ Image optimization with Next.js Image component
- ✅ Bundle splitting and code optimization
- ✅ CDN delivery via Vercel Edge Network
- ✅ Compression and caching headers
- ✅ Core Web Vitals monitoring

## Scaling Considerations

For high-traffic deployments:

1. **Database**: Consider Firebase Firestore scaling limits
2. **Storage**: Monitor Firebase Storage usage and costs
3. **API Limits**: Monitor OpenAI API usage and rate limits
4. **Vercel**: Consider Pro plan for higher limits
5. **Monitoring**: Set up alerts for error rates and performance