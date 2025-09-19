import {execSync} from 'child_process';

export const parseBun = (projectPath: string) => {
  try {
    const output = execSync('bun pm ls --json', {cwd: projectPath});
    const parsed = JSON.parse(output.toString());
    return parsed.map((dep: {name: string}) => dep.name);
  } catch (e) {
    console.error('Error parsing Bun dependencies:', e);
    return [];
  }
};
