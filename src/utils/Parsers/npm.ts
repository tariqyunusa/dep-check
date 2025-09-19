import {readFileSync} from 'fs';
import {join} from 'path';

export const parseNpm = (projectPath: string) => {
  const pkgFile = join(projectPath, 'package.json');
  const lockFile = join(projectPath, 'package-lock.json');

  const pkgJson = JSON.parse(readFileSync(pkgFile, 'utf-8'));
  const lockJson = JSON.parse(readFileSync(lockFile, 'utf-8'));

  const declared = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  };

  if (lockJson.dependencies) {
    return Object.keys(declared).filter((dep) =>
      Object.prototype.hasOwnProperty.call(lockJson.dependencies, dep)
    );
  }

  if (lockJson.packages) {
    return Object.keys(declared).filter((dep) =>
      Object.keys(lockJson.packages).includes(`node_modules/${dep}`)
    );
  }

  return [];
};
