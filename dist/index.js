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
const detect_1 = require("./utils/detect");
const npm_1 = require("./utils/Parsers/npm");
const yarn_1 = require("./utils/Parsers/yarn");
const pnpm_1 = require("./utils/Parsers/pnpm");
const bun_1 = require("./utils/Parsers/bun");
const dependencyChecks_1 = require("./utils/dependencyChecks");
const path_1 = require("path");
const readline = __importStar(require("readline"));
const child_process_1 = require("child_process");
const projectPath = process.argv[2] ? (0, path_1.resolve)(process.argv[2]) : process.cwd();
const pm = (0, detect_1.detectPackageManager)(projectPath);
console.log(`Detected package manager: ${pm}`);
let installed = [];
switch (pm) {
    case "npm":
        installed = (0, npm_1.parseNpm)(projectPath);
        break;
    case "yarn":
        installed = (0, yarn_1.parseYarn)(projectPath);
        break;
    case "pnpm":
        installed = (0, pnpm_1.parsePnpm)(projectPath);
        break;
    case "bun":
        installed = (0, bun_1.parseBun)(projectPath);
        break;
    default:
        console.log("Unsupported package manager or none detected.");
        process.exit(1);
}
const used = (0, dependencyChecks_1.findUsedDependencies)(projectPath);
const { unused, missing } = (0, dependencyChecks_1.analyzeDependencies)(".", used);
console.log("✅ Used:", used);
console.log("🗑️ Unused:", unused);
console.log("❌ Missing:", missing);
if (unused.length > 0) {
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
//# sourceMappingURL=index.js.map