import { existsSync } from "fs"
import { join } from "path"

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun" | "unknown"

export function detectPackageManager(projectPath: string) : PackageManager {
    const files = {
        npm : "package-lock.json",
        yarn: "yarn.lock",
        pnpm: "pnpm-lock.yaml",
        bun: "bun.lockb"
    }

    if(existsSync(join(projectPath, files.npm))) return "npm"
    if(existsSync(join(projectPath, files.yarn))) return "yarn"
    if(existsSync(join(projectPath, files.pnpm))) return "pnpm"
    if(existsSync(join(projectPath, files.bun))) return "bun"

    return "unknown"
}