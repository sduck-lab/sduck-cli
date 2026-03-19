import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function copyFixture(name: string, targetDir: string): Promise<string> {
  const source = join(process.cwd(), 'tests', 'fixtures', name);
  const destination = join(targetDir, name);

  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });

  return destination;
}
