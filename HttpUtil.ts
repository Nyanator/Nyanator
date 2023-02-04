
/**
* httpのcontentTypeに指定する定義
* フレームワークによっては定義されていることもあるようだが、GASにはないので自作
*/
class MediaType {
  static get APPLICATION_JSON()         { return 'application/json' }
  static get APPLICATION_OCTET_STREAM() { return 'application/octet-stream' }
  static get IMAGE_JPEG ()              { return 'image/jpeg' }
}

/**
* httpのmethodに指定する定義
* フレームワークによっては定義されていることもあるようだが、GASにはないので自作
*/
class HttpMethod {
  static get POST()   : GoogleAppsScript.URL_Fetch.HttpMethod { return 'post' }
  static get GET()    : GoogleAppsScript.URL_Fetch.HttpMethod { return 'get' }
  static get PUT()    : GoogleAppsScript.URL_Fetch.HttpMethod { return 'put' }
  static get PATCH()  : GoogleAppsScript.URL_Fetch.HttpMethod { return 'patch' }
  static get DELETE() : GoogleAppsScript.URL_Fetch.HttpMethod { return 'delete' }
}

/**
* httpの認証に指定する定義
* フレームワークによっては定義されていることもあるようだが、GASにはないので自作
*/
class Authorization {
  /**
  * Bearer文字列の生成
  * @param {string} apiToken - APIのトークン
  * @return {string} Bearer文字列
  */
  static MakeBearer(apiToken : string) { return `Bearer ${apiToken}` }

  /**
  * 通常認証文字列の生成
  * @param {string} key - 通常認証のキー
  * @return {string} 通常認証の文字列
  */
  static MakeBasic(key : string) { return `Basic ${key}` }
}

/**
* ファイル拡張子
*/
class FileNameExtension {
  static get JPEG() { return 'jpeg' }
}