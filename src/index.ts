import { Command } from "commander";
import { detectPackageManager } from "./utils/detect";
import { parseNpm } from "./utils/Parsers/npm";
import { parseYarn } from "./utils/Parsers/yarn";
import { parsePnpm } from "./utils/Parsers/pnpm";
import { parseBun } from "./utils/Parsers/bun";
import { findUsedDependencies, analyzeDependencies } from "./utils/dependencyChecks";
import { resolve } from "path";
import * as readline from "readline";
import { execSync } from "child_process";
import { runAudit } from "./utils/audit/index";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../package.json");

const program = new Command();

program
  .name("tidy-deps")
  .description("Detect and remove unused npm dependencies")
  .version(pkg.version)
  .argument("[path]", "path to project (defaults to current directory)")
  .option("--no-remove", "skip the removal prompt")
  .option("--audit", "run audit checks on your dependencies")
  .parse(process.argv);

(async () => {
  const options = program.opts();
  const projectPath = program.args[0] ? resolve(program.args[0]) : process.cwd();

  const pm = detectPackageManager(projectPath);
  console.log(`\nDetected package manager: ${pm}`);

  switch (pm) {
    case "npm":    parseNpm(projectPath);  break;
    case "yarn":   parseYarn(projectPath); break;
    case "pnpm":   parsePnpm(projectPath); break;
    case "bun":    parseBun(projectPath);  break;
    default:
      console.log("Unsupported package manager or none detected.");
      process.exit(1);
  }

  // audit mode — completely separate flow
  if (options.audit) {
    await runAudit(projectPath);
    process.exit(0);
  }

  // default mode — unused dep detection
  const used = findUsedDependencies(projectPath);
  const { unused, missing } = analyzeDependencies(projectPath, used);

    if (unused.length > 0) {
    console.log(`\nFound ${unused.length} unused ${unused.length === 1 ? "dependency" : "dependencies"}:\n`);
    for (const dep of unused) {
      console.log(`  · ${dep}`);
    }
  }

  if (missing.length > 0) {
    console.log(`\nFound ${missing.length} missing ${missing.length === 1 ? "dependency" : "dependencies"} (used in code but not in package.json):\n`);
    for (const dep of missing) {
      console.log(`  · ${dep}`);
    }
  }

  if (unused.length > 0 && options.remove !== false) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`\nEnter numbers to remove (e.g. 1,3) or "all" or "none": `, (answer) => {
      rl.close();

      const trimmed = answer.trim().toLowerCase();

      if (trimmed === "none" || trimmed === "") {
        console.log("⚡ Skipping removal.");
        return;
      }

      let toRemove: string[] = [];

      if (trimmed === "all") {
        toRemove = unused;
      } else {
        const indices = trimmed
          .split(",")
          .map((n) => parseInt(n.trim(), 10) - 1)
          .filter((i) => i >= 0 && i < unused.length);

        if (indices.length === 0) {
          console.log("⚡ No valid selections, skipping removal.");
          return;
        }

        toRemove = indices.map((i) => unused[i]).filter((dep): dep is string => dep !== undefined);
      }

      try {
        let cmd = "";
        switch (pm) {
          case "npm":  cmd = `npm uninstall ${toRemove.join(" ")}`;  break;
          case "yarn": cmd = `yarn remove ${toRemove.join(" ")}`;    break;
          case "pnpm": cmd = `pnpm remove ${toRemove.join(" ")}`;    break;
          case "bun":  cmd = `bun remove ${toRemove.join(" ")}`;     break;
        }
        if (cmd) {
          console.log(`\n🔧 Running: ${cmd}\n`);
          execSync(cmd, { stdio: "inherit", cwd: projectPath });
          console.log("\n✅ Done!");
        }
      } catch (err) {
        console.error("❌ Failed to uninstall dependencies:", err);
      }
    });
  }
})();