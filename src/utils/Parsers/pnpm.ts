import {readFileSync} from 'fs';
import {join} from 'path';

export const parsePnpm = (projectPath: string) => {
  const pkgPath = join(projectPath, 'package.json');
  const raw = readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw);

  return [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
};
