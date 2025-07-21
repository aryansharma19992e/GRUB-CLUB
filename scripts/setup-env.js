#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🚀 Grub Club Environment Setup')
console.log('================================\n')

// Generate secure secrets
const jwtSecret = crypto.randomBytes(64).toString('hex')
const nextAuthSecret = crypto.randomBytes(32).toString('hex')

const envContent = `# ========================================
# Grub Club - Development Environment
# ========================================

# Authentication
JWT_SECRET=${jwtSecret}
NEXTAUTH_SECRET=${nextAuthSecret}

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/grubclub

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ========================================
# Future Implementation Variables
# ========================================

# File Storage (AWS S3)
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=grubclub-uploads

# Email Service (Gmail SMTP)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Payment Gateway (Razorpay)
# RAZORPAY_KEY_ID=your-razorpay-key-id
# RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# Google Maps API
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Push Notifications (Firebase)
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_PRIVATE_KEY=your-firebase-private-key
# FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Redis (for caching and sessions)
# REDIS_URL=redis://localhost:6379
`

const envPath = path.join(process.cwd(), '.env.local')

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists!')
    const answer = require('readline-sync').question('Do you want to overwrite it? (y/N): ')
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.')
      process.exit(0)
    }
  }

  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local created successfully!')
  console.log('🔐 Secure JWT and NextAuth secrets generated')
  console.log('\n📋 Next steps:')
  console.log('1. Start MongoDB: brew services start mongodb-community')
  console.log('2. Install dependencies: pnpm install')
  console.log('3. Seed database: pnpm seed')
  console.log('4. Start development: pnpm dev')
  console.log('\n🎉 Happy coding!')

} catch (error) {
  console.error('❌ Error creating .env.local:', error.message)
  process.exit(1)
} 