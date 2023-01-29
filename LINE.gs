/**
* LINE APIをGASから呼び出すクラス
*/
class LINE {
  /**
  * コンストラクタ
  * @param {string} apiToken - LINEのAPIトークン
  * @param {string} replyToken - LINEの返信用トークン
  */
  constructor(apiToken, replyToken) {
    const _apiToken = apiToken;
    const _replyToken = replyToken;

    Object.defineProperties(this, {
      apiToken: {
        get: function () {
          return _apiToken;
        }
      },
      replyToken: {
        get: function () {
          return _replyToken;
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
  * LINEにJSONリクエストを送信
  * @param {object} param - パラメーター
  * @return {ApiResponse} APIの応答
  */
  postJsonRequest(param) {
    if (!this.replyToken) {
      return;
    }

    //HTTPSのPOST時のオプションパラメータを設定
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
  * LINEに文字列メッセージを送信
  * @param {string} message - LINEに送信したい文字列
  * @return {ApiResponse} APIの応答
  */
  postTextMessage(message) {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      'replyToken': this.replyToken, //応答用トークン
      'messages': [{
        "type": "text",
        "text": message,
      }]
    };

    // LINEにJSONデータをPOST
    return this.postJsonRequest(payload);
  };

  /**
  * LINEに文字列メッセージを送信
  * @param {string} imageUrl - LINEに送信したい画像
  * @return {ApiResponse} APIの応答
  */
  postImageMesssage(imageUrl) {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      'replyToken': this.replyToken, //応答用トークン
      'messages': [{
        "type": "image",
        "originalContentUrl": imageUrl,
        "previewImageUrl": imageUrl
      }]
    };

    // LINEにJSONデータをPOST
    return this.postJsonRequest(payload);
  };
};