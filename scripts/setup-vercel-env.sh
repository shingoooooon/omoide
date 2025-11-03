#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps set up environment variables for Vercel deployment

echo "🚀 Setting up Vercel environment variables for Omoide"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the omoide project root directory"
    exit 1
fi

echo "📝 This script will help you set up environment variables for Vercel deployment."
echo "   You'll need to provide values for each environment variable."
echo ""

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local is_secret=${3:-false}
    
    echo "Setting $var_name ($var_description):"
    read -p "Enter value: " var_value
    
    if [ -n "$var_value" ]; then
        if [ "$is_secret" = true ]; then
            vercel env add "$var_name" production <<< "$var_value"
        else
            vercel env add "$var_name" production <<< "$var_value"
        fi
        echo "✅ $var_name set successfully"
    else
        echo "⚠️  Skipping $var_name (empty value)"
    fi
    echo ""
}

echo "🔧 Setting up Firebase configuration..."
set_env_var "NEXT_PUBLIC_FIREBASE_API_KEY" "Firebase API Key"
set_env_var "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "Firebase Auth Domain (e.g., your-project.firebaseapp.com)"
set_env_var "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "Firebase Project ID"
set_env_var "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "Firebase Storage Bucket (e.g., your-project.appspot.com)"
set_env_var "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "Firebase Messaging Sender ID"
set_env_var "NEXT_PUBLIC_FIREBASE_APP_ID" "Firebase App ID"
set_env_var "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" "Firebase Analytics Measurement ID"

echo "🤖 Setting up OpenAI configuration..."
set_env_var "OPENAI_API_KEY" "OpenAI API Key" true

echo "☁️  Setting up Google Cloud configuration..."
set_env_var "GOOGLE_CLOUD_PROJECT_ID" "Google Cloud Project ID"
set_env_var "GOOGLE_CLOUD_PRIVATE_KEY" "Google Cloud Private Key (from service account JSON)" true
set_env_var "GOOGLE_CLOUD_CLIENT_EMAIL" "Google Cloud Client Email (from service account JSON)"

echo "🔐 Setting up Next.js configuration..."
set_env_var "NEXTAUTH_URL" "Production URL (e.g., https://your-domain.com)"
set_env_var "NEXTAUTH_SECRET" "NextAuth Secret (generate a random string)" true

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify your environment variables: vercel env ls"
echo "   2. Deploy your application: vercel --prod"
echo "   3. Check the deployment logs for any issues"
echo ""
echo "🔗 Useful commands:"
echo "   - List env vars: vercel env ls"
echo "   - Remove env var: vercel env rm [name]"
echo "   - Deploy: vercel --prod"
echo ""
echo "📚 For more information, visit:"
echo "   - Vercel Docs: https://vercel.com/docs"
echo "   - Firebase Setup: https://firebase.google.com/docs/web/setup"
echo "   - OpenAI API: https://platform.openai.com/api-keys"