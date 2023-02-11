// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
var exports = exports || {};
var module = module || { exports: exports };
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuggingFace = void 0;
//import { HttpMethod } from "./HttpUtil";
//import { MediaType } from "./HttpUtil";
/**
 * Hugging Face APIをGASから呼び出すクラス
 */
class HuggingFace {
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
     * HuggingFace APIにPOSTでJSONデータを送る
     * @param data - POSTしたいdata
     * @return APIの応答
     */
    postJsonData(data) {
        //APIリクエスト時にセットするペイロード値を設定
        const payload = {
            data: [data],
        };
        //HTTPのPOST時のオプションパラメータを設定
        const options = {
            payload: JSON.stringify(payload),
            method: HttpMethod.POST,
            contentType: MediaType.APPLICATION_JSON,
        };
        console.info(`apiUrl ${this.apiUrl}`);
        // Hugging Face APIへリクエスト
        return UrlFetchApp.fetch(this.apiUrl, options);
    }
}
exports.HuggingFace = HuggingFace;
