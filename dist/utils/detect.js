"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPackageManager = detectPackageManager;
const fs_1 = require("fs");
const path_1 = require("path");
function detectPackageManager(projectPath) {
    const files = {
        npm: "package-lock.json",
        yarn: "yarn.lock",
        pnpm: "pnpm-lock.yaml",
        bun: "bun.lockb"
    };
    if ((0, fs_1.existsSync)((0, path_1.join)(projectPath, files.npm)))
        return "npm";
    if ((0, fs_1.existsSync)((0, path_1.join)(projectPath, files.yarn)))
        return "yarn";
    if ((0, fs_1.existsSync)((0, path_1.join)(projectPath, files.pnpm)))
        return "pnpm";
    if ((0, fs_1.existsSync)((0, path_1.join)(projectPath, files.bun)))
        return "bun";
    return "unknown";
}
//# sourceMappingURL=detect.js.map