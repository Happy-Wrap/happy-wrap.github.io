#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

try {
  console.log('🚀 Starting deployment to GitHub Pages...');
  
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if dist folder exists
  if (!existsSync('dist')) {
    throw new Error('Build failed: dist folder not found');
  }
  
  // Deploy to GitHub Pages
  console.log('🌐 Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist', { stdio: 'inherit' });
  
  console.log('✅ Deployment completed successfully!');
  console.log('🔗 Your site will be available at: https://happywrap.github.io/');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}