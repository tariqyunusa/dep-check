import { readFileSync } from "fs";
import { join } from "path";
import type { AuditResult } from "./types";

async function getLatestVersion(pkg: string): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
    if (!res.ok) return null;
    const data = await res.json() as { version: string };
    return data.version;
  } catch {
    return null;
  }
}

function compareVersions(current: string, latest: string): "patch" | "minor" | "major" | "up-to-date" {
  // strip semver range prefixes like ^, ~
  const clean = (v: string) => v.replace(/^[\^~>=<]/, "").trim();
 const [curMajor = 0, curMinor = 0, curPatch = 0] = clean(current).split(".").map(Number);
const [latMajor = 0, latMinor = 0, latPatch = 0] = clean(latest).split(".").map(Number);

if (latMajor > curMajor) return "major";
if (latMinor > curMinor) return "minor";
if (latPatch > curPatch) return "patch";
  return "up-to-date";
}

export async function checkOutdated(
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

  for (const [pkg, currentVersion] of Object.entries(deps)) {
    onProgress(pkg);
    const latest = await getLatestVersion(pkg);
    if (!latest) continue;

    const bump = compareVersions(currentVersion, latest);
    if (bump === "up-to-date") continue;

    const severity = bump === "major" ? "error" : bump === "minor" ? "warn" : "info";

    results.push({
      package: pkg,
      severity,
      message: `${bump} update available: ${currentVersion} → ${latest}`,
      fix: `npm install ${pkg}@latest`,
    });
  }

  return results;
}