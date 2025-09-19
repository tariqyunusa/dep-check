"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePnpm = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = require("yaml");
const parsePnpm = (projectPath) => {
    const filePath = (0, path_1.join)(projectPath, 'pnpm-lock.yaml');
    const raw = (0, fs_1.readFileSync)(filePath, 'utf-8');
    const parsed = (0, yaml_1.parse)(raw);
    return Object.keys(parsed.packages || {});
};
exports.parsePnpm = parsePnpm;
//# sourceMappingURL=pnpm.js.map