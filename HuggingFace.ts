import { HttpMethod } from "./HttpUtil";
import { MediaType } from "./HttpUtil";
/**
 * Hugging Face APIをGASから呼び出すクラス
 */
export class HuggingFace {
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
   * HuggingFace APIにPOSTでJSONデータを送る
   * @param data - POSTしたいdata
   * @return APIの応答
   */
  postJsonData(data: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
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
