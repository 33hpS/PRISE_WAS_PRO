// scripts/build.mjs
import esbuild from 'esbuild'
import { mkdirSync, existsSync, copyFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const isProduction = process.argv.includes('--production')
const outDir = resolve(rootDir, 'dist')

console.log(`🏗️  Building for ${isProduction ? 'production' : 'development'}...`)
console.log(`📁 Output directory: ${outDir}`)

// Создаем директорию dist
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true })
  console.log(`✅ Created output directory: ${outDir}`)
}

try {
  // Проверяем входные файлы
  const srcMain = resolve(rootDir, 'src/main.tsx')
  const srcCSS = resolve(rootDir, 'src/shadcn.css')
  const indexHTML = resolve(rootDir, 'index.html')
  
  if (!existsSync(srcMain)) {
    throw new Error(`Entry point not found: ${srcMain}`)
  }
  
  console.log(`📝 Building JavaScript from: ${srcMain}`)
  
  // Сборка JavaScript
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
  console.log(`✅ JavaScript build complete`)

  // Сборка CSS через PostCSS + Tailwind
  if (existsSync(srcCSS)) {
    console.log(`🎨 Building CSS with Tailwind from: ${srcCSS}`)
    
    // Используем PostCSS CLI для обработки Tailwind
    const postcssCmd = `npx postcss "${srcCSS}" -o "${resolve(outDir, 'main.css')}" ${isProduction ? '--env production' : ''}`
    execSync(postcssCmd, { stdio: 'inherit', cwd: rootDir })
    
    console.log(`✅ CSS build complete`)
  } else {
    console.log(`⚠️  CSS file not found: ${srcCSS}`)
    // Создаем пустой CSS файл
    writeFileSync(resolve(outDir, 'main.css'), '/* No CSS file found */')
  }

  // Копируем index.html
  if (existsSync(indexHTML)) {
    copyFileSync(indexHTML, resolve(outDir, 'index.html'))
    console.log(`✅ Copied index.html`)
  } else {
    throw new Error(`index.html not found: ${indexHTML}`)
  }

  // Копируем статические файлы из public (если есть)
  const publicDir = resolve(rootDir, 'public')
  if (existsSync(publicDir)) {
    try {
      execSync(`cp -r "${publicDir}"/* "${outDir}"/`, { stdio: 'inherit' })
      console.log(`✅ Copied public assets`)
    } catch (e) {
      console.log(`⚠️  No public assets to copy`)
    }
  }

  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}