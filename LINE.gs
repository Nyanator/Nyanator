/**
* LINE APIをGASから呼び出すクラス
*/
class LINE {
  /**
  * コンストラクタ
  * @param {string} apiToken - LINEのAPIトークン
  */
  constructor(apiToken) {
    const _apiToken = apiToken;

    Object.defineProperties(this, {
      apiToken: {
        get: function () {
          return _apiToken;
        }
      },
      apiUrl: {
        get: function () {
          return "https://api.line.me/v2/bot/message/reply";
        }
      },
    });
  };

  /**
  * LINEにリクエストを送信する
  * @param {object} param - パラメーター
  * @return {ApiResponse} APIの応答
  */
  postJsonRequest(param) {
    //HTTPSのPOST時のオプションパラメータを設定する
    const options = {
      'payload': JSON.stringify(param),
      'myamethod': 'POST',
      'headers': { "Authorization": "Bearer " + this.apiToken },
      'contentType': 'application/json'
    };

    //LINE Messaging APIにリクエスト
    return UrlFetchApp.fetch(this.apiUrl, options);
  }

  /**
  * LINEに文字列メッセージを送信する
  * @param {string} replyToken - LINEの応答トークン
  * @param {string} message - LINEに送信する文字列
  * @return {ApiResponse} APIの応答
  */
  postTextMessage(replyToken, message) {
    //APIリクエスト時にセットするペイロード値を設定する
    const payload = {
      'replyToken': replyToken, // 応答用トークン
      'messages': [{
        "type": "text",
        "text": message,
      }]
    };

    // LINEにJSONデータをPOSTする
    return this.postJsonRequest(payload);
  };

  /**
  * LINEに文字列メッセージを送信する
  * @param {string} replyToken - LINEの応答トークン
  * @param {string} imageUrl - LINEに送信する画像
  * @return {ApiResponse} APIの応答
  */
  postImageMesssage(replyToken, imageUrl) {
    //APIリクエスト時にセットするペイロード値を設定する
    const payload = {
      'replyToken': replyToken, // 応答用トークン
      'messages': [{
        "type": "image",
        "originalContentUrl": imageUrl,
        "previewImageUrl": imageUrl
      }]
    };

    // LINEにJSONデータをPOSTする
    return this.postJsonRequest(payload);
  };
};