"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseYarn = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const parseYarn = (projectPath) => {
    const pkgPath = (0, path_1.join)(projectPath, 'package.json');
    const raw = (0, fs_1.readFileSync)(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
};
exports.parseYarn = parseYarn;
//# sourceMappingURL=yarn.js.map