#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const detect_1 = require("./utils/detect");
const path_1 = require("path");
const projectPath = process.argv[2]
    ? (0, path_1.resolve)(process.argv[2])
    : process.cwd();
const pm = (0, detect_1.detectPackageManager)(projectPath);
console.log(`Detected package manager: ${pm}`);
//# sourceMappingURL=index.js.map