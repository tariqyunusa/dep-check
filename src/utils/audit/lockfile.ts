import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { AuditResult } from "./types";

export function checkLockfile(projectPath: string): AuditResult[] {
  const pkgJson = JSON.parse(
    readFileSync(join(projectPath, "package.json"), "utf-8")
  );

  const deps = Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  });

  const lockfilePath = join(projectPath, "package-lock.json");
  if (!existsSync(lockfilePath)) {
    return [{
      package: "lockfile",
      severity: "warn",
      message: "No package-lock.json found — run npm install to generate one",
    }];
  }

  const lockfile = JSON.parse(readFileSync(lockfilePath, "utf-8"));
  const locked = new Set(Object.keys(lockfile.packages || {}).map((p) => p.replace("node_modules/", "")));

  const results: AuditResult[] = [];

  for (const dep of deps) {
    if (!locked.has(dep)) {
      results.push({
        package: dep,
        severity: "error",
        message: "In package.json but missing from lockfile — run npm install",
      });
    }
  }

  return results;
}