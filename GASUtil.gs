/**
* 汎用処理
*/
class GASUtil {
  /**
  * コンソールにエラーを出力
  * @param {exception} e - 例外
  */
  static putConsoleError(e) {
    console.error("Exception message:" + e.message + "\nfileName:" + e.fileName + "\nlineNumber:" + e.lineNumber + "\nstack:" + e.stack);
  };

  /**
  * APIレスポンスの解析
  * @param {ApiResponse} response - APIの応答
  * @return {string} APIの応答コンテンツ
  */
  static parseResponse(response, apiName) {
    const code = response.getResponseCode();
    console.info("API " + apiName + " response code " + code);
    return response.getContentText();
  };
}