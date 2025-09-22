import {readdirSync, readFileSync, statSync} from 'fs';
import {join, extname} from 'path';

function collectFiles(dir: string, exts = ['.js', '.ts', '.jsx', '.tsx']) {
  let files: string[] = [];
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && file !== 'node_modules') {
      files = files.concat(collectFiles(fullPath, exts));
    } else if (exts.includes(extname(file))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Framework-managed or false positives
const IGNORED_DEPENDENCIES = new Set(['react-dom', 'react-server-dom-webpack', 'react-devtools-core']);

export function findUsedDependencies(projectPath: string): string[] {
  const files = collectFiles(projectPath);
  const used = new Set<string>();

  // Matches `import x from 'dep'` or `import 'dep'`
  const importRegex = /import\s+(?:[^'"]+from\s+)?['"](@?[a-zA-Z0-9][a-zA-Z0-9._\-\/]*)['"]/g;
  // Matches `require('dep')`
  const requireRegex = /require\(\s*['"](@?[a-zA-Z0-9][a-zA-Z0-9._\-\/]*)['"]\s*\)/g;

  for (const file of files) {
    const code = readFileSync(file, 'utf-8');

    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(code)) !== null) {
      const raw = match[1];
      if (raw) {
        const dep = normalizeDep(raw);
        if (!dep.startsWith('.')) {
          used.add(dep);
        }
      }
    }

    while ((match = requireRegex.exec(code)) !== null) {
      const raw = match[1];
      if (raw) {
        const dep = normalizeDep(raw);
        if (!dep.startsWith('.')) {
          used.add(dep);
        }
      }
    }
  }

  return [...used];
}

function normalizeDep(dep: string): string {
  if (dep.startsWith('@')) {
    const parts = dep.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : dep;
  }
  return dep.split('/')[0];
}

export function analyzeDependencies(projectPath: string, used: string[]) {
  const pkgJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));

  const installed = Object.keys(pkgJson.dependencies || {}); 
  const installedSet = new Set(installed);
  const usedSet = new Set(used);

  const unused = installed.filter((dep) => !usedSet.has(dep) && !IGNORED_DEPENDENCIES.has(dep));
  const missing = used.filter((dep) => !installedSet.has(dep) && !IGNORED_DEPENDENCIES.has(dep));

  return {used, unused, missing};
}
