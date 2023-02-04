// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
"use strict";
/**
* LINE Messaging APIをGASから呼び出すクラス
*/
class LINE {
    /**
    * コンストラクタ
    * @param {string} apiToken   - APIトークン
    * @param {string} replyToken - 返信用トークン
    */
    constructor(apiToken, replyToken) {
        // TypeScriptではprivateフィールドが書ける
        // これはGASがES2022で動作していないから
        this.apiToken = '';
        this.replyToken = '';
        this.REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
        this.apiToken = apiToken;
        this.replyToken = replyToken;
        Object.freeze(this);
    }
    /**
    * LINEに文字列メッセージを送信
    * @param {string} message - LINEに送信したい文字列
    * @return {HTTPResponse} APIの応答
    */
    postTextMessage(message) {
        //APIリクエスト時にセットするペイロード値を設定
        const payload = {
            replyToken: this.replyToken,
            messages: [{
                    type: 'text',
                    text: message,
                }]
        };
        // LINEにJSONデータをPOST
        return this.postJsonRequest(payload);
    }
    /**
    * LINEに画像メッセージを送信
    * @param {string} imageUrl - LINEに送信したい画像
    * @return {HTTPResponse} APIの応答
    */
    postImageMesssage(imageUrl) {
        //APIリクエスト時にセットするペイロード値を設定
        const payload = {
            replyToken: this.replyToken,
            messages: [{
                    type: 'image',
                    originalContentUrl: imageUrl,
                    previewImageUrl: imageUrl
                }]
        };
        // LINEにJSONデータをPOST
        return this.postJsonRequest(payload);
    }
    /**
    * LINEにJSONリクエストを送信
    * @param  {Payload} param - パラメーター
    * @return {HTTPResponse} APIの応答
    */
    postJsonRequest(param) {
        if (!this.replyToken) {
            return;
        }
        //HTTPのPOST時のオプションパラメータを設定
        const options = {
            payload: JSON.stringify(param),
            method: HttpMethod.POST,
            headers: { Authorization: Authorization.MakeBearer(this.apiToken) },
            contentType: MediaType.APPLICATION_JSON
        };
        //LINE Messaging APIにリクエスト
        return UrlFetchApp.fetch(this.REPLY_URL, options);
    }
}
