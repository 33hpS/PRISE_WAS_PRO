// scripts/build.mjs
import { writeFileSync, mkdirSync, existsSync, copyFileSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')

console.log('🏗️ Simple build starting...')

// Создаем dist папку
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Создаем простой main.js
const simpleJS = `
console.log('WASSER PRO Loading...');

// Простая заглушка для React приложения
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
              Приложение развертывается...
            </div>
            <p class="text-gray-500 text-sm mt-4">
              Полная версия будет доступна после завершения настройки
            </p>
          </div>
        </div>
      </div>
    \`;
  }
});
`;

// Используем содержимое shadcn.css с Tailwind CDN
const shadcnCSS = `
@import url('https://cdn.tailwindcss.com');

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --sidebar-background: 240 5.9% 10%;
  --sidebar-foreground: 240 4.8% 95.9%;
  --sidebar-primary: 224.3 76.3% 48%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 3.7% 15.9%;
  --sidebar-accent-foreground: 240 4.8% 95.9%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
  overscroll-behavior: none;
  font-synthesis-weight: none;
}

html > body * {
  border-color: hsl(var(--border));
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 5px;
}

* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

/* Дополнительные стили для анимации */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

// Создаем простой index.html БЕЗ EventSource
const simpleHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WASSER PRO</title>
    <link href="main.css" rel="stylesheet">
  </head>
  <body>
    <div id="app">
      <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div class="text-white text-center">
          <div class="animate-pulse text-xl">Загрузка WASSER PRO...</div>
        </div>
      </div>
    </div>
    <script src="main.js"></script>
  </body>
</html>`;

// Записываем файлы
try {
  writeFileSync(resolve(distDir, 'main.js'), simpleJS)
  writeFileSync(resolve(distDir, 'main.css'), shadcnCSS)
  writeFileSync(resolve(distDir, 'index.html'), simpleHTML)
  
  console.log('✅ Created main.js')
  console.log('✅ Created main.css (shadcn + Tailwind)')
  console.log('✅ Created index.html')
  
  // Показываем содержимое dist для отладки
  import { readdirSync, statSync } from 'fs'
  const files = readdirSync(distDir)
  console.log('\n📂 Files in dist:')
  files.forEach(file => {
    const stats = statSync(resolve(distDir, file))
    console.log(`  ${file} (${stats.size} bytes)`)
  })
  
  console.log('\n✅ Shadcn build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}