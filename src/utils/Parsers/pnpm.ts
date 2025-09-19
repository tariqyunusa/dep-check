import {readFileSync} from 'fs';
import {join} from 'path';
import {parse} from 'yaml';

export const parsePnpm = (projectPath: string) => {
  const filePath = join(projectPath, 'pnpm-lock.yaml');
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = parse(raw);

  return Object.keys(parsed.packages || {});
};
