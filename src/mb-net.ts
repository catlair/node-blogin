import { createRequest } from '@catlair/node-got';
import { BaseResponse, cookieJar } from './net';
import { getSign, getUnixTime, random } from './utils';

const v1 = 7,
  v2 = random(50, 80),
  v3 = random(0, 9);

const build = `${v1}${v2}0${v3}00`;

const mobileHttp = createRequest({
  timeout: 10000,
  headers: {
    'user-agent': createRandomMBUA(),
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

function createRandomMBUA() {
  const channels = [
    '360',
    'baidu',
    'xiaomi',
    'meizu',
    'oppo',
    'vivo',
    'coolpad',
    'lenovo',
    'samsung',
    'gionee',
    'smartisan',
    'oneplus',
    'zte',
    'nubia',
    'sony',
    'htc',
    'asus',
    'alps',
    'lg',
    'google',
  ];
  const modelRandom = random(6, 13);
  const xiaomiModels = [
    `MI ${modelRandom}`,
    `MI ${modelRandom} X`,
    `MI ${modelRandom} SE`,
    `MI ${modelRandom} Pro`,
    `MI ${modelRandom} Lite`,
    `MI ${modelRandom} Youth`,
  ];
  const osVer = random(7, 13);
  return `Mozilla/5.0 BiliDroid/${v1}.${v2}.0 (bbcallen@gmail.com) os/android model/${
    xiaomiModels[random(xiaomiModels.length - 1)]
  } mobi_app/android build/${build} channel/${
    channels[random(channels.length - 1)]
  } innerVer/xiaomi osVer/${osVer} network/2`;
}

export function getAppSign(
  params: Record<string, string | boolean | number | Array<any>>,
  appkey = '783bbb7264451d82',
  appsec = '2653583c8873dea268ab9386918b1d65',
) {
  return getSign(
    {
      platform: 'android',
      mobi_app: 'android',
      disable_rcmd: 0,
      build,
      c_locale: 'zh_CN',
      s_locale: 'zh_CN',
      ts: getUnixTime(),
      local_id: 0,
      actionKey: 'appkey',
      appkey,
      ...params,
    },
    appsec,
  );
}

export async function getAuthCode(appkey: string, appsec: string) {
  return mobileHttp.post<
    BaseResponse<{
      auth_code: string;
      url: string;
    }>
  >(
    'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code',
    getAppSign({}, appkey, appsec),
  );
}

export async function getPoll(authCode: string, appkey: string, appsec: string) {
  return mobileHttp.post<
    BaseResponse<{
      mid: number;
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>
  >(
    'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll',
    getAppSign(
      {
        auth_code: authCode,
      },
      appkey,
      appsec,
    ),
  );
}
