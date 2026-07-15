import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export type Locale = 'en' | 'ko';

export interface GlobalConfig {
  schemaVersion: 1;
  locale: Locale;
}

export type GlobalConfigWarningCode = 'MALFORMED_CONFIG' | 'UNSUPPORTED_SCHEMA';

export type GlobalConfigWarningDetail =
  'invalid-json' | 'not-object' | 'invalid-schema-version' | 'invalid-locale';

export interface GlobalConfigWarning {
  code: GlobalConfigWarningCode;
  path: string;
  detail?: GlobalConfigWarningDetail;
  schemaVersion?: number;
}

export interface GlobalConfigReadResult {
  path: string;
  locale: Locale;
  config: GlobalConfig | null;
  warning?: GlobalConfigWarning;
}

export type SetGlobalLocaleResult =
  | { ok: true; path: string; config: GlobalConfig; warning?: GlobalConfigWarning }
  | { ok: false; path: string; locale: Locale; warning: GlobalConfigWarning };

export interface GlobalConfigPathInputs {
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  homedir?: string;
}

export interface WriteGlobalConfigOptions extends GlobalConfigPathInputs {
  tempSuffix?: string;
  afterWriteForTest?: (tempPath: string) => void;
}

const CONFIG_FILE_NAME = 'config.json';
const DEFAULT_CONFIG: GlobalConfig = { schemaVersion: 1, locale: 'en' };

export function resolveGlobalConfigDir(inputs: GlobalConfigPathInputs = {}): string {
  const env = inputs.env ?? process.env;
  const platform = inputs.platform ?? process.platform;
  const home = inputs.homedir ?? os.homedir();
  const sduckConfigHome = nonEmpty(env['SDUCK_CONFIG_HOME']);
  if (sduckConfigHome !== undefined) return path.resolve(sduckConfigHome);
  const xdgConfigHome = nonEmpty(env['XDG_CONFIG_HOME']);
  if (xdgConfigHome !== undefined) return path.join(path.resolve(xdgConfigHome), 'sduck');
  if (platform === 'darwin') return path.join(home, 'Library', 'Application Support', 'sduck');
  if (platform === 'win32') {
    const appData = nonEmpty(env['APPDATA']);
    return path.join(appData ?? path.join(home, 'AppData', 'Roaming'), 'sduck');
  }
  return path.join(home, '.config', 'sduck');
}

export function resolveGlobalConfigPath(inputs: GlobalConfigPathInputs = {}): string {
  return path.join(resolveGlobalConfigDir(inputs), CONFIG_FILE_NAME);
}

export function readGlobalConfig(inputs: GlobalConfigPathInputs = {}): GlobalConfigReadResult {
  const configPath = resolveGlobalConfigPath(inputs);
  if (!fs.existsSync(configPath)) {
    return { path: configPath, locale: DEFAULT_CONFIG.locale, config: null };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8')) as unknown;
    const parsed = parseGlobalConfig(raw, configPath);
    if ('warning' in parsed) {
      return {
        path: configPath,
        locale: DEFAULT_CONFIG.locale,
        config: null,
        warning: parsed.warning,
      };
    }
    return { path: configPath, locale: parsed.config.locale, config: parsed.config };
  } catch {
    return {
      path: configPath,
      locale: DEFAULT_CONFIG.locale,
      config: null,
      warning: malformedWarning(configPath, 'invalid-json'),
    };
  }
}

export function setGlobalLocale(
  locale: Locale,
  options: WriteGlobalConfigOptions = {},
): SetGlobalLocaleResult {
  const existing = readGlobalConfig(options);
  if (existing.warning?.code === 'UNSUPPORTED_SCHEMA') {
    return {
      ok: false,
      path: existing.path,
      locale: DEFAULT_CONFIG.locale,
      warning: existing.warning,
    };
  }
  const config: GlobalConfig = { schemaVersion: 1, locale };
  writeConfigAtomically(existing.path, `${JSON.stringify(config, null, 2)}\n`, options);
  return existing.warning === undefined
    ? { ok: true, path: existing.path, config }
    : { ok: true, path: existing.path, config, warning: existing.warning };
}

function parseGlobalConfig(
  value: unknown,
  configPath: string,
): { config: GlobalConfig } | { warning: GlobalConfigWarning } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { warning: malformedWarning(configPath, 'not-object') };
  }
  const raw = value as Record<string, unknown>;
  if (raw['schemaVersion'] !== 1) {
    return {
      warning:
        typeof raw['schemaVersion'] === 'number' && raw['schemaVersion'] > 1
          ? unsupportedSchemaWarning(configPath, raw['schemaVersion'])
          : malformedWarning(configPath, 'invalid-schema-version'),
    };
  }
  if (raw['locale'] !== 'en' && raw['locale'] !== 'ko') {
    return { warning: malformedWarning(configPath, 'invalid-locale') };
  }
  return { config: { schemaVersion: 1, locale: raw['locale'] } };
}

function writeConfigAtomically(
  filePath: string,
  content: string,
  options: WriteGlobalConfigOptions,
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const suffix =
    options.tempSuffix ?? `${String(process.pid)}.${String(Date.now())}.${randomSuffix()}`;
  const tempPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${suffix}.tmp`);
  let createdTemp = false;
  let fd: number | null = null;
  try {
    fd = fs.openSync(tempPath, 'wx', 0o600);
    createdTemp = true;
    fs.writeFileSync(fd, content);
    fs.fsyncSync(fd);
    options.afterWriteForTest?.(tempPath);
  } catch (error) {
    closeIgnoringErrors(fd);
    fd = null;
    if (createdTemp) fs.rmSync(tempPath, { force: true });
    throw error;
  }
  try {
    fs.closeSync(fd);
    fd = null;
  } catch (error) {
    fs.rmSync(tempPath, { force: true });
    throw error;
  }
  try {
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    fs.rmSync(tempPath, { force: true });
    throw error;
  }
  fsyncDirectory(path.dirname(filePath));
}

function fsyncDirectory(dir: string): void {
  let fd: number | null = null;
  try {
    fd = fs.openSync(dir, 'r');
    fs.fsyncSync(fd);
  } catch {
    // Best effort for filesystems/platforms that do not support directory fsync.
  } finally {
    closeIgnoringErrors(fd);
  }
}

function closeIgnoringErrors(fd: number | null): void {
  if (fd === null) return;
  try {
    fs.closeSync(fd);
  } catch {
    // Cleanup-only close failures must not mask the original operation result.
  }
}

function malformedWarning(
  configPath: string,
  detail: GlobalConfigWarningDetail,
): GlobalConfigWarning {
  return {
    code: 'MALFORMED_CONFIG',
    path: configPath,
    detail,
  };
}

function unsupportedSchemaWarning(configPath: string, schemaVersion: number): GlobalConfigWarning {
  return {
    code: 'UNSUPPORTED_SCHEMA',
    path: configPath,
    schemaVersion,
  };
}

function nonEmpty(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === '' ? undefined : value;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2);
}
