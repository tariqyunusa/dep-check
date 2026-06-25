#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const detect_1 = require("./utils/detect");
const npm_1 = require("./utils/Parsers/npm");
const yarn_1 = require("./utils/Parsers/yarn");
const pnpm_1 = require("./utils/Parsers/pnpm");
const bun_1 = require("./utils/Parsers/bun");
const dependencyChecks_1 = require("./utils/dependencyChecks");
const path_1 = require("path");
const readline = __importStar(require("readline"));
const child_process_1 = require("child_process");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../package.json");
const program = new commander_1.Command();
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
    const projectPath = program.args[0] ? (0, path_1.resolve)(program.args[0]) : process.cwd();
    const pm = (0, detect_1.detectPackageManager)(projectPath);
    console.log(`\nDetected package manager: ${pm}`);
    switch (pm) {
        case "npm":
            (0, npm_1.parseNpm)(projectPath);
            break;
        case "yarn":
            (0, yarn_1.parseYarn)(projectPath);
            break;
        case "pnpm":
            (0, pnpm_1.parsePnpm)(projectPath);
            break;
        case "bun":
            (0, bun_1.parseBun)(projectPath);
            break;
        default:
            console.log("Unsupported package manager or none detected.");
            process.exit(1);
    }
    const used = (0, dependencyChecks_1.findUsedDependencies)(projectPath);
    const { unused, missing } = (0, dependencyChecks_1.analyzeDependencies)(projectPath, used);
    console.log("\n✅ Used:", used);
    console.log("🗑️  Unused:", unused);
    if (missing.length > 0) {
        console.log("⚠️  Missing (used in code but not in package.json):", missing);
    }
    // --audit flag (placeholder for now, we'll expand this next)
    // replace the audit placeholder with:
    if (options.audit) {
        const { runAudit } = await Promise.resolve().then(() => __importStar(require("./utils/audit/index")));
        await runAudit(projectPath);
    }
    // --no-remove skips the prompt entirely
    if (unused.length > 0 && options.remove !== false) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(`\nDo you want to remove unused dependencies? (${unused.join(", ")}) [y/N]: `, (answer) => {
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
                        (0, child_process_1.execSync)(cmd, { stdio: "inherit", cwd: projectPath });
                        console.log("✅ Unused dependencies removed!");
                    }
                }
                catch (err) {
                    console.error("❌ Failed to uninstall dependencies:", err);
                }
            }
            else {
                console.log("⚡ Skipping removal.");
            }
        });
    }
    else if (unused.length === 0) {
        console.log("\n✨ No unused dependencies found!");
    }
})();
//# sourceMappingURL=index.js.map