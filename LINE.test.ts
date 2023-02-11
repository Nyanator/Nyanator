import { LINE } from "./LINE";
import { Authorization } from "./HttpUtil";
import { HttpMethod } from "./HttpUtil";
import { MediaType } from "./HttpUtil";
import "gas-mock-globals"; // es-modules
require("gas-mock-globals"); // common-js

/**
 * LINE クラスの単体テスト
 */
describe("LINE class", () => {
  const apiToken = "APIトークンは何でも良い";
  const replyToken = "返信トークンも何でも良い";
  let line: LINE;

  beforeEach(() => {
    line = new LINE(apiToken, replyToken);

    // UrlFetchAppのモックを作成
    global.UrlFetchApp = {
      fetch: jest.fn().mockImplementation(() => {
        return {};
      }),
      fetchAll: jest.fn(),
      getRequest: jest.fn(),
    };
  });

  test("postTextMessageが正しい引数でpostJsonRequestを呼び出すか？", () => {
    const message = "Hello postTextMessage Test";

    // postJsonRequestのモックを作成
    const postJsonRequest = jest.spyOn(line, "postJsonRequest");
    postJsonRequest.mockImplementation(() => {
      return undefined;
    });

    line.postTextMessage(message);

    // postJsonRequestが正しい引数で呼び出されたか確認
    expect(postJsonRequest).toHaveBeenCalled();
    expect(postJsonRequest).toHaveBeenCalledWith({
      replyToken: replyToken,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    });
  });

  test("postImageMessageが正しい引数でpostJsonRequestを呼び出すか？", () => {
    const imageUrl = "urlは何でも良い";

    // postJsonRequestをのモックを作成
    const postJsonRequest = jest.spyOn(line, "postJsonRequest");
    postJsonRequest.mockImplementation(() => {
      return undefined;
    });

    line.postImageMessage(imageUrl);

    // postJsonRequestが正しい引数で呼び出されたか確認
    expect(postJsonRequest).toHaveBeenCalled();
    expect(postJsonRequest).toHaveBeenCalledWith({
      replyToken: replyToken,
      messages: [
        {
          type: "image",
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl,
        },
      ],
    });
  });

  test("postJsonRequestがUrlFetchApp.fetchを正しい引数で呼び出すか？", () => {
    const payload = {};
    const response = line.postJsonRequest(payload);

    // UrlFetchApp.fetchが正しい引数で呼び出されたか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/reply",
      {
        method: HttpMethod.POST,
        payload: JSON.stringify(payload),
        contentType: MediaType.APPLICATION_JSON,
        headers: { Authorization: Authorization.MakeBearer(apiToken) },
      }
    );
    expect(response).toEqual({});
  });
});
