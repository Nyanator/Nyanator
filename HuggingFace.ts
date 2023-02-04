/**
* Hugging Face APIをGASから呼び出すクラス
*/
class HuggingFace {
  // TypeScriptではprivateフィールドが書ける
  // これはGASがES2022で動作していないから
  private apiUrl = '';

  /**
  * コンストラクタ
  * @param {string} apiUrl - APIのURL
  */
  constructor(apiUrl : string) {
    this.apiUrl   = apiUrl; 
    Object.freeze(this);
  }

  /**
  * HuggingFace APIにPOSTでJSONデータを送る
  * @param  {string} data - POSTしたいdata
  * @return {HTTPResponse} APIの応答
  */
  postJsonData(data : string) {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      data: [data]
    };

    //HTTPSのPOST時のオプションパラメータを設定
    const options = {
      payload: JSON.stringify(payload),
      method: HttpMethod.POST,
      contentType: MediaType.APPLICATION_JSON
    };

    console.info(`apiUrl ${this.apiUrl}`);
    // Hugging Face APIへリクエスト
    return UrlFetchApp.fetch(this.apiUrl, options);
  }
}
