#!/usr/bin/env node
import { detectPackageManager } from "./utils/detect"
import {resolve} from "path"

const projectPath = process.argv[2]
? resolve(process.argv[2])
: process.cwd()

const pm = detectPackageManager(projectPath)

console.log(`Detected package manager: ${pm}`);