/**
* Hugging Face APIをGASから呼び出すクラス
*/
class HuggingFace {

  /**
  * コンストラクタ
  * @param {string} apiUrl - Hugging Face APIのURL
  */
  constructor(apiUrl) {
    // GASが現状ES2022で動作しておらず他言語でいうところのprivateフィールドが簡潔な記述で実現できない
    // getterしかないのでイミュータブルにできる
    Object.defineProperties(this, {
      apiUrl: { get() { return apiUrl; } },
    });
  }

  /**
  * HuggingFace APIにPOSTでJSONデータを送る
  * @param {string} data - POSTしたいdata
  * @return {HTTPResponse} APIの応答
  */
  postJsonData(data) {
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
