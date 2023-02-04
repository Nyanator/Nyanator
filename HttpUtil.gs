// Compiled using undefined undefined (TypeScript 4.9.5)
"use strict";
/**
* httpのcontentTypeに指定する定義
* フレームワークによっては定義されていることもあるようだが、GASにはないので自作
*/
class MediaType {
    static get APPLICATION_JSON() { return 'application/json'; }
    static get APPLICATION_OCTET_STREAM() { return 'application/octet-stream'; }
    static get IMAGE_JPEG() { return 'image/jpeg'; }
}
/**
* httpのmethodに指定する定義
* フレームワークによっては定義されていることもあるようだが、GASにはないので自作
*/
class HttpMethod {
    static get POST() { return 'post'; }
    static get GET() { return 'get'; }
    static get PUT() { return 'put'; }
    static get PATCH() { return 'patch'; }
    static get DELETE() { return 'delete'; }
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
    static MakeBearer(apiToken) { return `Bearer ${apiToken}`; }
    /**
    * 通常認証文字列の生成
    * @param {string} key - 通常認証のキー
    * @return {string} 通常認証の文字列
    */
    static MakeBasic(key) { return `Basic ${key}`; }
}
/**
* ファイル拡張子
*/
class FileNameExtension {
    static get JPEG() { return 'jpeg'; }
}
