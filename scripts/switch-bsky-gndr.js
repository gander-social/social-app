#!/usr/bin/env node

/**
 * Switches Bsky/bsky/BSKY aliases to Gndr/gndr/GNDR in import statements and type casts,
 * updating the source package between @atproto/api and @gander-social-atproto/api.
 * Usage: node switch-bsky-gndr.js [atproto|gander]
 */

const fs = require('fs');
const path = require('path');

// Use process.cwd() to reference the project root
const PROJECT_ROOT = process.cwd();
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const BACKENDS = {
  atproto: '@atproto/api',
  gander: '@gander-social-atproto/api',
  atproto_labs: '@atproto-labs/',
  gander_labs: '@gander-atproto-nest/',
};

const backend = process.argv[2];
if (!BACKENDS[backend]) {
  console.error('Usage: node switch-bsky-gndr.js [atproto|gander]');
  process.exit(1);
}
const importSource = BACKENDS[backend];

// Directories to exclude from search
const EXCLUDE_DIRS = [
  'node_modules', 'build', 'dist', 'vendor', 'assets', 'android', 'ios', 'web', '__tests__', '__mocks__'
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // Exclude known generated/output directories
      if (!EXCLUDE_DIRS.includes(file)) {
        results = results.concat(walk(filePath));
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  return results;
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!/import\s/.test(content)) return;
  let updated = false;

  // Update import statements for Bsky/bsky/BSKY as Gndr/gndr/GNDR, including mixed imports
  content = content.replace(/import\s+(type\s+)?\{([\s\S]*?)\}\s*from\s*['"](@atproto\/api|@gander-social-atproto\/api)['"]/gm,
    (match, typeKeyword, imports) => {
      let newImports = imports;
      if (backend === 'gander') {
        // Replace Bsky... as Gndr... with just Gndr... (and update type name)
        newImports = newImports.replace(/(Bsky\w*)\s+as\s+(Gndr\w*)/g, '$2');
        // Also replace any remaining Bsky... with Gndr...
        newImports = newImports.replace(/\bBsky(\w*)\b/g, 'Gndr$1');
      } else {
        // Replace Gndr... with Bsky... as Gndr...
        newImports = newImports.replace(/\bGndr(\w*)\b/g, 'Bsky$1 as Gndr$1');
      }
      updated = true;
      return `import ${typeKeyword ? typeKeyword : ''}{${newImports}} from '${importSource}'`;
    }
  );

  // Update type casts (e.g., as GndrAgent)
  content = content.replace(/as\s+(Gndr\w*|gndr\w*|GNDR\w*)/g, (match, gndrName) => {
    return `as ${gndrName}`;
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function main() {
  const files = walk(PROJECT_ROOT);
  files.forEach(updateFile);
  console.log(`Switch complete: ${backend}`);
}

main();
