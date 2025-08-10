// scripts/build.mjs
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')

console.log('🏗️ Building for Cloudflare Pages...')

// Создаем dist папку
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Создаем _headers файл для правильных MIME типов
const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/*.js
  Content-Type: application/javascript

/*.css  
  Content-Type: text/css

/*.html
  Content-Type: text/html; charset=utf-8`

// JavaScript код
const mainJS = `console.log('WASSER PRO Loading...');

document.addEventListener('DOMContentLoaded', function() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = \`
      <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">WASSER PRO</h1>
            <p class="text-gray-600 text-lg">Система управления мебельным производством</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Основные функции:</h3>
            <div class="grid gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">📋</div>
                <span class="text-gray-700">Управление коллекциями изделий</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">🏭</div>
                <span class="text-gray-700">Каталог материалов и компонентов</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">💰</div>
                <span class="text-gray-700">Калькулятор себестоимости</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">📊</div>
                <span class="text-gray-700">Генерация прайс-листов (PDF/Excel)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">🔄</div>
                <span class="text-gray-700">Синхронизация с Supabase</span>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Приложение развернуто успешно! ✅
            </div>
            <p class="text-gray-500 text-sm mt-4">
              <strong>Версия:</strong> Cloudflare Pages Deploy
            </p>
          </div>
        </div>
      </div>
    \`;
  }
});`;

// Читаем оригинальный shadcn.css и заменяем Tailwind директивы на CDN
let mainCSS = ''
const shadcnPath = resolve(rootDir, 'src/shadcn.css')

if (existsSync(shadcnPath)) {
  console.log('📝 Reading src/shadcn.css...')
  let cssContent = readFileSync(shadcnPath, 'utf8')
  
  // Заменяем Tailwind директивы на CDN импорт
  cssContent = cssContent.replace(
    /@tailwind base;\s*@tailwind components;\s*@tailwind utilities;/,
    '@import url("https://cdn.tailwindcss.com");'
  )
  
  // Добавляем анимацию pulse если её нет
  if (!cssContent.includes('@keyframes pulse')) {
    cssContent += `

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}`
  }
  
  mainCSS = cssContent
  console.log('✅ Processed shadcn.css with Tailwind CDN')
} else {
  console.log('⚠️ src/shadcn.css not found, using fallback CSS')
  mainCSS = `@import url("https://cdn.tailwindcss.com");

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --border: 0 0% 89.8%;
  --radius: 0.5rem;
}

html { scroll-behavior: smooth; font-size: 16px; }
body { color: hsl(var(--foreground)); background-color: hsl(var(--background)); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`
}

// Читаем и обрабатываем index.html
let indexHTML = ''
const indexPath = resolve(rootDir, 'index.html')

if (existsSync(indexPath)) {
  console.log('📝 Reading index.html...')
  let htmlContent = readFileSync(indexPath, 'utf8')
  
  // Удаляем EventSource скрипт
  htmlContent = htmlContent.replace(
    /<script>[\s\S]*?new EventSource[\s\S]*?<\/script>/g,
    ''
  )
  
  // Обновляем title
  htmlContent = htmlContent.replace(
    /<title>.*?<\/title>/,
    '<title>WASSER PRO</title>'
  )
  
  // Добавляем fallback содержимое в #app если его нет
  if (!htmlContent.includes('min-h-screen')) {
    htmlContent = htmlContent.replace(
      '<div id="app"></div>',
      `<div id="app">
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-family: system-ui, sans-serif;">
        <div style="text-align: center;">
          <div style="font-size: 1.25rem; animation: pulse 2s infinite;">Загрузка WASSER PRO...</div>
        </div>
      </div>
    </div>`
    )
  }
  
  indexHTML = htmlContent
  console.log('✅ Processed index.html (removed EventSource)')
} else {
  console.log('⚠️ index.html not found, creating default')
  indexHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WASSER PRO</title>
    <link href="main.css" rel="stylesheet">
  </head>
  <body>
    <div id="app">
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-family: system-ui, sans-serif;">
        <div style="text-align: center;">
          <div style="font-size: 1.25rem; animation: pulse 2s infinite;">Загрузка WASSER PRO...</div>
        </div>
      </div>
    </div>
    <script src="main.js"></script>
  </body>
</html>`
}

try {
  // Записываем основные файлы
  writeFileSync(resolve(distDir, 'main.js'), mainJS)
  writeFileSync(resolve(distDir, 'main.css'), mainCSS)
  writeFileSync(resolve(distDir, 'index.html'), indexHTML)
  writeFileSync(resolve(distDir, '_headers'), headersContent)
  
  console.log('✅ Created main.js')
  console.log('✅ Created main.css')
  console.log('✅ Created index.html')
  console.log('✅ Created _headers')
  
  // Показываем содержимое
  const files = readdirSync(distDir)
  console.log('\n📂 Files in dist:')
  files.forEach(file => {
    const stats = statSync(resolve(distDir, file))
    console.log(`  ${file} (${stats.size} bytes)`)
  })
  
  console.log('\n✅ Build completed for Cloudflare Pages!')
  console.log('🚫 EventSource removed from production build')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}