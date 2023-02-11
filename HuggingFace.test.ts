import { HuggingFace } from "./HuggingFace";
import { HttpMethod } from "./HttpUtil";
import { MediaType } from "./HttpUtil";
import "gas-mock-globals"; // es-modules
require("gas-mock-globals"); // common-js

/**
 * HuggingFace クラスの単体テスト
 */
describe("HuggingFace class", () => {
  const apiUrl = "API URLは何でも良い";
  const data = "test data";
  let huggingFace: HuggingFace;

  beforeEach(() => {
    huggingFace = new HuggingFace(apiUrl);

    // UrlFetchAppのモックを作成
    global.UrlFetchApp = {
      fetch: jest.fn().mockImplementation(() => {
        return {};
      }),
      fetchAll: jest.fn(),
      getRequest: jest.fn(),
    };
  });

  test("postJsonDataがUrlFetchApp.fetchを正しい引数で呼び出すか？", () => {
    const response = huggingFace.postJsonData(data);

    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(apiUrl, {
      payload: JSON.stringify({ data: [data] }),
      method: HttpMethod.POST,
      contentType: MediaType.APPLICATION_JSON,
    });
    expect(response).toEqual({});
  });
});
