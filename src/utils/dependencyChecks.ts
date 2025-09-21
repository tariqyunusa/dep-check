import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

function collectFiles(dir: string, exts = [".js", ".ts", ".jsx", ".tsx"]) {
  let files: string[] = [];
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && file !== "node_modules") {
      files = files.concat(collectFiles(fullPath, exts));
    } else if (exts.includes(extname(file))) {
      files.push(fullPath);
    }
  }
  return files;
}

export function findUsedDependencies(projectPath: string): string[] {
  const files = collectFiles(projectPath);
  const used = new Set<string>();

  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

  for (const file of files) {
    const code = readFileSync(file, "utf-8");

    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(code)) !== null) {
      const dep = match[1]?.split("/")[0]; // 👈 safe access
      if (dep && !dep.startsWith(".")) used.add(dep);
    }

    while ((match = requireRegex.exec(code)) !== null) {
      const dep = match[1]?.split("/")[0]; // 👈 safe access
      if (dep && !dep.startsWith(".")) used.add(dep);
    }
  }

  return [...used];
}

export function analyzeDependencies(installed: string[], used: string[]) {
  const installedSet = new Set(installed);
  const usedSet = new Set(used);

  const unused = installed.filter((dep) => !usedSet.has(dep));
  const missing = used.filter((dep) => !installedSet.has(dep));

  return { used, unused, missing };
}
