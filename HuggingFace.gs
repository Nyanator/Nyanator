// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
"use strict";
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
        // これはGASがES2022で動作していないから
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
        //HTTPSのPOST時のオプションパラメータを設定
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
