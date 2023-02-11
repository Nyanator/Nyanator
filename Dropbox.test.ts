import { Dropbox } from "./Dropbox";
import { Authorization, MediaType } from "./HttpUtil";
import { HttpMethod } from "./HttpUtil";
import "gas-mock-globals"; // es-modules
require("gas-mock-globals"); // common-js

/**
 * Dropbox クラスの単体テスト
 */
describe("Dropbox class", () => {
  let dropbox: Dropbox;
  beforeEach(() => {
    const refreshToken = "リフレッシュトークンは何でも良い";
    const appKey = "appKeyは何でも良い";
    const clientSecret = "clientSecretは何でも良い";

    dropbox = new Dropbox(refreshToken, appKey, clientSecret);

    // UrlFetchAppのモックを作成
    global.UrlFetchApp = {
      fetch: jest.fn().mockImplementation(() => {
        return {};
      }),
      fetchAll: jest.fn(),
      getRequest: jest.fn(),
    };
  });

  test("downloadが正しい引数でpostResuestを呼び出すか？", () => {
    const spy = jest.spyOn(Dropbox.prototype, "postRequest");
    const path = "path";

    dropbox.download(path);

    expect(spy).toHaveBeenCalledWith(
      "files/download",
      { path },
      null,
      "https://content.dropboxapi.com/2/"
    );
  });

  test("uploadが正しい引数でpostResuestを呼び出すか？", () => {
    const spy = jest.spyOn(Dropbox.prototype, "postRequest");
    const path = "path";
    const data = new BlobMock();

    dropbox.upload(path, data);

    expect(spy).toHaveBeenCalledWith(
      "files/upload",
      { path: "path", mode: "overwrite" },
      data,
      "https://content.dropboxapi.com/2/"
    );
  });

  test("create_shared_link_settingsが正しい引数でpostJsonResuestを呼び出すか？", () => {
    const spy = jest.spyOn(Dropbox.prototype, "postJsonRequest");
    const path = "path";

    dropbox.create_shared_link_settings(path);

    expect(spy).toHaveBeenCalledWith(
      "sharing/create_shared_link_with_settings",
      { path },
      "https://api.dropboxapi.com/2/"
    );
  });

  test("list_shared_linksが正しい引数でpostJsonResuestを呼び出すか？", () => {
    const spy = jest.spyOn(Dropbox.prototype, "postJsonRequest");
    const path = "path";

    dropbox.list_shared_links(path);

    expect(spy).toHaveBeenCalledWith(
      "sharing/list_shared_links",
      { path },
      "https://api.dropboxapi.com/2/"
    );
  });

  test("postRequestがUrlFetchApp.fetchを正しい引数で呼び出すか？", () => {
    const url = "https://content.dropboxapi.com/2/";
    const path = "files/download";
    const uri = url + path;
    const param = {
      path: path,
    };

    const response = dropbox.postRequest(path, param, null, url);
    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(uri, {
      method: HttpMethod.POST,
      headers: {
        Authorization: Authorization.MakeBearer(""),
        "Dropbox-API-Arg": JSON.stringify(param),
      },
    });
    expect(response).toEqual({});
  });

  test("postRequestがUrlFetchApp.fetchを正しい引数で呼び出すか(データあり)？", () => {
    const url = "https://content.dropboxapi.com/2/";
    const path = "files/upload";
    const uri = url + path;
    const data = new BlobMock();
    const param = {
      path: path,
      mode: "overwrite",
    };

    const response = dropbox.postRequest(path, param, data, url);
    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(uri, {
      method: HttpMethod.POST,
      contentType: MediaType.APPLICATION_OCTET_STREAM,
      payload: data,
      headers: {
        Authorization: Authorization.MakeBearer(""),
        "Dropbox-API-Arg": JSON.stringify(param),
      },
    });
    expect(response).toEqual({});
  });

  test("postJsonRequestがUrlFetchApp.fetchを正しい引数で呼び出すか？", () => {
    const url = "https://api.dropboxapi.com/2/";
    const path = "sharing/list_shared_links";
    const uri = url + path;
    const param = {
      path: path,
    };

    const response = dropbox.postJsonRequest(path, param, url);
    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(uri, {
      payload: JSON.stringify(param),
      method: HttpMethod.POST,
      headers: {
        Authorization: Authorization.MakeBearer(""),
      },
      contentType: MediaType.APPLICATION_JSON,
    });
    expect(response).toEqual({});
  });

  test("initAccessTokenがUrlFetchApp.fetchを正しい引数で呼び出すか？", () => {
    const refreshToken = "リフレッシュトークンは何でも良い";
    const appKey = "appKeyは何でも良い";
    const clientSecret = "clientSecretは何でも良い";
    const response = dropbox.initAccessToken(
      refreshToken,
      appKey,
      clientSecret
    );
    const encoded = Utilities.base64Encode(`${appKey}:${clientSecret}`);
    const param = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      "https://api.dropbox.com/oauth2/token",
      {
        payload: param,
        method: HttpMethod.POST,
        headers: {
          Authorization: Authorization.MakeBasic(encoded),
        },
      }
    );
    expect(response).toEqual({});
  });
});

/**
 * Dropbox クラスの単体テスト用 GoogleAppsScript.Base.Blobのモック実装
 */
class BlobMock implements GoogleAppsScript.Base.Blob {
  copyBlob(): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  getAs(contentType: string): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  getBytes(): number[] {
    return [1];
  }
  getContentType(): string {
    return "";
  }
  getDataAsString(): string;
  getDataAsString(charset: string): string;
  getDataAsString(charset?: unknown): string {
    return "";
  }
  getName(): string {
    return "";
  }
  isGoogleType(): boolean {
    return false;
  }
  setBytes(data: number[]): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  setContentType(contentType: string): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  setContentTypeFromExtension(): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  setDataFromString(string: string): GoogleAppsScript.Base.Blob;
  setDataFromString(
    string: string,
    charset: string
  ): GoogleAppsScript.Base.Blob;
  setDataFromString(
    string: unknown,
    charset?: unknown
  ): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  setName(name: string): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
  getAllBlobs(): GoogleAppsScript.Base.Blob[] {
    return [new BlobMock()];
  }
  getBlob(): GoogleAppsScript.Base.Blob {
    return new BlobMock();
  }
}
