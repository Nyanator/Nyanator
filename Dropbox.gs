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
    // GASが現状ES2022で動作しておらず他言語でいうところのprivateフィールドが簡潔な記述で実現できない
    // getterしかないのでイミュータブルにできる
    Object.defineProperties(this, {
      CONTENT_URL: { get() { return 'https://content.dropboxapi.com/2/'; } },
      API_URL:     { get() { return 'https://api.dropboxapi.com/2/'; } },
      OAUTH_URL:   { get() { return 'https://api.dropbox.com/oauth2/token'; } },
    });

    let apiToken;
    //リフレッシュトークンからアクセストークンを取得(dropboxはトークンの連続使用に制限がある)
    try {
      const response = this.initAccessToken(refreshToken, appKey, clientSecret);
      const json = GASUtil.parseResponse(response, 'refreshToken');
      const data = JSON.parse(json);
      apiToken = data.access_token;
    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    Object.defineProperties(this, {
      apiToken:    { get() { return apiToken; } },
    });
  }

  /**
  * ファイルダウンロード
  * @param {string} paht - ダウンロードしたいファイルのパス
  * @return {HTTPResponse} APIの応答
  */
  download(path) {
    const param = {
      path: path
    };
    return this.postRequest('files/download', param, null, this.CONTENT_URL);
  }

  /**
  * ファイルアップロード
  * @param {string} path - アップロードしたいファイルのパス
  * @param {Blob} data - アップロードしたいファイルのBlob
  * @return {HTTPResponse} APIの応答
  */
  upload(path, data) {
    const param = {
      path: path,
      mode: 'overwrite'
    };
    return this.postRequest('files/upload', param, data, this.CONTENT_URL);
  }

  /**
  * ファイルの共有設定を変更
  * @param {string} path - アップロードしたいファイルのパス
  * @return {HTTPResponse} APIの応答
  */
  create_shared_link_settings(path) {
    const param = {
      path: path,
    };

    // Dropbox APIへJSONリクエスト
    return this.postJsonRequest('sharing/create_shared_link_with_settings', param, this.API_URL);
  }

  /**
  * 共有設定されたファイルのリンクを取得
  * @param {string} path - アップロードしたいファイルのパス
  * @return {HTTPResponse} APIの応答
  */
  list_shared_links(path) {
    const param = {
      path: path,
    };

    // Dropbox APIへJSONリクエスト
    return this.postJsonRequest('sharing/list_shared_links', param, this.API_URL);
  }

  /**
  * ポストリクエストを投げる
  * @param {string} path - Urlパス
  * @param {object} param - パラメーター
  * @param {Blob} data - ポストしたいデータ
  * @param {string} url - url
  * @return {HTTPResponse} APIの応答
  */
  postRequest(path, param, data, url) {
    const uri = url + path;
    const options = {
      method: HttpMethod.POST,
      headers: {
        Authorization: Authorization.MakeBearer(this.apiToken),
        'Dropbox-API-Arg': JSON.stringify(param)
      }
    };

    if (data) {
      options.contentType = MediaType.APPLICATION_OCTET_STREAM;
      options.payload = data;
    }

    //Dropbox APIへリクエスト
    console.info(`apiUrl ${uri}`);
    return UrlFetchApp.fetch(uri, options);
  }

  /**
  * ポストでJSONを投げる
  * @param {string} path - Urlパス
  * @param {object} param - パラメーター
  * @param {string} url - url
  * @return {HTTPResponse} APIの応答
  */
  postJsonRequest(path, param, url) {
    const uri = url + path;
    const options = {
      method: HttpMethod.POST,
      headers: {
        Authorization: Authorization.MakeBearer(this.apiToken)
      }
    };
    options.contentType = MediaType.APPLICATION_JSON;
    options.payload = JSON.stringify(param);

    //Dropbox APIへリクエスト
    console.info(`apiUrl ${uri}`);
    return UrlFetchApp.fetch(uri, options);
  }

  /**
  * Dropboxのアクセストークンを再取得(Dropboxのアクセストークンは4時間しか連続使用できない)
  * @param {string} refreshToken - リフレッシュトークン
  * @param {string} appKey - アプリケーションkey
  * @param {string} clientSecret - クライントシークレットkey
  * @return {HTTPResponse} APIの応答
  */
  initAccessToken(refreshToken, appKey, clientSecret) {
    //リフレッシュトークンと期間の短いアクセストークンを取得
    //Base64へエンコード
    const encoded = Utilities.base64Encode(`${appKey}:${clientSecret}`);

    const param = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const options = {
      method: HttpMethod.POST,
      headers: {
        Authorization: Authorization.MakeBasic(encoded),
      },
    };
    options.payload = param;

    // Dropbox APIへリクエスト
    return UrlFetchApp.fetch(this.OAUTH_URL, options);
  }
}