import {readFileSync} from 'fs';
import {join} from 'path';

export const parseBun = (projectPath: string) => {
  try {
    const pkgPath = join(projectPath, 'package.json');
    const raw = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);

    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    };

    return Object.keys(deps);
  } catch (e) {
    console.error('Error parsing Bun dependencies:', e);
    return [];
  }
};
