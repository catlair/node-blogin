import QRCode from 'qrcode';
import { cookieJar } from './net';

function printQRCode(url: string) {
  QRCode.toString(url, { type: 'utf8' }, function (err, code) {
    console.log(code);
    console.log(url);
    console.log('请使用手机扫描二维码登录');
  });
}

export async function mbLogin() {
  const { getAuthCode, getPoll } = await import('./mb-net');
  const { data, code, message } = await getAuthCode();
  if (code !== 0) {
    throw new Error(`${code}: ${message}`);
  }
  const { auth_code, url } = data;
  printQRCode(url);
  let count = 0;
  const timer = setInterval(async () => {
    const { data, code, message } = await getPoll(auth_code);
    if (code === 86038) {
      clearInterval(timer);
      console.log(message);
    } else if (code === 0) {
      clearInterval(timer);
      console.log(`登录成功：
mid: ${data.mid}
access_token: ${data.access_token}
refresh_token: ${data.refresh_token}
expires_in: ${data.expires_in}`);
    } else {
      if (count > 4) {
        // 清屏
        console.log('\x1Bc');
        count = 0;
        printQRCode(url);
      }
      console.log(message);
    }
    count++;
  }, 3000);
}

export async function pcLogin() {
  const { generateQRCode, pollQRCode, getCookie } = await import('./pc-net');
  const { data, code, message } = await generateQRCode();
  if (code !== 0) {
    throw new Error(`${code}: ${message}`);
  }
  const { qrcode_key, url } = data;
  printQRCode(url);
  let count = 0;
  const timer = setInterval(async () => {
    const data = await pollQRCode(qrcode_key);
    if (data.code !== 0) {
      throw new Error(`${data.code}: ${data.message}`);
    }
    const { code, message, refresh_token, timestamp } = data.data;
    if (code === 86038) {
      clearInterval(timer);
      console.log(message);
    } else if (code === 86090) {
      console.log(message);
      count++;
    } else if (code === 0) {
      clearInterval(timer);
      await getCookie();
      console.log(`登录成功：
refresh_token: ${refresh_token}
timestamp: ${timestamp}
cookie: ${await cookieJar.getCookieString()}`);
    } else {
      if (count > 4) {
        // 清屏
        console.log('\x1Bc');
        count = 0;
        printQRCode(url);
      }
      console.log(message);
    }
    count++;
  }, 3000);
}
