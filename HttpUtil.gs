// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
var exports = exports || {};
var module = module || { exports: exports };
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileNameExtension = exports.Authorization = exports.HttpMethod = exports.MediaType = void 0;
/**
 * httpのcontentTypeに指定する定義
 * フレームワークによっては定義されていることもあるようだが、GASにはないので自作
 */
class MediaType {
    static get APPLICATION_JSON() {
        return "application/json";
    }
    static get APPLICATION_OCTET_STREAM() {
        return "application/octet-stream";
    }
    static get IMAGE_JPEG() {
        return "image/jpeg";
    }
}
exports.MediaType = MediaType;
/**
 * httpのmethodに指定する定義
 * フレームワークによっては定義されていることもあるようだが、GASにはないので自作
 */
class HttpMethod {
    static get POST() {
        return "post";
    }
    static get GET() {
        return "get";
    }
    static get PUT() {
        return "put";
    }
    static get PATCH() {
        return "patch";
    }
    static get DELETE() {
        return "delete";
    }
}
exports.HttpMethod = HttpMethod;
/**
 * httpの認証に指定する定義
 * フレームワークによっては定義されていることもあるようだが、GASにはないので自作
 */
class Authorization {
    /**
     * Bearer文字列の生成
     * @param apiToken - APIのトークン
     * @return Bearer文字列
     */
    static MakeBearer(apiToken) {
        return `Bearer ${apiToken}`;
    }
    /**
     * 通常認証文字列の生成
     * @param key - 通常認証のキー
     * @return 通常認証の文字列
     */
    static MakeBasic(key) {
        return `Basic ${key}`;
    }
}
exports.Authorization = Authorization;
/**
 * ファイル拡張子
 */
class FileNameExtension {
    static get JPEG() {
        return "jpeg";
    }
}
exports.FileNameExtension = FileNameExtension;
