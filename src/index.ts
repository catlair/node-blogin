import QRCode from 'qrcode';
import { cookieJar } from './net';

const KEY_SEC = {
  '783bbb7264451d82': '2653583c8873dea268ab9386918b1d65',
  '8d23902c1688a798': '710f0212e62bd499b8d3ac6e1db9302a',
  bca7e84c2d947ac6: '60698ba2f68e01ce44738920a0ffe768',
  '27eb53fc9058f8c3': 'c2ed53a74eeefe3cf99fbd01d8c9c375',
  '4409e2ce8ffd12b8': '59b43e04ad6965f34319062b478f83dd',
  dfca71928277209b: 'b5475a8825547a4fc26c7d518eaaa02e',
};

function printQRCode(url: string) {
  QRCode.toString(url, { type: 'utf8' }, function (err, code) {
    console.log(code);
    console.log(url);
    console.log('请使用手机扫描二维码登录');
  });
}

export function mbLogin(appkey = '783bbb7264451d82', appsec = KEY_SEC[appkey]) {
  return new Promise<
    | {
        mid: number;
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }
    | undefined
  >(async (resolve, reject) => {
    if (!appkey || !appsec) return reject('Invalid appkey or appsec');
    const { getAuthCode, getPoll } = await import('./mb-net');
    const { data, code, message } = await getAuthCode(appkey, appsec);
    if (code !== 0) {
      return reject(new Error(`${code}: ${message}`));
    }
    const { auth_code, url } = data;
    printQRCode(url);
    let count = 0;
    const timer = setInterval(async () => {
      const { data, code, message } = await getPoll(auth_code, appkey, appsec);
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
