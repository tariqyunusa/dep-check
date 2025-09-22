import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";
import { builtinModules } from "module";

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
const IGNORED_DEPENDENCIES = new Set([
  "react-dom",
  "react-server-dom-webpack",
  "react-devtools-core",
   "something",
  ...builtinModules, 
]);

function shouldIgnore(dep: string): boolean {
  if (dep.startsWith("@types/")) return true;

  return IGNORED_DEPENDENCIES.has(dep);
}

export function findUsedDependencies(projectPath: string): string[] {
  const files = collectFiles(projectPath);
  const used = new Set<string>();

  const importRegex =
    /import\s+(?:[^'"]+from\s+)?['"](@?[a-zA-Z0-9][a-zA-Z0-9._\-\/]*)['"]/g;
  const requireRegex =
    /require\(\s*['"](@?[a-zA-Z0-9][a-zA-Z0-9._\-\/]*)['"]\s*\)/g;

  for (const file of files) {
    const code = readFileSync(file, "utf-8");

    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(code)) !== null) {
      const raw = match[1];
      if (raw) {
        const dep = normalizeDep(raw);
        if (!dep.startsWith(".") && !IGNORED_DEPENDENCIES.has(dep)) {
          used.add(dep);
        }
      }
    }

    while ((match = requireRegex.exec(code)) !== null) {
      const raw = match[1];
      if (raw) {
        const dep = normalizeDep(raw);
        if (!dep.startsWith(".") && !IGNORED_DEPENDENCIES.has(dep)) {
          used.add(dep);
        }
      }
    }
  }

  return [...used];
}

function normalizeDep(dep: any): string {
  if (dep.startsWith("@")) {
    const parts = dep.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : dep;
  }
  return dep.split("/")[0];
}

export function analyzeDependencies(projectPath: string, used: string[]) {
  const pkgJson = JSON.parse(
    readFileSync(join(projectPath, "package.json"), "utf-8")
  );

  const deps = Object.keys(pkgJson.dependencies || {}); 
  const depsSet = new Set(deps);
  const usedSet = new Set(used);

  const unused = deps.filter(
    (dep) => !usedSet.has(dep) && !shouldIgnore(dep)
  );

  const missing = used.filter(
    (dep) => !depsSet.has(dep) && !shouldIgnore(dep)
  );

  return { used, unused, missing };
}