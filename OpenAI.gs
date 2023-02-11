// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
var exports = exports || {};
var module = module || { exports: exports };
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAI = void 0;
//import { HttpMethod } from "./HttpUtil";
//import { MediaType } from "./HttpUtil";
/**
 * Herokuで公開したOpenAIをGASから呼び出すクラス
 */
class OpenAI {
    /**
     * コンストラクタ
     * @param apiUrl - APIのURL
     */
    constructor(apiUrl) {
        // TypeScriptではprivateフィールドが書ける
        this.apiUrl = "";
        this.apiUrl = apiUrl;
    }
    /**
     * OpenAIにPOSTでJSONデータを送る
     * @param userId - ユーザーID
     * @param data - POSTしたいdata
     * @return APIの応答
     */
    postJsonData(userId, data) {
        //APIリクエスト時にセットするペイロード値を設定
        const payload = {
            user_id: userId,
            content: encodeURIComponent(data),
        };
        //HTTPのPOST時のオプションパラメータを設定
        const options = {
            payload: JSON.stringify(payload),
            method: HttpMethod.POST,
            contentType: MediaType.APPLICATION_JSON,
        };
        console.info(`apiUrl ${this.apiUrl}`);
        // OpenAI APIへリクエスト
        return UrlFetchApp.fetch(this.apiUrl, options);
    }
}
exports.OpenAI = OpenAI;
