import ora from "ora";
import chalk from "chalk";
import { checkOutdated } from "./outdated";
import { checkDeprecated } from "./deprecated";
import { checkLicenses } from "./licenses";
import { checkLockfile } from "./lockfile";
import type { AuditResult } from "./types";

function renderBar(percent: number): string {
  const total = 20;
  const capped = Math.min(100, Math.max(0, percent));
  const filled = Math.round((capped / 100) * total);
  const empty = total - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${capped}%`;
}

function pad(str: string, length: number): string {
  return str.padEnd(length, " ");
}

function box(title: string, rows: string[]): void {
  if (rows.length === 0) return;
  
  
  const minWidth = 55;
  const maxRow = Math.max(...rows.map((r) => stripAnsi(r).length));
  const width = Math.max(minWidth, maxRow + 2);
  
  console.log(`\n┌─ ${title} ${"─".repeat(width - title.length - 2)}┐`);
  for (const row of rows) {
    const visibleLen = stripAnsi(row).length;
    const padding = " ".repeat(width - visibleLen);
    console.log(`│  ${row}${padding}│`);
  }
  console.log(`└${"─".repeat(width + 2)}┘`);
}


function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, "");
}

function severityLabel(severity: string): string {
  switch (severity) {
    case "error": return chalk.red("●");
    case "warn":  return chalk.yellow("●");
    case "info":  return chalk.blue("●");
    default:      return " ";
  }
}

function bumpLabel(message: string): string {
  if (message.startsWith("major")) return chalk.red(pad("MAJOR", 8));
  if (message.startsWith("minor")) return chalk.yellow(pad("MINOR", 8));
  if (message.startsWith("patch")) return chalk.green(pad("PATCH", 8));
  return pad("", 8);
}

export async function runAudit(projectPath: string): Promise<void> {
  console.log("\n🔍 Running audit...\n");

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
    const percent = 50 + Math.round(((completed - total) / total) * 50);
    spinner.text = `${pkg}...\n${renderBar(percent)}`;
  };

  const lockResults = checkLockfile(projectPath);
  const licenseResults = checkLicenses(projectPath);
  const outdatedResults = await checkOutdated(projectPath, onOutdatedProgress);
  const deprecatedResults = await checkDeprecated(projectPath, onDeprecatedProgress);

  spinner.succeed(`${renderBar(100)} — done`);

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


  const outdatedRows = outdatedResults.map((r) => {
    const bump = bumpLabel(r.message);
    const parts = r.message.split(": ")[1] ?? "";
    return `${bump} ${pad(r.package, 20)} ${parts}`;
  });
  box("Outdated", outdatedRows);


  const deprecatedRows = deprecatedResults.map((r) => {
    return `${severityLabel("error")} ${pad(r.package, 20)} ${r.message.replace("Deprecated: ", "")}`;
  });
  box("Deprecated", deprecatedRows);


  const licenseRows = licenseResults.map((r) => {
    return `${severityLabel(r.severity)} ${pad(r.package, 20)} ${r.message}`;
  });
  box("Licenses", licenseRows);

  
  const lockRows = lockResults.map((r) => {
    return `${severityLabel(r.severity)} ${pad(r.package, 20)} ${r.message}`;
  });
  box("Lockfile", lockRows);

  
  const errors = all.filter((r) => r.severity === "error").length;
  const warns = all.filter((r) => r.severity === "warn").length;
  const infos = all.filter((r) => r.severity === "info").length;
  box("Summary", [
    `${chalk.red(`${errors} errors`)} · ${chalk.yellow(`${warns} warnings`)} · ${chalk.blue(`${infos} info`)}`,
  ]);
}