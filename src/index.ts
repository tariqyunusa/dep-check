#!/usr/bin/env node
import {detectPackageManager} from './utils/detect';
import {resolve} from 'path';
import {parseNpm} from './utils/Parsers/npm';

const projectPath = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

const pm = detectPackageManager(projectPath);

console.log(`Detected package manager: ${pm}`);

let installed: string[] = [];

switch (pm) {
  case 'npm':
    installed = parseNpm(projectPath);
    break;
  default:
    console.log('Unsupported package manager for now');
    process.exit(1);
}

console.log('Installed dependencies:', installed);
