import ora from "ora";
import { checkOutdated } from "./outdated";
import { checkDeprecated } from "./deprecated";
import { checkLicenses } from "./licenses";
import { checkLockfile } from "./lockfile";
import type { AuditResult } from "./types";

function renderBar(percent: number): string {
  const total = 20;
  const capped = Math.min(100, Math.max(0, percent)); // never below 0 or above 100
  const filled = Math.round((capped / 100) * total);
  const empty = total - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${capped}%`;
}

export async function runAudit(projectPath: string): Promise<void> {
  console.log("\n Running audit...\n");

  const { readFileSync } = await import("fs");
  const { join } = await import("path");

  const pkgJson = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
  const allDeps = Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  });

  const total = allDeps.length;
  let completed = 0;

  const spinner = ora(`${allDeps[0]}...\n${renderBar(0)}`).start();

  const onOutdatedProgress = (pkg: string) => {
  completed++;
  const percent = Math.round((completed / total) * 50);
  spinner.text = `${pkg}...\n${renderBar(percent)}`;
};

const onDeprecatedProgress = (pkg: string) => {
  completed++;
  const percent = Math.min(100, Math.round((completed / total) * 50));
  spinner.text = `${pkg}...\n${renderBar(percent)}`;
};

const lockResults = checkLockfile(projectPath);
const licenseResults = checkLicenses(projectPath);
const outdatedResults = await checkOutdated(projectPath, onOutdatedProgress);
// no reset — completed keeps going from total to total*2
const deprecatedResults = await checkDeprecated(projectPath, onDeprecatedProgress);

spinner.succeed(`done\n${renderBar(100)}`);

  // collect and print
  const all: AuditResult[] = [
    ...lockResults,
    ...licenseResults,
    ...outdatedResults,
    ...deprecatedResults,
  ];

  if (all.length === 0) {
    console.log("\n Everything looks good!");
    return;
  }

  console.log("\n Audit Results:\n");

  const errors = all.filter((r) => r.severity === "error");
  const warns = all.filter((r) => r.severity === "warn");
  const infos = all.filter((r) => r.severity === "info");

  for (const r of errors) {
    console.log(` [${r.package}] ${r.message}`);
    if (r.fix) console.log(` ⚠️   Fix: ${r.fix}\n`);
  }
  for (const r of warns) {
    console.log(`  [${r.package}] ${r.message}`);
    if (r.fix) console.log(` !  Fix: ${r.fix} \n`);
  }
  for (const r of infos) {
    console.log(`  [${r.package}] ${r.message}`);
    if (r.fix) console.log(` ⚠️  Fix: ${r.fix}\n`);
  }

  console.log(`\n${errors.length} errors · ${warns.length} warnings · ${infos.length} info`);
}