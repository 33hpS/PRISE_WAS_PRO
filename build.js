// scripts/build.mjs
import esbuild from 'esbuild'
import { mkdirSync, existsSync, copyFileSync } from 'fs'
import { resolve } from 'path'

const isProduction = process.argv.includes('--production')
const outDir = './dist'

// Создаем директорию dist
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true })
}

try {
  // Сборка JavaScript
  await esbuild.build({
    entryPoints: ['./src/main.tsx'],
    bundle: true,
    outfile: `${outDir}/main.js`,
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
      'process.env.NODE_ENV': `"${isProduction ? 'production' : 'development'}"`,
    },
    jsx: 'automatic',
  })

  // Сборка CSS
  await esbuild.build({
    entryPoints: ['./src/main.css'],
    bundle: true,
    outfile: `${outDir}/main.css`,
    minify: isProduction,
  })

  // Копируем index.html в dist
  copyFileSync('./index.html', `${outDir}/index.html`)

  // Копируем другие статические файлы если есть
  if (existsSync('./public')) {
    // Копируем содержимое public в dist
    const { execSync } = await import('child_process')
    execSync(`cp -r ./public/* ${outDir}/`, { stdio: 'inherit' })
  }

  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}