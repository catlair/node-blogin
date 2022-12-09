import * as crypto from 'crypto';

type Params = Record<string, string | boolean | number | Array<any>>;

/**
 * 安全的随机数
 * @description 我不需要安全，但是它总是给 Math.random 一个警告
 */
export function safeRandom() {
  return crypto.randomBytes(4).readUInt32LE() / 0xffffffff;
}

export function random(floating?: boolean): number;
export function random(lower: number, floating?: boolean): number;
export function random(lower: number, upper: number, floating?: boolean): number;
/**
 * 生成随机数
 * @description 生成一个随机数，范围在 min 和 max 之间（包括 min 和 max）
 * @param lower
 * @param upper
 * @param floating
 */
export function random(lower?: number | boolean, upper?: number | boolean, floating?: boolean) {
  if (floating === undefined) {
    if (typeof upper === 'boolean') {
      floating = upper;
      upper = undefined;
    } else if (typeof lower === 'boolean') {
      floating = lower;
      lower = undefined;
    }
  }
  if (lower === undefined && upper === undefined) {
    lower = 0;
    upper = 1;
  } else if (upper === undefined) {
    upper = lower;
    lower = 0;
  }
  lower = Number(lower);
  upper = Number(upper);
  if (lower > upper) {
    const temp = lower;
    lower = upper;
    upper = temp;
  }
  if (floating || lower % 1 || upper % 1) {
    const rand = safeRandom();
    return Math.min(
      lower + rand * (upper - lower + parseFloat('1e-' + ((rand + '').length - 1))),
      upper,
    );
  }
  return lower + Math.floor(safeRandom() * (upper - lower + 1));
}

export function getUnixTime() {
  return Math.floor(new Date().getTime() / 1000);
}
export function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`;
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object');
}

export function isArray(val: any): val is Array<any> {
  return val !== null && Array.isArray(val);
}

/**
 * md5 hash
 * @param str
 * @param uppercase
 */
export function md5(str: string, uppercase = false) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return uppercase ? hash.digest('hex').toUpperCase() : hash.digest('hex');
}

/**
 *  stringify
 * @param entries
 */
export function stringify(entries: Record<string, any> | [string, any][]): string {
  if (!isObject(entries) && !isArray(entries)) {
    return entries;
  }
  const searchParams = new URLSearchParams();
  if (!Array.isArray(entries)) {
    entries = Object.entries(entries);
  }
  entries.forEach(([key, value]) => {
    if (isObject(value)) {
      searchParams.append(key, JSON.stringify(value));
      return;
    }
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
}

export function createBuvid(prefix = 'XY') {
  const rs = crypto.randomBytes(16).toString('hex').toUpperCase();
  // 其实随机生成就行了，但是万一哪天他要校验呢
  return `${prefix}${rs[2]}${rs[12]}${rs[22]}${rs}`;
}
function sortParams(params: Params) {
  const keys = Object.keys(params).sort();
  return keys.map(key => [key, params[key].toString()]);
}

export function getSign(params: Params, appsec: string) {
  const query = stringify(sortParams(params));
  return query + '&sign=' + md5(query + appsec);
}
