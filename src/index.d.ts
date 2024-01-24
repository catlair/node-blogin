import type { LoginInfo } from './mb-net';
import type { BaseResponse } from './net';

export function mbLogin(
  appkey: string,
  appsec: string,
): Promise<{
  mid: number;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}>;

export function pcLogin(): Promise<{
  refresh_token: string;
  timestamp: number;
  cookie: string;
  mid: number;
}>;

export function cookieToToken(
  cookie: string,
  build: string | number,
  appkey: string,
  appsec: string,
): Promise<BaseResponse<LoginInfo>>;
