const esbuild = require('esbuild')
const { readdirSync, statSync } = require('fs')
const { join } = require('path')

// Функция для поиска всех TS/TSX файлов
function findSourceFiles(dir, files = []) {
  const items = readdirSync(dir)
  for (const item of items) {
    const fullPath = join(dir, item)
    if (statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findSourceFiles(fullPath, files)
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

const isProduction = process.env.NODE_ENV === 'production'

async function build() {
  try {
    // Основная сборка JS
    await esbuild.build({
      entryPoints: ['./src/main.tsx'],
      bundle: true,
      outfile: './main.js',
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      minify: isProduction,
      sourcemap: !isProduction,
      loader: {
        '.tsx': 'tsx',
        '.ts': 'tsx',
        '.svg': 'dataurl',
        '.png': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.gif': 'dataurl',
        '.webp': 'dataurl',
      },
      define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'production'}"`,
      },
      jsx: 'automatic',
      external: [], // Убедитесь что все зависимости бандлятся
    })

    // Сборка CSS (если есть отдельные CSS файлы)
    await esbuild.build({
      entryPoints: ['./src/main.css'],
      bundle: true,
      outfile: './main.css',
      minify: isProduction,
      loader: {
        '.css': 'css',
      },
    })

    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()