/**
* LINE APIをGASから呼び出すクラス
*/
const LINE = (function () {
  const LINE_API_URL = "https://api.line.me/v2/bot/message/reply";

  /**
  * コンストラクタ
  * @param {string} apiToken - LINEのAPIトークン
  */
  const LINE = function (apiToken) {
    this.apiToken = apiToken;
  };

  /**
  * LINEに文字列メッセージを送信する
  * @param {string} replyToken - LINEの応答トークン
  * @param {string} message - LINEに送信する文字列
  * @return {ApiResponse} APIの応答
  */
  LINE.prototype.postTextMessage = function (replyToken, message) {
    //APIリクエスト時にセットするペイロード値を設定する
    const payload = {
      'replyToken': replyToken, // 応答用トークン
      'messages': [{
        "type": "text",
        "text": message,
      }]
    };

    //HTTPSのPOST時のオプションパラメータを設定する
    const options = {
      'payload': JSON.stringify(payload),
      'myamethod': 'POST',
      'headers': { "Authorization": "Bearer " + this.apiToken },
      'contentType': 'application/json'
    };

    //LINE Messaging APIにリクエスト
    return UrlFetchApp.fetch(LINE_API_URL, options);
  };

  /**
  * LINEに文字列メッセージを送信する
  * @param {string} replyToken - LINEの応答トークン
  * @param {string} imageUrl - LINEに送信する画像
  * @return {ApiResponse} APIの応答
  */
  LINE.prototype.postImageMesssage = function (replyToken, imageUrl) {
    //APIリクエスト時にセットするペイロード値を設定する
    const payload = {
      'replyToken': replyToken, // 応答用トークン
      'messages': [{
        "type": "image",
        "originalContentUrl": imageUrl,
        "previewImageUrl": imageUrl
      }]
    };

    //HTTPSのPOST時のオプションパラメータを設定する
    const options = {
      'payload': JSON.stringify(payload),
      'myamethod': 'POST',
      'headers': { "Authorization": "Bearer " + this.apiToken },
      'contentType': 'application/json'
    };

    //LINE Messaging APIにリクエスト
    return UrlFetchApp.fetch(LINE_API_URL, options);
  };

  return LINE;
})();