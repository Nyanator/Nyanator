// Compiled using nyanator 1.0.0 (TypeScript 4.9.5)
"use strict";
/**
 * Dropbox APIをGASから呼び出すクラス
 */
class Dropbox {
    /**
     * コンストラクタ
     * @param refreshToken - リフレッシュトークン
     * @param appKey       - アプリケーションkey
     * @param clientSecret - クライントシークレットkey
     */
    constructor(refreshToken, appKey, clientSecret) {
        // TypeScriptではprivateフィールドが書ける
        // これはGASがES2022で動作していないから
        this.CONTENT_URL = "https://content.dropboxapi.com/2/";
        this.API_URL = "https://api.dropboxapi.com/2/";
        this.OAUTH_URL = "https://api.dropbox.com/oauth2/token";
        this.apiToken = "";
        //リフレッシュトークンからアクセストークンを取得(dropboxはトークンの連続使用に制限がある)
        try {
            const response = this.initAccessToken(refreshToken, appKey, clientSecret);
            const json = GASUtil.parseResponse(response, "refreshToken");
            const data = JSON.parse(json);
            this.apiToken = data.access_token;
        }
        catch (e) {
            if (e instanceof Error) {
                GASUtil.putConsoleError(e);
            }
            else {
                console.error("unexcepted error");
            }
        }
    }
    /**
     * ファイルダウンロード
     * @param path - ダウンロードしたいファイルのパス
     * @return APIの応答
     */
    download(path) {
        const param = {
            path: path,
        };
        return this.postRequest("files/download", param, null, this.CONTENT_URL);
    }
    /**
     * ファイルアップロード
     * @param path - アップロードしたいファイルのパス
     * @param data - アップロードしたいファイルのBlob
     * @return APIの応答
     */
    upload(path, data) {
        const param = {
            path: path,
            mode: "overwrite",
        };
        return this.postRequest("files/upload", param, data, this.CONTENT_URL);
    }
    /**
     * ファイルの共有設定を変更
     * @param path - アップロードしたいファイルのパス
     * @return APIの応答
     */
    create_shared_link_settings(path) {
        const param = {
            path: path,
        };
        // Dropbox APIへJSONリクエスト
        return this.postJsonRequest("sharing/create_shared_link_with_settings", param, this.API_URL);
    }
    /**
     * 共有設定されたファイルのリンクを取得
     * @param path - アップロードしたいファイルのパス
     * @return APIの応答
     */
    list_shared_links(path) {
        const param = {
            path: path,
        };
        // Dropbox APIへJSONリクエスト
        return this.postJsonRequest("sharing/list_shared_links", param, this.API_URL);
    }
    /**
     * ポストリクエストを投げる
     * @param path  - Urlパス
     * @param param - パラメーター
     * @param data  - ポストしたいデータ
     * @param url   - url
     * @return APIの応答
     */
    postRequest(path, param, data, url) {
        const uri = url + path;
        const options = {
            method: HttpMethod.POST,
            headers: {
                Authorization: Authorization.MakeBearer(this.apiToken),
                "Dropbox-API-Arg": JSON.stringify(param),
            },
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
     * @param path  - Urlパス
     * @param param - パラメーター
     * @param url   - url
     * @return APIの応答
     */
    postJsonRequest(path, param, url) {
        const uri = url + path;
        const options = {
            payload: JSON.stringify(param),
            method: HttpMethod.POST,
            headers: {
                Authorization: Authorization.MakeBearer(this.apiToken),
            },
            contentType: MediaType.APPLICATION_JSON,
        };
        //Dropbox APIへリクエスト
        console.info(`apiUrl ${uri}`);
        return UrlFetchApp.fetch(uri, options);
    }
    /**
     * Dropboxのアクセストークンを再取得(Dropboxのアクセストークンは4時間しか連続使用できない)
     * @param refreshToken - リフレッシュトークン
     * @param appKey - アプリケーションkey
     * @param clientSecret - クライントシークレットkey
     * @return APIの応答
     */
    initAccessToken(refreshToken, appKey, clientSecret) {
        //リフレッシュトークンと期間の短いアクセストークンを取得
        //Base64へエンコード
        const encoded = Utilities.base64Encode(`${appKey}:${clientSecret}`);
        const param = {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        };
        const options = {
            payload: param,
            method: HttpMethod.POST,
            headers: {
                Authorization: Authorization.MakeBasic(encoded),
            },
        };
        // Dropbox APIへリクエスト
        return UrlFetchApp.fetch(this.OAUTH_URL, options);
    }
}
