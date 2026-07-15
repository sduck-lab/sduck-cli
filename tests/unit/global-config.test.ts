import { existsSync, statSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  readGlobalConfig,
  resolveGlobalConfigDir,
  resolveGlobalConfigPath,
  setGlobalLocale,
} from '../../src/config/global-config.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('global config', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('resolves config path precedence across platforms', async () => {
    workspace = await createTempWorkspace('global-config-path-');
    const home = join(workspace, 'home');

    expect(
      resolveGlobalConfigPath({
        env: {
          SDUCK_CONFIG_HOME: join(workspace, 'sduck-home'),
          XDG_CONFIG_HOME: join(workspace, 'xdg'),
        },
        homedir: home,
        platform: 'linux',
      }),
    ).toBe(join(workspace, 'sduck-home', 'config.json'));

    expect(
      resolveGlobalConfigDir({
        env: { XDG_CONFIG_HOME: join(workspace, 'xdg') },
        homedir: home,
        platform: 'darwin',
      }),
    ).toBe(join(workspace, 'xdg', 'sduck'));

    expect(resolveGlobalConfigDir({ env: {}, homedir: home, platform: 'darwin' })).toBe(
      join(home, 'Library', 'Application Support', 'sduck'),
    );
    expect(resolveGlobalConfigDir({ env: {}, homedir: home, platform: 'linux' })).toBe(
      join(home, '.config', 'sduck'),
    );
    expect(
      resolveGlobalConfigDir({
        env: { APPDATA: join(workspace, 'AppData') },
        homedir: home,
        platform: 'win32',
      }),
    ).toBe(join(workspace, 'AppData', 'sduck'));
    expect(resolveGlobalConfigDir({ env: {}, homedir: home, platform: 'win32' })).toBe(
      join(home, 'AppData', 'Roaming', 'sduck'),
    );
  });

  it('returns English without creating config when absent', async () => {
    workspace = await createTempWorkspace('global-config-absent-');
    const configHome = join(workspace, 'config');

    const result = readGlobalConfig({ env: { SDUCK_CONFIG_HOME: configHome } });

    expect(result).toMatchObject({ locale: 'en', config: null });
    expect(result.warning).toBeUndefined();
    expect(existsSync(configHome)).toBe(false);
  });

  it('warns for malformed supported config but allows explicit locale write to repair it', async () => {
    workspace = await createTempWorkspace('global-config-malformed-');
    const configHome = join(workspace, 'config');
    const configPath = join(configHome, 'config.json');
    await mkdir(configHome, { recursive: true });
    await writeFile(
      configPath,
      `${JSON.stringify({ schemaVersion: 1, locale: 'fr', extra: true })}\n`,
    );

    const read = readGlobalConfig({ env: { SDUCK_CONFIG_HOME: configHome } });
    expect(read.locale).toBe('en');
    expect(read.warning).toMatchObject({
      code: 'MALFORMED_CONFIG',
      path: configPath,
      detail: 'invalid-locale',
    });

    const written = setGlobalLocale('ko', {
      env: { SDUCK_CONFIG_HOME: configHome },
      tempSuffix: 'repair',
    });
    expect(written.ok).toBe(true);
    expect(JSON.parse(await readFile(configPath, 'utf8'))).toEqual({
      schemaVersion: 1,
      locale: 'ko',
    });
  });

  it('does not overwrite unsupported future schema', async () => {
    workspace = await createTempWorkspace('global-config-future-');
    const configHome = join(workspace, 'config');
    const configPath = join(configHome, 'config.json');
    await mkdir(configHome, { recursive: true });
    await writeFile(configPath, `${JSON.stringify({ schemaVersion: 2, locale: 'ko' })}\n`);

    const result = setGlobalLocale('en', {
      env: { SDUCK_CONFIG_HOME: configHome },
      tempSuffix: 'future',
    });

    expect(result.ok).toBe(false);
    expect(result.warning).toMatchObject({
      code: 'UNSUPPORTED_SCHEMA',
      path: configPath,
      schemaVersion: 2,
    });
    expect(JSON.parse(await readFile(configPath, 'utf8'))).toEqual({
      schemaVersion: 2,
      locale: 'ko',
    });
    expect((await readdir(configHome)).filter((entry) => entry.includes('future'))).toEqual([]);
  });

  it('writes atomically with restrictive temp files and cleans up after write failure', async () => {
    workspace = await createTempWorkspace('global-config-atomic-');
    const configHome = join(workspace, 'config');
    const configPath = join(configHome, 'config.json');
    const tempSuffix = 'forced-failure';
    let observedMode: number | null = null;
    const priorConfig = `${JSON.stringify({ schemaVersion: 1, locale: 'en' }, null, 2)}\n`;
    await mkdir(configHome, { recursive: true });
    await writeFile(configPath, priorConfig);

    expect(() =>
      setGlobalLocale('ko', {
        env: { SDUCK_CONFIG_HOME: configHome },
        tempSuffix,
        afterWriteForTest: (tempPath) => {
          observedMode = statSync(tempPath).mode & 0o777;
          throw new Error('forced failure');
        },
      }),
    ).toThrow(/forced failure/);

    expect(observedMode).toBe(0o600);
    expect(await readFile(configPath, 'utf8')).toBe(priorConfig);
    expect((await readdir(configHome)).filter((entry) => entry.includes(tempSuffix))).toEqual([]);

    const ok = setGlobalLocale('en', { env: { SDUCK_CONFIG_HOME: configHome }, tempSuffix: 'ok' });
    expect(ok.ok).toBe(true);
    expect(JSON.parse(await readFile(configPath, 'utf8'))).toEqual({
      schemaVersion: 1,
      locale: 'en',
    });
    if (process.platform !== 'win32') {
      expect(statSync(configPath).mode & 0o777).toBe(0o600);
    }
  });
});
