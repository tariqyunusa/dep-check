"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBun = void 0;
const child_process_1 = require("child_process");
const parseBun = (projectPath) => {
    try {
        const output = (0, child_process_1.execSync)('bun pm ls --json', { cwd: projectPath });
        const parsed = JSON.parse(output.toString());
        return parsed.map((dep) => dep.name);
    }
    catch (e) {
        console.error('Error parsing Bun dependencies:', e);
        return [];
    }
};
exports.parseBun = parseBun;
//# sourceMappingURL=bun.js.map