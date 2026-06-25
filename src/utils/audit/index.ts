import ora from "ora";
import { checkOutdated } from "./outdated";
import { checkDeprecated } from "./deprecated";
import { checkLicenses } from "./licenses";
import { checkLockfile } from "./lockfile";
import type { AuditResult } from "./types";

function renderBar(percent: number): string {
  const total = 20;
  const filled = Math.round((percent / 100) * total);
  const empty = total - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
}

export async function runAudit(projectPath: string): Promise<void> {
  console.log("\n🔍 Running audit...\n");

  const spinner = ora(renderBar(0)).start();

  // step 1 — 25%
  spinner.text = renderBar(10);
  const lockResults = checkLockfile(projectPath);
  spinner.text = renderBar(25);

  // step 2 — 50%
  spinner.text = renderBar(30);
  const licenseResults = checkLicenses(projectPath);
  spinner.text = renderBar(50);

  // step 3 — 75%
  const outdatedResults = await checkOutdated(projectPath, () => {
    // silent
  });
  spinner.text = renderBar(75);

  // step 4 — 100%
  const deprecatedResults = await checkDeprecated(projectPath, () => {
    // silent
  });
  spinner.text = renderBar(100);
  spinner.succeed(`${renderBar(100)} — done`);

  // collect and print
  const all: AuditResult[] = [
    ...lockResults,
    ...licenseResults,
    ...outdatedResults,
    ...deprecatedResults,
  ];

  if (all.length === 0) {
    console.log("\n✨ Everything looks good!");
    return;
  }

  console.log("\n📋 Audit Results:\n");

  const errors = all.filter((r) => r.severity === "error");
  const warns = all.filter((r) => r.severity === "warn");
  const infos = all.filter((r) => r.severity === "info");

  for (const r of errors) {
    console.log(`❌ [${r.package}] ${r.message}`);
    if (r.fix) console.log(`   💡 Fix: ${r.fix}`);
  }
  for (const r of warns) {
    console.log(`⚠️  [${r.package}] ${r.message}`);
    if (r.fix) console.log(`   💡 Fix: ${r.fix}`);
  }
  for (const r of infos) {
    console.log(`ℹ️  [${r.package}] ${r.message}`);
    if (r.fix) console.log(`   💡 Fix: ${r.fix}`);
  }

  console.log(`\n${errors.length} errors · ${warns.length} warnings · ${infos.length} info`);
}