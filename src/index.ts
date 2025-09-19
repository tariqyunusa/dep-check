#!/usr/bin/env node
import {detectPackageManager} from './utils/detect';
import {resolve} from 'path';
import {parseNpm} from './utils/Parsers/npm';
import {parseYarn} from './utils/Parsers/yarn';
import {parsePnpm} from './utils/Parsers/pnpm';
import {parseBun} from './utils/Parsers/bun';

const projectPath = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

const pm = detectPackageManager(projectPath);

console.log(`Detected package manager: ${pm}`);

let installed: string[] = [];

switch (pm) {
  case 'npm':
    installed = parseNpm(projectPath);
    break;

  case 'yarn':
    installed = parseYarn(projectPath);
    break;

  case 'pnpm':
    installed = parsePnpm(projectPath);
    break;

  case 'bun':
    installed = parseBun(projectPath);
    break;

  default:
    console.log('Unsupported package manager or none detected.');
    process.exit(1);
}

console.log('Installed dependencies:', installed);
