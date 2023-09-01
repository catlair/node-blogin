import { createRequest } from '@catlair/node-got';
import { BaseResponse, cookieJar } from './net';
import { random } from './utils';

const v1 = random(90, 122),
  v2 = random(1500),
  v3 = random(9);

const biliHttp = createRequest({
  timeout: 10000,
  headers: {
    'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v1}.0.0.0 Safari/537.36 Edg/${v1}.0.${v2}.${v3}`,
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'accept-language': 'zh-CN,zh;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
  },
  // 配置项，下面的选项都可以在独立的接口请求中覆盖
  requestOptions: {
    // 需要对返回数据进行处理
    isTransformResponse: true,
    // 忽略重复请求
    ignoreCancelToken: true,
  },
  cookieJar,
});

export function generateQRCode() {
  return biliHttp.get<
    BaseResponse<{
      qrcode_key: string;
      url: string;
    }>
  >('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
}

export function pollQRCode(key: string) {
  return biliHttp.get(
    `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${key}`,
  );
}

export function getCookie() {
  try {
    return biliHttp.get('https://www.bilibili.com/');
  } catch (error) {
    return error;
  }
}
