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
const index_1 = require("./utils/audit/index");
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
    // audit mode — completely separate flow
    if (options.audit) {
        await (0, index_1.runAudit)(projectPath);
        process.exit(0);
    }
    // default mode — unused dep detection
    const used = (0, dependencyChecks_1.findUsedDependencies)(projectPath);
    const { unused, missing } = (0, dependencyChecks_1.analyzeDependencies)(projectPath, used);
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
            let toRemove = [];
            if (trimmed === "all") {
                toRemove = unused;
            }
            else {
                const indices = trimmed
                    .split(",")
                    .map((n) => parseInt(n.trim(), 10) - 1)
                    .filter((i) => i >= 0 && i < unused.length);
                if (indices.length === 0) {
                    console.log("⚡ No valid selections, skipping removal.");
                    return;
                }
                toRemove = indices.map((i) => unused[i]).filter((dep) => dep !== undefined);
            }
            try {
                let cmd = "";
                switch (pm) {
                    case "npm":
                        cmd = `npm uninstall ${toRemove.join(" ")}`;
                        break;
                    case "yarn":
                        cmd = `yarn remove ${toRemove.join(" ")}`;
                        break;
                    case "pnpm":
                        cmd = `pnpm remove ${toRemove.join(" ")}`;
                        break;
                    case "bun":
                        cmd = `bun remove ${toRemove.join(" ")}`;
                        break;
                }
                if (cmd) {
                    console.log(`\n🔧 Running: ${cmd}\n`);
                    (0, child_process_1.execSync)(cmd, { stdio: "inherit", cwd: projectPath });
                    console.log("\n✅ Done!");
                }
            }
            catch (err) {
                console.error("❌ Failed to uninstall dependencies:", err);
            }
        });
    }
})();
//# sourceMappingURL=index.js.map