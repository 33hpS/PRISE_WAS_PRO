// scripts/build.mjs
import { build } from 'esbuild'
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')

console.log('🏗️ Building WASSER PRO for Cloudflare Pages...')
console.log('📁 Root:', rootDir)
console.log('📁 Output:', distDir)

const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production'
console.log('🎯 Mode:', isProduction ? 'Production' : 'Development')

// Пересоздаем dist
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true })
  console.log('🗑️ Removed existing dist directory')
}
mkdirSync(distDir, { recursive: true })
console.log('📁 Created dist directory')

try {
  // Проверяем наличие src/main.tsx
  const entryPoint = resolve(rootDir, 'src/main.tsx')
  if (!existsSync(entryPoint)) {
    throw new Error(`❌ Entry point not found: ${entryPoint}`)
  }
  console.log('✅ Found entry point:', entryPoint)

  // 1. Сборка JavaScript с React
  console.log('📦 Building JavaScript bundle...')
  await build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: resolve(distDir, 'main.js'),
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    define: {
      'process.env.NODE_ENV': `"${isProduction ? 'production' : 'development'}"`,
      'global': 'globalThis',
    },
    loader: {
      '.tsx': 'tsx',
      '.ts': 'tsx',
      '.jsx': 'jsx',
      '.js': 'jsx',
      '.css': 'css',
      '.svg': 'dataurl',
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.gif': 'dataurl',
      '.webp': 'dataurl',
    },
    jsx: 'automatic',
    jsxDev: !isProduction,
    external: [], // Все зависимости встроены
    logLevel: 'info',
  })
  
  console.log('✅ JavaScript bundle created successfully')

  // 2. Обработка CSS
  console.log('🎨 Processing CSS...')
  const cssPath = resolve(rootDir, 'src/shadcn.css')
  let cssContent = ''
  
  if (existsSync(cssPath)) {
    cssContent = readFileSync(cssPath, 'utf8')
    console.log('📝 Found src/shadcn.css')
    
    // Заменяем Tailwind директивы на CDN
    cssContent = cssContent.replace(
      /@tailwind\s+base;\s*@tailwind\s+components;\s*@tailwind\s+utilities;/g,
      '@import url("https://cdn.tailwindcss.com");'
    )
    
    console.log('✅ Processed shadcn.css with Tailwind CDN')
  } else {
    console.log('⚠️ src/shadcn.css not found, using fallback')
    cssContent = `@import url("https://cdn.tailwindcss.com");

/* Fallback shadcn variables */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --border: 0 0% 89.8%;
  --radius: 0.5rem;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}`
  }
  
  writeFileSync(resolve(distDir, 'main.css'), cssContent)
  console.log('✅ CSS file created')

  // 3. Создание HTML
  console.log('📄 Creating HTML...')
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WASSER PRO v4.1.0</title>
  <meta name="description" content="Система управления мебельным производством">
  <link rel="stylesheet" href="main.css">
  
  <!-- Performance hints -->
  <link rel="preconnect" href="https://cdn.tailwindcss.com">
  
  <!-- PWA meta -->
  <meta name="theme-color" content="#2563eb">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  
  <!-- Security -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
</head>
<body>
  <div id="app">
    <!-- Fallback loading screen -->
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="text-align: center;">
        <div style="
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">WASSER PRO</h1>
        <p style="opacity: 0.8;">Загрузка приложения...</p>
      </div>
    </div>
  </div>
  
  <script src="main.js"></script>
  
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</body>
</html>`

  writeFileSync(resolve(distDir, 'index.html'), htmlContent)
  console.log('✅ HTML file created')

  // 4. Создание _headers для правильных MIME типов
  const headersContent = `# Cloudflare Pages Headers for WASSER PRO
/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: public, max-age=300

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()`

  writeFileSync(resolve(distDir, '_headers'), headersContent)
  console.log('✅ Security headers created')

  // 5. Создание _redirects для SPA routing
  const redirectsContent = `# SPA Redirects for WASSER PRO
/*    /index.html   200`

  writeFileSync(resolve(distDir, '_redirects'), redirectsContent)
  console.log('✅ SPA redirects created')

  // 6. Финальная информация
  console.log('\n🎉 WASSER PRO Build Complete!')
  console.log(`📊 Mode: ${isProduction ? 'Production' : 'Development'}`)
  console.log('📁 Files created in dist/:')
  console.log('   ✓ main.js (React bundle)')
  console.log('   ✓ main.css (Tailwind + shadcn)')
  console.log('   ✓ index.html (SPA shell)')
  console.log('   ✓ _headers (Security)')
  console.log('   ✓ _redirects (SPA routing)')
  
  console.log('\n🚀 Ready for Cloudflare Pages deployment!')

} catch (error) {
  console.error('❌ Build failed:', error)
  
  if (error.message?.includes('Could not resolve')) {
    console.error('\n💡 Missing dependencies detected!')
    console.error('   Solution: Check if all dependencies are installed')
  }
  
  if (error.message?.includes('Entry point not found')) {
    console.error('\n💡 Source files missing!')
    console.error('   Solution: Make sure src/main.tsx exists')
  }
  
  console.error('\nFull error details:', error.stack)
  process.exit(1)
}