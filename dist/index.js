#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const detect_1 = require("./utils/detect");
const path_1 = require("path");
const npm_1 = require("./utils/Parsers/npm");
const yarn_1 = require("./utils/Parsers/yarn");
const pnpm_1 = require("./utils/Parsers/pnpm");
const bun_1 = require("./utils/Parsers/bun");
const projectPath = process.argv[2] ? (0, path_1.resolve)(process.argv[2]) : process.cwd();
const pm = (0, detect_1.detectPackageManager)(projectPath);
console.log(`Detected package manager: ${pm}`);
let installed = [];
switch (pm) {
    case 'npm':
        installed = (0, npm_1.parseNpm)(projectPath);
        break;
    case 'yarn':
        installed = (0, yarn_1.parseYarn)(projectPath);
        break;
    case 'pnpm':
        installed = (0, pnpm_1.parsePnpm)(projectPath);
        break;
    case 'bun':
        installed = (0, bun_1.parseBun)(projectPath);
        break;
    default:
        console.log('Unsupported package manager or none detected.');
        process.exit(1);
}
console.log('Installed dependencies:', installed);
//# sourceMappingURL=index.js.map