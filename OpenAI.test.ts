import { OpenAI } from "./OpenAI";
import { HttpMethod } from "./HttpUtil";
import { MediaType } from "./HttpUtil";
import "gas-mock-globals"; // es-modules
require("gas-mock-globals"); // common-js

/**
 * OpenAI クラスの単体テスト
 */
describe("OpenAI class", () => {
  const apiUrl = "API URLは何でも良い";
  const userId = "userid";
  const data = "test data";
  let openAI: OpenAI;

  beforeEach(() => {
    openAI = new OpenAI(apiUrl);

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
    const response = openAI.postJsonData(userId, data);

    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(apiUrl, {
      payload: JSON.stringify({
        user_id: userId,
        content: encodeURIComponent(data),
      }),
      method: HttpMethod.POST,
      contentType: MediaType.APPLICATION_JSON,
    });
    expect(response).toEqual({});
  });
});
