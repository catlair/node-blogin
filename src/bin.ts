#!/usr/bin/env node
import { pcLogin, mbLogin, cookieToToken } from '.';

const log = (resp: any) => console.log(JSON.stringify(resp, null, 2));

(async () => {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'mb': {
      console.log('获取 access_token');
      const resp = await mbLogin(process.argv[3], process.argv[4]);
      log(resp);
      return resp;
    }
    case 'new':
    case 'c2a':
    case 'c2c': {
      console.log('将 cookie 转换为 access_key/new cookie');
      if (!process.argv[3]) break;
      const resp = await cookieToToken(
        process.argv[3],
        process.argv[4],
        process.argv[5],
        process.argv[6],
      );
      log(resp);
      const { cookieJar } = await import('./net');
      const cookies = resp.data.cookie_info.cookies;
      await cookieJar.setCookie(cookies.map(({ name, value }) => `${name}=${value}`));
      console.log('新的Cookie:', await cookieJar.getCookieString());
      return resp;
    }
    default: {
      console.log('获取 cookie');
      const resp = await pcLogin();
      log(resp);
      return resp;
    }
  }
})();
