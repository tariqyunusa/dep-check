"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNpm = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const parseNpm = (projectPath) => {
    const pkgFile = (0, path_1.join)(projectPath, 'package.json');
    const lockFile = (0, path_1.join)(projectPath, 'package-lock.json');
    console.log(pkgFile);
    console.log(lockFile);
    const pkgJson = JSON.parse((0, fs_1.readFileSync)(pkgFile, 'utf-8'));
    const lockJson = JSON.parse((0, fs_1.readFileSync)(lockFile, 'utf-8'));
    const declared = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies,
    };
    if (lockJson.dependencies) {
        return Object.keys(declared).filter((dep) => Object.prototype.hasOwnProperty.call(lockJson.dependencies, dep));
    }
    if (lockJson.packages) {
        return Object.keys(declared).filter((dep) => Object.keys(lockJson.packages).includes(`node_modules/${dep}`));
    }
    return [];
};
exports.parseNpm = parseNpm;
//# sourceMappingURL=npm.js.map