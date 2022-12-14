#!/usr/bin/env node
import { pcLogin, mbLogin } from '.';

(async () => {
  if (process.argv[2] === 'mb') {
    console.log('获取 access_token');
    console.log(await mbLogin());
  } else {
    console.log('获取 cookie');
    console.log(await pcLogin());
  }
})();
