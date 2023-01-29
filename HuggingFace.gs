/**
* Hugging Face APIをGASから呼び出すクラス
*/
class HuggingFace {

  /**
  * コンストラクタ
  * @param {string} apiUrl - Hugging Face APIのURL
  */
  constructor(apiUrl) {
    const _apiUrl = apiUrl;

    Object.defineProperties(this, {
      apiUrl: {
        get: function () {
          return _apiUrl;
        }
      },
    });
  };

  /**
  * HuggingFace APIにPOSTでJSONデータを送る
  * @param {string} data - POSTしたいdata
  * @return {ApiResponse} APIの応答
  */
  postJsonData(data) {
    //APIリクエスト時にセットするペイロード値を設定
    const payload = {
      'data': [
        data
      ]
    };

    //HTTPSのPOST時のオプションパラメータを設定
    const options = {
      'payload': JSON.stringify(payload),
      'myamethod': 'POST',
      'contentType': 'application/json'
    };

    console.info("apiUrl " + this.apiUrl);
    // Hugging Face APIへリクエスト
    return UrlFetchApp.fetch(this.apiUrl, options);
  };
};
