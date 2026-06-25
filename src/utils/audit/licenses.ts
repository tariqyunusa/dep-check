import { readFileSync } from "fs";
import { join } from "path";
import type { AuditResult } from "./types";

const RISKY_LICENSES = new Set(["GPL-2.0", "GPL-3.0", "AGPL-3.0", "LGPL-2.1", "LGPL-3.0"]);

export function checkLicenses(projectPath: string): AuditResult[] {
  const pkgJson = JSON.parse(
    readFileSync(join(projectPath, "package.json"), "utf-8")
  );

  const deps: Record<string, string> = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  };

  const results: AuditResult[] = [];

  for (const pkg of Object.keys(deps)) {
    try {
      const depPkgPath = join(projectPath, "node_modules", pkg, "package.json");
      const depPkg = JSON.parse(readFileSync(depPkgPath, "utf-8"));
      const license: string = depPkg.license ?? "UNKNOWN";

      if (license === "UNKNOWN") {
        results.push({
          package: pkg,
          severity: "warn",
          message: "No license field found",
        });
      } else if (RISKY_LICENSES.has(license)) {
        results.push({
          package: pkg,
          severity: "error",
          message: `Risky license: ${license} (copyleft — may affect commercial use)`,
        });
      }
    } catch {
      // package not installed yet, skip
    }
  }

  return results;
}