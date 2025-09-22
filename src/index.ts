#!/usr/bin/env node
import { detectPackageManager } from "./utils/detect";
import { parseNpm } from "./utils/Parsers/npm";
import { parseYarn } from "./utils/Parsers/yarn";
import { parsePnpm } from "./utils/Parsers/pnpm";
import { parseBun } from "./utils/Parsers/bun";
import { findUsedDependencies, analyzeDependencies } from "./utils/dependencyChecks";
import { resolve } from "path";
import * as readline from "readline";
import { execSync } from "child_process";

const projectPath = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

const pm = detectPackageManager(projectPath);
console.log(`Detected package manager: ${pm}`);

let installed: string[] = [];
switch (pm) {
  case "npm":
    installed = parseNpm(projectPath);
    break;
  case "yarn":
    installed = parseYarn(projectPath);
    break;
  case "pnpm":
    installed = parsePnpm(projectPath);
    break;
  case "bun":
    installed = parseBun(projectPath);
    break;
  default:
    console.log("Unsupported package manager or none detected.");
    process.exit(1);
}

const used = findUsedDependencies(projectPath);
const { unused, missing } = analyzeDependencies(".", used);

console.log("✅ Used:", used);
console.log("🗑️ Unused:", unused);


if (unused.length > 0) {
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
            case "npm":
              cmd = `npm uninstall ${unused.join(" ")}`;
              break;
            case "yarn":
              cmd = `yarn remove ${unused.join(" ")}`;
              break;
            case "pnpm":
              cmd = `pnpm remove ${unused.join(" ")}`;
              break;
            case "bun":
              cmd = `bun remove ${unused.join(" ")}`;
              break;
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
}
