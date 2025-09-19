"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseYarn = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const lockfile_1 = require("@yarnpkg/lockfile");
const parseYarn = (projectPath) => {
    const filePath = (0, path_1.join)(projectPath, 'yarn.lock');
    const raw = (0, fs_1.readFileSync)(filePath, 'utf-8');
    const parsed = (0, lockfile_1.parse)(raw);
    return Object.keys(parsed.object || {});
};
exports.parseYarn = parseYarn;
//# sourceMappingURL=yarn.js.map