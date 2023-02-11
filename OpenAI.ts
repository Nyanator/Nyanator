import { HttpMethod } from "./HttpUtil";
import { MediaType } from "./HttpUtil";
/**
 * Herokuで公開したOpenAIをGASから呼び出すクラス
 */
export class OpenAI {
  // TypeScriptではprivateフィールドが書ける
  private apiUrl = "";

  /**
   * コンストラクタ
   * @param apiUrl - APIのURL
   */
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * OpenAIにPOSTでJSONデータを送る
   * @param userId - ユーザーID
   * @param data - POSTしたいdata
   * @return APIの応答
   */
  postJsonData(
    userId: string,
    data: string
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
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
