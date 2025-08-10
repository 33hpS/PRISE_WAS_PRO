// scripts/build.mjs
import { execSync } from 'child_process'
import esbuild from 'esbuild'
import { mkdirSync, existsSync, copyFileSync, writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const isProduction = process.argv.includes('--production')
const outDir = resolve(rootDir, 'dist')

console.log(`🏗️  Building for ${isProduction ? 'production' : 'development'}...`)

// Создаем директорию dist
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true })
}

// Автоматически исправляем импорты react-router
function fixImports() {
  const files = [
    'src/App.tsx',
    'src/layouts/AppShell.tsx', 
    'src/pages/Home.tsx'
  ]
  
  files.forEach(file => {
    const filePath = resolve(rootDir, file)
    if (existsSync(filePath)) {
      try {
        let content = readFileSync(filePath, 'utf8')
        const updated = content.replace(/from ['"]react-router['"]/g, 'from "react-router-dom"')
        if (content !== updated) {
          writeFileSync(filePath, updated)
          console.log(`✅ Fixed imports in ${file}`)
        }
      } catch (e) {
        console.log(`⚠️  Could not fix imports in ${file}`)
      }
    }
  })
}

try {
  // Исправляем импорты
  fixImports()
  
  // Проверяем входные файлы
  const srcMain = resolve(rootDir, 'src/main.tsx')
  const srcCSS = resolve(rootDir, 'src/shadcn.css')
  const indexHTML = resolve(rootDir, 'index.html')
  
  if (!existsSync(srcMain)) {
    throw new Error(`Entry point not found: ${srcMain}`)
  }
  
  console.log(`📝 Building JavaScript from: ${srcMain}`)
  
  // Сборка JavaScript с CDN fallback для отсутствующих зависимостей
  await esbuild.build({
    entryPoints: [srcMain],
    bundle: true,
    outfile: resolve(outDir, 'main.js'),
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    loader: {
      '.tsx': 'tsx',
      '.ts': 'tsx',
      '.css': 'css',
      '.svg': 'dataurl',
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.gif': 'dataurl',
      '.webp': 'dataurl',
    },
    define: {
      'process.env.NODE_ENV': `"${isProduction ? 'production' : 'development'}"`,
    },
    jsx: 'automatic',
    // Внешние зависимости - будут загружены через CDN
    external: [
      'react-router-dom',
      'lucide-react', 
      'i18next',
      'react-i18next',
      'sonner',
      'xlsx',
      '@supabase/supabase-js'
    ]
  })
  console.log(`✅ JavaScript build complete`)

  // Обработка CSS
  if (existsSync(srcCSS)) {
    let cssContent = readFileSync(srcCSS, 'utf8')
    
    // Простая замена Tailwind директив на CDN
    if (isProduction) {
      cssContent = cssContent.replace(
        /@tailwind base;\s*@tailwind components;\s*@tailwind utilities;/,
        '@import "https://cdn.tailwindcss.com";'
      )
    }
    
    writeFileSync(resolve(outDir, 'main.css'), cssContent)
    console.log(`✅ CSS processing complete`)
  }

  // Создаем index.html с CDN зависимостями
  let indexContent = existsSync(indexHTML) ? readFileSync(indexHTML, 'utf8') : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WASSER PRO</title>
  <link href="main.css" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
</html>
  `

  // Добавляем CDN скрипты перед main.js
  const cdnScripts = `
  <!-- CDN Dependencies -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
  <script crossorigin src="https://unpkg.com/sonner@latest/dist/index.umd.js"></script>
  <script crossorigin src="https://unpkg.com/xlsx@latest/dist/xlsx.full.min.js"></script>
  <script crossorigin src="https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script crossorigin src="https://unpkg.com/i18next@latest/dist/umd/i18next.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-i18next@latest/dist/umd/react-i18next.min.js"></script>
  `

  indexContent = indexContent.replace(
    '<script src="main.js"></script>',
    cdnScripts + '\n  <script src="main.js"></script>'
  )

  writeFileSync(resolve(outDir, 'index.html'), indexContent)
  console.log(`✅ Created index.html with CDN dependencies`)

  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}