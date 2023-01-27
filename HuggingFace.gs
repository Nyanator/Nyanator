/**
* Hugging Face APIをGASから呼び出すクラス
*/
const HuggingFace = (function () {

  /**
  * コンストラクタ
  * @param {string} apiUrl - Hugging Face APIのURL
  */
  const HuggingFace = function (apiUrl) {
    this.apiUrl = apiUrl;
  };

  /**
  * HuggingFace APIにPOSTでJSONデータを送る
  * @param {string} data - POSTするdata
  * @return {ApiResponse} APIの応答
  */
  HuggingFace.prototype.postJsonData = function (data) {
    //APIリクエスト時にセットするペイロード値を設定する
    const payload = {
      'data': [
        data
      ]
    };

    //HTTPSのPOST時のオプションパラメータを設定する
    const options = {
      'payload': JSON.stringify(payload),
      'myamethod': 'POST',
      'contentType': 'application/json'
    };

    // Hugging Face APIへリクエスト
    return UrlFetchApp.fetch(this.apiUrl, options);
  };

  return HuggingFace;
})();
