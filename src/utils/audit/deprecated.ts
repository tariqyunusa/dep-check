import { readFileSync } from "fs";
import { join } from "path";
import type { AuditResult } from "./types";

async function getPackageMeta(pkg: string): Promise<{ deprecated?: string } | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
    if (!res.ok) return null;
    return await res.json() as { deprecated?: string };
  } catch {
    return null;
  }
}

export async function checkDeprecated(
  projectPath: string,
  onProgress: (pkg: string) => void
): Promise<AuditResult[]> {
  const pkgJson = JSON.parse(
    readFileSync(join(projectPath, "package.json"), "utf-8")
  );

  const deps: Record<string, string> = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  };

  const results: AuditResult[] = [];

  for (const pkg of Object.keys(deps)) {
    onProgress(pkg);
    const meta = await getPackageMeta(pkg);
    if (!meta?.deprecated) continue;

    results.push({
      package: pkg,
      severity: "error",
      message: `Deprecated: ${meta.deprecated}`,
    });
  }

  return results;
}