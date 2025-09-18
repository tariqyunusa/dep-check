"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNpm = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const parseNpm = (projectPath) => {
    const file = (0, path_1.join)(projectPath, 'package-lock.json');
    const raw = (0, fs_1.readFileSync)(file, 'utf-8');
    const json = JSON.parse(raw);
    return Object.keys(json.dependencies || {});
};
exports.parseNpm = parseNpm;
//# sourceMappingURL=npm.js.map