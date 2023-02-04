// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
"use strict";
/**
 * LINE Messaging APIのWebhook URLにPOSTされたリクエストに対する処理最初に実行される
 * @param {any} e - ポストデータ等Webhookの情報
 */
function doPost(e) {
    // 受信したJSONをログに出力 このスクリプトはGCPと連携しているのでログエクスプローラーにも出力される
    console.info("doPost request contents = " + e.postData.contents);
    // WebHookで取得したJSONデータをオブジェクト化し、取得
    const eventData = JSON.parse(e.postData.contents).events[0];
    const userMessage = eventData.message.text;
    const userId = eventData.source.userId;
    const replyTokne = eventData.replyToken;
    // Nyanatorがユーザーに対して返信する
    const nyanator = new Nyanator();
    nyanator.reply(userMessage, userId, replyTokne);
}
