import {readFileSync} from 'fs';
import {join} from 'path';
import {parse} from '@yarnpkg/lockfile';

const parseYarn = (projectPath: string) => {
  const filePath = join(projectPath, 'yarn.lock');
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = parse(raw);

  return Object.keys(parsed.object || {});
};

export {parseYarn};
