#!/usr/bin/env node
/**
 * Script to rewrite all @atproto/@atproto-labs imports to @gander-social-atproto/@gander-atproto-nest (or vice versa)
 * and update package.json dependencies to the closest or latest available version from the target upstream.
 * Version strategy is controlled by UPSTREAM_VERSION_STRATEGY=closest|latest (default: closest)
 * based on BUILD_UPSTREAM_SOURCE in .env or lib/constants.ts
 */
const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')
const semver = require('semver')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const SRC_FOLDERS = [
  'src',
  'gndrembed/src',
  'gndrlink/src',
  'gndrogcard/src',
  'modules',
]
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
const EXCLUDE_DIRS = [
  'node_modules',
  'build',
  'dist',
  '__tests__',
  '__e2e__',
  '__mocks__',
  'android',
  'ios',
  'web-build',
]

function getEnvUpstreamSource() {
  // Try .env first
  const envPath = path.join(PROJECT_ROOT, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const match = envContent.match(/^BUILD_UPSTREAM_SOURCE=(.*)$/m)
    if (match) return match[1].trim()
  }
  // Fallback: try lib/constants.ts
  const constantsPath = path.join(PROJECT_ROOT, 'src/lib/constants.ts')
  if (fs.existsSync(constantsPath)) {
    const constantsContent = fs.readFileSync(constantsPath, 'utf8')
    const match = constantsContent.match(
      /export const BUILD_UPSTREAM_SOURCE = ['"](bluesky|gander)['"]/,
    )
    if (match) return match[1]
  }
  // Default
  return 'bluesky'
}

function getVersionStrategy() {
  return process.env.UPSTREAM_VERSION_STRATEGY || 'closest'
}

function getUpstreamMap(upstream) {
  if (upstream === 'gander') {
    return {
      '@atproto/': '@gander-social-atproto/',
      '@atproto-labs/': '@gander-atproto-nest/',
    }
  } else {
    return {
      '@gander-social-atproto/': '@atproto/',
      '@gander-atproto-nest/': '@atproto-labs/',
    }
  }
}

function shouldProcessFile(filePath) {
  return (
    FILE_EXTENSIONS.some(ext => filePath.endsWith(ext)) &&
    !EXCLUDE_DIRS.some(dir => filePath.includes(`/${dir}/`))
  )
}

function processFile(filePath, upstreamMap) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false
  for (const [from, to] of Object.entries(upstreamMap)) {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from, 'g'), to)
      changed = true
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`Updated imports in: ${filePath}`)
  }
}

function walkDir(dir, upstreamMap) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry)) walkDir(fullPath, upstreamMap)
    } else if (shouldProcessFile(fullPath)) {
      processFile(fullPath, upstreamMap)
    }
  }
}

function getAvailableVersions(pkg) {
  try {
    const result = execSync(`npm view ${pkg} versions --json`, {
      encoding: 'utf8',
    })
    return JSON.parse(result)
  } catch (e) {
    return []
  }
}

function findClosestVersion(currentVersion, availableVersions) {
  if (!semver.valid(currentVersion))
    return availableVersions[availableVersions.length - 1]
  let closest = availableVersions[0]
  let minDiff = Infinity
  for (const v of availableVersions) {
    if (!semver.valid(v)) continue
    const diff = Math.abs(
      semver.diff(currentVersion, v) === null
        ? 0
        : semver.compare(currentVersion, v),
    )
    if (diff < minDiff) {
      minDiff = diff
      closest = v
    }
  }
  return closest
}

function updatePackageJson(upstream, versionStrategy) {
  const pkgPath = path.join(PROJECT_ROOT, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  let changed = false
  const depFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]
  const upstreamMap = getUpstreamMap(upstream)
  for (const field of depFields) {
    if (!pkg[field]) continue
    for (const dep of Object.keys(pkg[field])) {
      for (const [from, to] of Object.entries(upstreamMap)) {
        if (dep.startsWith(from)) {
          const newDep = dep.replace(from, to)
          const currentVersion = pkg[field][dep]
          const availableVersions = getAvailableVersions(newDep)
          let selectedVersion = availableVersions[availableVersions.length - 1] // default to latest
          if (versionStrategy === 'closest' && semver.valid(currentVersion)) {
            selectedVersion = findClosestVersion(
              currentVersion,
              availableVersions,
            )
          }
          pkg[field][newDep] = selectedVersion
          delete pkg[field][dep]
          changed = true
          console.log(
            `Updated dependency: ${dep}@${currentVersion} -> ${newDep}@${selectedVersion}`,
          )
        }
      }
    }
  }
  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    console.log('package.json dependencies updated for upstream:', upstream)
  }
}

function main() {
  const upstream = getEnvUpstreamSource()
  const versionStrategy = getVersionStrategy()
  const upstreamMap = getUpstreamMap(upstream)
  console.log(
    `Switching upstream imports to: ${upstream} (version strategy: ${versionStrategy})`,
  )
  for (const folder of SRC_FOLDERS) {
    const absFolder = path.join(PROJECT_ROOT, folder)
    if (fs.existsSync(absFolder)) walkDir(absFolder, upstreamMap)
  }
  updatePackageJson(upstream, versionStrategy)
  console.log('Upstream import update complete.')
}

main()
