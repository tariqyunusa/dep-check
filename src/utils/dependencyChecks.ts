import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";
import { builtinModules } from "module";


const BUILTIN_SET = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);


const IGNORED_DEPENDENCIES = new Set([
  "react-dom",
  "react-server-dom-webpack",
  "react-devtools-core",
  ...BUILTIN_SET,
]);

function shouldIgnore(dep: string): boolean {
  if (dep.startsWith("@types/")) return true;
  return IGNORED_DEPENDENCIES.has(dep);
}

function collectFiles(dir: string, exts = [".js", ".ts", ".jsx", ".tsx"]): string[] {
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


function normalizeDep(dep: string): string {
  const stripped = dep.startsWith("node:") ? dep.slice(5) : dep;
  if (stripped.startsWith("@")) {
    const parts = stripped.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : stripped;
  }
  return stripped.split("/")[0] ?? stripped;
}

export function findUsedDependencies(projectPath: string): string[] {
  const files = collectFiles(projectPath);
  const used = new Set<string>();

  const getRegexes = () => ([
    /import\s+(?:[^'"]+from\s+)?['"](@?[a-zA-Z0-9][a-zA-Z0-9._\-\/]*)['"]/g,
    /require\(\s*['"](@?[a-zA-Z0-9][a-zA-Z0-9._\-\/]*)['"]\s*\)/g,
  ]);

  for (const file of files) {
    const code = readFileSync(file, "utf-8");

    for (const regex of getRegexes()) {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(code)) !== null) {
        const raw = match[1];
        if (raw) {
          const dep = normalizeDep(raw);
          if (!dep.startsWith(".") && !shouldIgnore(dep)) {
            used.add(dep);
          }
        }
      }
    }
  }

  return [...used];
}

export function analyzeDependencies(projectPath: string, used: string[]) {
  const pkgJson = JSON.parse(
    readFileSync(join(projectPath, "package.json"), "utf-8")
  );


  const deps = Object.keys(pkgJson.dependencies || {});
  const devDeps = Object.keys(pkgJson.devDependencies || {});
  const allDepsSet = new Set([...deps, ...devDeps]);
  const usedSet = new Set(used);

  const unused = deps.filter((dep) => !usedSet.has(dep) && !shouldIgnore(dep));


  const missing = used.filter((dep) => !allDepsSet.has(dep) && !shouldIgnore(dep));

  return { used, unused, missing };
}