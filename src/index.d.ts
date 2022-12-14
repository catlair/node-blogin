export function mbLogin(): Promise<{
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
