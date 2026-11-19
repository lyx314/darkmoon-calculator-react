import { DEFAULT_DATA } from "../data/defaults";
import { enemyLevelRanges, materials } from "../data/materials";
import { isColorTheme } from "../domain/themes";
import type {
  CraftOptions,
  DarkmoonData,
  EnemiesConfigRecord,
  EnemyConfig,
  ListOptions,
  MaterialRecord,
  Triplet,
} from "../domain/types";

/** localStorage 键名，与原版保持一致 */
export const STORAGE_KEY = "data";

const MAX_ID = materials.length;
const MAX_LEVEL = enemyLevelRanges.length - 1;

function isTriplet(value: unknown): value is Triplet<number> {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

function sanitizeRecord(value: unknown): MaterialRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<MaterialRecord>;
  const id = Number(record.id);
  if (!Number.isInteger(id) || id < 1 || id > MAX_ID) return null;

  const numbers: Triplet<number> = isTriplet(record.numbers)
    ? record.numbers
    : [0, 0, 0];
  const lock: Triplet<number> | null = isTriplet(record.lock) ? record.lock : null;
  return { id, numbers, lock };
}

function sanitizeEnemyConfig(value: unknown): EnemyConfig | null {
  if (!value || typeof value !== "object") return null;
  const config = value as Partial<EnemyConfig>;
  const level = Number(config.level);
  return {
    name: typeof config.name === "string" ? config.name : "",
    level: Number.isInteger(level) && level >= 0 && level <= MAX_LEVEL ? level : MAX_LEVEL,
    number: Number.isFinite(Number(config.number)) ? Number(config.number) : 0,
    activated: Boolean(config.activated),
  };
}

function mergeListOptions(value: unknown): ListOptions {
  const raw = (value ?? {}) as Partial<ListOptions>;
  return {
    ...DEFAULT_DATA.listOptions,
    ...Object.fromEntries(
      Object.entries(DEFAULT_DATA.listOptions).map(([key, fallback]) => [
        key,
        typeof raw[key as keyof ListOptions] === "boolean"
          ? raw[key as keyof ListOptions]
          : fallback,
      ]),
    ),
  } as ListOptions;
}

function mergeCraftOptions(value: unknown): CraftOptions {
  const raw = (value ?? {}) as Partial<CraftOptions>;
  return {
    ...DEFAULT_DATA.craftOptions,
    ...Object.fromEntries(
      Object.entries(DEFAULT_DATA.craftOptions).map(([key, fallback]) => [
        key,
        typeof raw[key as keyof CraftOptions] === "boolean"
          ? raw[key as keyof CraftOptions]
          : fallback,
      ]),
    ),
  } as CraftOptions;
}

/**
 * 把任意来源（localStorage / 导入的 JSON）的数据规范化成完整的 DarkmoonData。
 * 缺失或非法字段一律回退到默认值，保证旧版本数据也能读入。
 */
export function normalizeData(input: unknown): DarkmoonData {
  const raw = (input ?? {}) as Partial<DarkmoonData>;

  const currentID = Number(raw.currentID);
  const materialsNumbers: MaterialRecord[] = Array.isArray(raw.materialsNumbers)
    ? raw.materialsNumbers
        .map(sanitizeRecord)
        .filter((item): item is MaterialRecord => item !== null)
    : [];

  const enemiesConfig: EnemiesConfigRecord[] = Array.isArray(raw.enemiesConfig)
    ? (raw.enemiesConfig as unknown[])
        .map((item): EnemiesConfigRecord | null => {
          if (!item || typeof item !== "object") return null;
          const record = item as { id?: unknown; config?: unknown };
          const id = Number(record.id);
          if (!Number.isInteger(id) || id < 1 || id > MAX_ID) return null;
          const config = Array.isArray(record.config)
            ? record.config
                .map(sanitizeEnemyConfig)
                .filter((entry): entry is EnemyConfig => entry !== null)
            : [];
          return { id, config };
        })
        .filter((item): item is EnemiesConfigRecord => item !== null)
    : [];

  return {
    format: "DARKMOON",
    currentID:
      Number.isInteger(currentID) && currentID >= 1 && currentID <= MAX_ID
        ? currentID
        : DEFAULT_DATA.currentID,
    materialsNumbers,
    enemiesConfig,
    listOptions: mergeListOptions(raw.listOptions),
    craftOptions: mergeCraftOptions(raw.craftOptions),
    colorTheme: isColorTheme(raw.colorTheme)
      ? raw.colorTheme
      : DEFAULT_DATA.colorTheme,
    isWorldLevel9:
      typeof raw.isWorldLevel9 === "boolean"
        ? raw.isWorldLevel9
        : DEFAULT_DATA.isWorldLevel9,
  };
}

/**
 * 取 localStorage。
 *
 * 在 Node/测试环境或隐私模式下访问可能抛错，这里统一兜底成 null，
 * 让 storage 层可以安全地在无浏览器环境下导入。
 */
function getStorage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage
      ? window.localStorage
      : null;
  } catch {
    return null;
  }
}

/** 从 localStorage 读取；失败时回退到默认数据 */
export function loadData(): DarkmoonData {
  const storage = getStorage();
  if (!storage) return structuredClone(DEFAULT_DATA);

  try {
    const cached = storage.getItem(STORAGE_KEY);
    if (!cached) return structuredClone(DEFAULT_DATA);
    return normalizeData(JSON.parse(cached));
  } catch (error) {
    console.warn("读取本地数据失败，已回退到默认数据。", error);
    return structuredClone(DEFAULT_DATA);
  }
}

/**
 * 写入 localStorage。
 *
 * 数据体积很小（最多 53 条记录），直接同步写入即可；
 * 不做防抖是因为用户可能在改动后立刻刷新页面，延迟写会丢掉最后一次修改。
 */
export function saveData(data: DarkmoonData): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("保存本地数据失败。", error);
  }
}

export function clearStoredData(): void {
  getStorage()?.removeItem(STORAGE_KEY);
}
