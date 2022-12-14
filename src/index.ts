import QRCode from 'qrcode';
import { cookieJar } from './net';

function printQRCode(url: string) {
  QRCode.toString(url, { type: 'utf8' }, function (err, code) {
    console.log(code);
    console.log(url);
    console.log('请使用手机扫描二维码登录');
  });
}

export function mbLogin() {
  return new Promise<
    | {
        mid: number;
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }
    | undefined
  >(async (resolve, reject) => {
    const { getAuthCode, getPoll } = await import('./mb-net');
    const { data, code, message } = await getAuthCode();
    if (code !== 0) {
      return reject(new Error(`${code}: ${message}`));
    }
    const { auth_code, url } = data;
    printQRCode(url);
    let count = 0;
    const timer = setInterval(async () => {
      const { data, code, message } = await getPoll(auth_code);
      if (code === 86038) {
        clearInterval(timer);
        console.log(message);
        return resolve(undefined);
      } else if (code === 0) {
        clearInterval(timer);
        return resolve(data);
      }
      if (count > 4) {
        // 清屏
        console.log('\x1Bc');
        count = 0;
        printQRCode(url);
      }
      console.log(message);
      count++;
    }, 3000);
  });
}

export function pcLogin() {
  return new Promise<
    | {
        refresh_token: string;
        timestamp: number;
        cookie: string;
        mid: number;
      }
    | undefined
  >(async (resolve, reject) => {
    const { generateQRCode, pollQRCode, getCookie } = await import('./pc-net');
    const { data, code, message } = await generateQRCode();
    if (code !== 0) {
      return reject(new Error(`${code}: ${message}`));
    }
    const { qrcode_key, url } = data;
    printQRCode(url);
    let count = 0;
    const timer = setInterval(async () => {
      const data = await pollQRCode(qrcode_key);
      if (data.code !== 0) {
        console.log(`${data.code}: ${data.message}`);
        return resolve(undefined);
      }
      const { code, message, refresh_token, timestamp } = data.data;
      if (code === 86038) {
        clearInterval(timer);
        console.log(message);
        return resolve(undefined);
      } else if (code === 86090) {
        console.log(message);
        count++;
      } else if (code === 0) {
        clearInterval(timer);
        await getCookie();
        const cookie = await cookieJar.getCookieString();
        return resolve({
          refresh_token,
          timestamp,
          cookie,
          mid: +cookieJar.getCookieItem('DedeUserID'),
        });
      }
      if (count > 4) {
        // 清屏
        console.log('\x1Bc');
        count = 0;
        printQRCode(url);
      }
      console.log(message);
      count++;
    }, 3000);
  });
}
