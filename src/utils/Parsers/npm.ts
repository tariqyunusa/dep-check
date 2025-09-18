import {readFileSync} from 'fs';
import {join} from 'path';
import {json} from 'stream/consumers';

export const parseNpm = (projectPath: string) => {
  const file = join(projectPath, 'package-lock.json');
  const raw = readFileSync(file, 'utf-8');
  const json = JSON.parse(raw);

  return Object.keys(json.dependencies || {});
};
