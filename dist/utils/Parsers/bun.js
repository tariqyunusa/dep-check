"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBun = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const parseBun = (projectPath) => {
    try {
        const pkgPath = (0, path_1.join)(projectPath, 'package.json');
        const raw = (0, fs_1.readFileSync)(pkgPath, 'utf-8');
        const pkg = JSON.parse(raw);
        const deps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...pkg.peerDependencies,
            ...pkg.optionalDependencies,
        };
        return Object.keys(deps);
    }
    catch (e) {
        console.error('Error parsing Bun dependencies:', e);
        return [];
    }
};
exports.parseBun = parseBun;
//# sourceMappingURL=bun.js.map