/**
 * httpのcontentTypeに指定する定義
 * フレームワークによっては定義されていることもあるようだが、GASにはないので自作
 */
export class MediaType {
  static get APPLICATION_JSON(): string {
    return "application/json";
  }
  static get APPLICATION_OCTET_STREAM(): string {
    return "application/octet-stream";
  }
  static get IMAGE_JPEG(): string {
    return "image/jpeg";
  }
}

/**
 * httpのmethodに指定する定義
 * フレームワークによっては定義されていることもあるようだが、GASにはないので自作
 */
export class HttpMethod {
  static get POST(): GoogleAppsScript.URL_Fetch.HttpMethod {
    return "post";
  }
  static get GET(): GoogleAppsScript.URL_Fetch.HttpMethod {
    return "get";
  }
  static get PUT(): GoogleAppsScript.URL_Fetch.HttpMethod {
    return "put";
  }
  static get PATCH(): GoogleAppsScript.URL_Fetch.HttpMethod {
    return "patch";
  }
  static get DELETE(): GoogleAppsScript.URL_Fetch.HttpMethod {
    return "delete";
  }
}

/**
 * httpの認証に指定する定義
 * フレームワークによっては定義されていることもあるようだが、GASにはないので自作
 */
export class Authorization {
  /**
   * Bearer文字列の生成
   * @param apiToken - APIのトークン
   * @return Bearer文字列
   */
  static MakeBearer(apiToken: string): string {
    return `Bearer ${apiToken}`;
  }

  /**
   * 通常認証文字列の生成
   * @param key - 通常認証のキー
   * @return 通常認証の文字列
   */
  static MakeBasic(key: string): string {
    return `Basic ${key}`;
  }
}

/**
 * ファイル拡張子
 */
export class FileNameExtension {
  static get JPEG(): string {
    return "jpeg";
  }
}
