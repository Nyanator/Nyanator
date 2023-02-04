/**
* LINE Messaging APIをGASから呼び出すクラス
*/
class LINE {
  /**
  * コンストラクタ
  * @param {string} apiToken - LINEのAPIトークン
  * @param {string} replyToken - LINEの返信用トークン
  */
  constructor(apiToken, replyToken) {
    // GASが現状ES2022で動作しておらず他言語でいうところのprivateフィールドが簡潔な記述で実現できない
    // getterしかないのでイミュータブルにできる
    Object.defineProperties(this, {
      apiToken:   { get() { return apiToken; } },
      replyToken: { get() { return replyToken; } },
      REPLY_URL:  { get() { return 'https://api.line.me/v2/bot/message/reply'; } },
    });
  }

  /**
  * LINEに文字列メッセージを送信
  * @param {string} message - LINEに送信したい文字列
  * @return {HTTPResponse} APIの応答
  */
  postTextMessage(message) {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      replyToken: this.replyToken, //応答用トークン
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
      replyToken: this.replyToken, //応答用トークン
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
  * @param {object} param - パラメーター
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