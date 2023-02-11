import { GASUtil } from "./GASUtil";
import { Authorization } from "./HttpUtil";
import { HttpMethod } from "./HttpUtil";
import { MediaType } from "./HttpUtil";

/**
 * LINE Messaging APIをGASから呼び出すクラス
 */
export class LINE {
  // TypeScriptではprivateフィールドが書ける
  private apiToken = "";
  private replyToken = "";
  private readonly REPLY_URL = "https://api.line.me/v2/bot/message/reply";
  /**
   * コンストラクタ
   * @param apiToken   - APIトークン
   * @param replyToken - 返信用トークン
   */
  constructor(apiToken: string, replyToken: string) {
    this.apiToken = apiToken;
    this.replyToken = replyToken;
  }

  /**
   * LINEに文字列メッセージを送信
   * @param message - LINEに送信したい文字列
   * @return APIの応答
   */
  postTextMessage(
    message: string
  ): GoogleAppsScript.URL_Fetch.HTTPResponse | undefined {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      replyToken: this.replyToken, //応答用トークン
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    };

    // LINEにJSONデータをPOST
    return this.postJsonRequest(payload);
  }

  /**
   * LINEに画像メッセージを送信
   * @param imageUrl - LINEに送信したい画像
   * @return APIの応答
   */
  postImageMessage(
    imageUrl: string
  ): GoogleAppsScript.URL_Fetch.HTTPResponse | undefined {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      replyToken: this.replyToken, //応答用トークン
      messages: [
        {
          type: "image",
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl,
        },
      ],
    };

    // LINEにJSONデータをPOST
    return this.postJsonRequest(payload);
  }

  /**
   * LINEにJSONリクエストを送信
   * @param param - パラメーター
   * @return APIの応答
   */
  postJsonRequest(
    param: GoogleAppsScript.URL_Fetch.Payload
  ): GoogleAppsScript.URL_Fetch.HTTPResponse | undefined {

    const isTesst = GASUtil.isTest;
    if (!isTesst && !this.replyToken) {
      return undefined;
    }

    //HTTPのPOST時のオプションパラメータを設定
    const options = {
      payload: JSON.stringify(param),
      method: HttpMethod.POST,
      headers: { Authorization: Authorization.MakeBearer(this.apiToken) },
      contentType: MediaType.APPLICATION_JSON,
    };

    //LINE Messaging APIにリクエスト
    return UrlFetchApp.fetch(this.REPLY_URL, options);
  }
}
