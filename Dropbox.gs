/**
* Dropbox APIをGASから呼び出すクラス
*/
class Dropbox {

  /**
  * コンストラクタ
  * @param {string} refreshToken - リフレッシュトークン
  * @param {string} appKey - アプリケーションkey
  * @param {string} clientSecret - クライントシークレットkey
  */
  constructor(refreshToken, appKey, clientSecret) {

    Object.defineProperties(this, {
      dropboxContentUrl: {
        get: function () {
          return "https://content.dropboxapi.com/2/";
        }
      },
      dropboxApiUrl: {
        get: function () {
          return "https://api.dropboxapi.com/2/";
        }
      },
    });

    //リフレッシュトークンからアクセストークンを取得する(dropboxはトークンの連続使用に制限がある)
    try {
      const response = this.initAccessToken(refreshToken, appKey, clientSecret);
      const json = GASUtil.parseResponse(response, 'refreshToken');
      const data = JSON.parse(json);
      this.apiToken = data.access_token;
    } catch (e) {
      GASUtil.putConsoleError(e);
    }
  };

  /**
  * ポストリクエストを投げる
  * @param {string} rest - REST Uri
  * @param {object} param - パラメーター
  * @param {Blob} data - ポストするデータ
  * @param {string} url - url
  * @return {ApiResponse} APIの応答
  */
  postRequest(rest, param, data, url) {
    const uri = url + rest;
    const options = {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + this.apiToken,
        'Dropbox-API-Arg': JSON.stringify(param)
      }
    };

    if (data) {
      options.contentType = 'application/octet-stream';
      options.payload = data;
    }

    //Dropbox APIへリクエスト
    return UrlFetchApp.fetch(uri, options);
  };

  /**
  * Dropboxのアクセストークンを再取得(Dropboxのアクセストークンは4時間しか連続使用できない)
  * @param {string} refreshToken - リフレッシュトークン
  * @param {string} appKey - アプリケーションkey
  * @param {string} clientSecret - クライントシークレットkey
  * @return {ApiResponse} APIの応答
  */
  initAccessToken(refreshToken, appKey, clientSecret) {
    //リフレッシュトークンと期間の短いアクセストークンを取得する
    const uri = 'https://api.dropbox.com/oauth2/token';
    //Base64へエンコード
    const encoded = Utilities.base64Encode(appKey + ":" + clientSecret);

    const param = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const options = {
      method: 'post',
      headers: {
        Authorization: 'Basic ' + encoded,
      },
    };
    options.payload = param;

    // Dropbox APIへリクエスト
    return UrlFetchApp.fetch(uri, options);
  };

  /**
  * ファイルダウンロード
  * @param {string} paht - ダウンロードするファイルのパス
  * @return {ApiResponse} APIの応答
  */
  download(path) {
    const param = {
      path: path
    };
    return this.postRequest('files/download', param, null, this.dropboxContentUrl);
  };

  /**
  * ファイルアップロード
  * @param {string} path - アップロードするファイルのパス
  * @param {Blob} data - アップロードするファイルのBlob
  * @return {ApiResponse} APIの応答
  */
  upload(path, data) {
    const param = {
      path: path,
      mode: 'overwrite'
    };
    return this.postRequest('files/upload', param, data, this.dropboxContentUrl);
  };

  /**
  * ファイルの共有設定を変更
  * @param {string} path - アップロードするファイルのパス
  * @return {ApiResponse} APIの応答
  */
  create_shared_link_settings(path) {
    const param = {
      path: path,
    };

    const uri = this.dropboxApiUrl + 'sharing/create_shared_link_with_settings';
    const options = {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + this.apiToken,
      }
    };
    options.contentType = 'application/json';
    options.payload = JSON.stringify(param);

    return UrlFetchApp.fetch(uri, options);
  };

  /**
  * 共有設定されたファイルのリンクを取得
  * @param {string} path - アップロードするファイルのパス
  * @return {ApiResponse} APIの応答
  */
  list_shared_links(path) {
    const param = {
      path: path,
    };

    const uri = this.dropboxApiUrl + 'sharing/list_shared_links';
    const options = {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + this.apiToken,
      }
    };
    options.contentType = 'application/json';
    options.payload = JSON.stringify(param);

    // Dropbox APIへリクエスト
    return UrlFetchApp.fetch(uri, options);
  };

};