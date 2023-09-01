import { CookieJar } from '@catlair/node-got/cookie';

export const cookieJar: {
  getCookieString: () => Promise<string>;
  setCookie: (rawCookie: string) => Promise<unknown>;
  getCookieItem: (key: string) => string;
} = new CookieJar();

export type BaseResponse<T> = {
  code: number;
  message: string;
  ttl: number;
  data: T;
};
