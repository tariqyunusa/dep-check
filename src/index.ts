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

  console.log("\n✅ Used:", used);
  console.log("🗑️  Unused:", unused);

  if (missing.length > 0) {
    console.log("⚠️  Missing (used in code but not in package.json):", missing);
  }

  if (unused.length > 0 && options.remove !== false) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `\nDo you want to remove unused dependencies? (${unused.join(", ")}) [y/N]: `,
      (answer) => {
        rl.close();
        if (answer.toLowerCase() === "y") {
          try {
            let cmd = "";
            switch (pm) {
              case "npm":  cmd = `npm uninstall ${unused.join(" ")}`;  break;
              case "yarn": cmd = `yarn remove ${unused.join(" ")}`;    break;
              case "pnpm": cmd = `pnpm remove ${unused.join(" ")}`;    break;
              case "bun":  cmd = `bun remove ${unused.join(" ")}`;     break;
            }
            if (cmd) {
              console.log(`🔧 Running: ${cmd}`);
              execSync(cmd, { stdio: "inherit", cwd: projectPath });
              console.log("✅ Unused dependencies removed!");
            }
          } catch (err) {
            console.error("❌ Failed to uninstall dependencies:", err);
          }
        } else {
          console.log("⚡ Skipping removal.");
        }
      }
    );
  } else if (unused.length === 0) {
    console.log("\n✨ No unused dependencies found!");
  }
})();