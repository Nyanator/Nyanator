import { Nyanator } from "./Nyanator";
import { LINE } from "./LINE";
import "gas-mock-globals"; // es-modules
import { HuggingFace } from "./HuggingFace";
import { GASUtil } from "./GASUtil";
import { Dropbox } from "./Dropbox";
import { FileNameExtension } from "./HttpUtil";
import { MediaType } from "./HttpUtil";
import { OpenAI } from "./OpenAI";
require("gas-mock-globals"); // common-js

/**
 * Nyanator クラスの単体テスト
 */
describe("Nyanator class", () => {
  const userMessage = "ユーザーからのメッセージ";
  const userId = "user id";
  const replyToken = "replyToken";

  let lineSpy: jest.SpyInstance;
  let nyanator: Nyanator;
  const flock = {
    tryLock: jest.fn().mockReturnValue(false),
    releaseLock: jest.fn(),
    hasLock: jest.fn(),
    waitLock: jest.fn(),
  };

  const slock = {
    tryLock: jest.fn().mockReturnValue(true),
    releaseLock: jest.fn(),
    hasLock: jest.fn(),
    waitLock: jest.fn(),
  };

  beforeEach(() => {
    lineSpy = jest.spyOn(LINE.prototype, "postTextMessage");
    nyanator = new Nyanator();

    // UrlFetchAppのモックを作成
    global.UrlFetchApp = {
      fetch: jest.fn().mockImplementation(() => {
        return {};
      }),
      fetchAll: jest.fn(),
      getRequest: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("reply内でロックに失敗したとき postTextMessageに特定の文字列を送っているか？", () => {
    global.LockService = {
      getScriptLock: jest.fn().mockReturnValue(flock),
      getUserLock: jest.fn().mockReturnValue(flock),
      getDocumentLock: jest.fn().mockReturnValue(flock),
    };

    nyanator.reply(userMessage, userId, replyToken);
    expect(lineSpy).toHaveBeenCalledWith(Nyanator.Messages.BUSY);
  });

  test("ユーザーからモードの文字列が送られたとき postTextMessageに特定の文字列を送っているか modeの値が正しいか？", () => {
    global.LockService = {
      getScriptLock: jest.fn().mockReturnValue(slock),
      getUserLock: jest.fn().mockReturnValue(slock),
      getDocumentLock: jest.fn().mockReturnValue(slock),
    };

    Object.keys(Nyanator.Mode).forEach(function (key) {
      nyanator.reply(Nyanator.Mode[key].mode, userId, replyToken);
      expect(lineSpy).toHaveBeenCalledWith(Nyanator.Mode[key].msg);
      expect(nyanator.mode).toEqual(Nyanator.Mode[key].mode);
    });
  });

  test("ユーザーからモードの文字列以外が送られたとき ？", () => {
    global.LockService = {
      getScriptLock: jest.fn().mockReturnValue(slock),
      getUserLock: jest.fn().mockReturnValue(slock),
      getDocumentLock: jest.fn().mockReturnValue(slock),
    };

    const userMessage = "ユーザーからのメッセージ";
    const huggingFace = new HuggingFace("url");
    nyanator.postTextDataToHuggingFaceAPI(userMessage, huggingFace);
  });

  test("tryLockの成否が正しいか 失敗の場合のエラーメッセージが設定されているか？", () => {
    expect(nyanator.tryLock(slock)).toEqual(true);
    expect(nyanator.tryLock(flock)).toEqual(false);
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);
  });

  test("checkUserMessageにモード文字列を送ったとき、戻りが想定した値か？モードは正しいか？setPropertyに正しい引数を渡しているか？", () => {
    Object.keys(Nyanator.Mode).forEach(function (key) {
      // PropertiesServiceのモックを作成
      const properties = {
        setProperty: jest.fn(),
      };

      global.PropertiesService = {
        getDocumentProperties: jest.fn(),
        getScriptProperties: jest.fn().mockReturnValue(properties),
        getUserProperties: jest.fn(),
      };

      const resultMessage = nyanator.checkUserMessage(
        userId,
        Nyanator.Mode[key].mode
      );
      // 戻りが正しいか？モードの設定は正しいか？
      expect(resultMessage).toEqual(Nyanator.Mode[key].msg);
      expect(nyanator.mode).toEqual(Nyanator.Mode[key].mode);

      // setPropertyに正しい引数を渡しているか
      expect(properties.setProperty).toHaveBeenCalledWith(
        Nyanator.modePropertyKey(userId),
        nyanator.mode
      );
    });
  });

  test("checkUserMessageにモード文字列以外を送ったとき、戻りが想定した値か？getPropertyの戻りのモードに変わっているか？", () => {
    // PropertiesServiceのモックを作成
    const mode = "モードのテスト";
    const properties = {
      setProperty: jest.fn(),
      getProperty: jest.fn().mockReturnValue(mode),
    };

    global.PropertiesService = {
      getDocumentProperties: jest.fn(),
      getScriptProperties: jest.fn().mockReturnValue(properties),
      getUserProperties: jest.fn(),
    };

    // モードを一度CHATBOTに変更
    nyanator.checkUserMessage(userId, Nyanator.Mode.CHATBOT.mode);

    const resultMessage = nyanator.checkUserMessage(userId, "a cat girl");

    // 戻りが正しいか？
    expect(resultMessage).toEqual("");
    // getPropertyを正しい引数で呼び出しているか？
    expect(properties.getProperty).toHaveBeenCalledWith(
      Nyanator.modePropertyKey(userId)
    );
    // モードが正しいか？
    expect(nyanator.mode).toEqual(mode);
  });

  test("postTextDataToHuggingFaceAPI条件分岐の確認", () => {
    const textData = "test data";
    const resultText = "result text";
    // HuggingFaceのモックを作成
    const huggingFace = new HuggingFace("api url");
    huggingFace.postJsonData = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest
        .fn()
        .mockReturnValue(JSON.stringify({ data: [resultText] })),
    });

    // モードを一度CHATBOTに変更
    nyanator.checkUserMessage(userId, Nyanator.Mode.CHATBOT.mode);

    let returnValue = nyanator.postTextDataToHuggingFaceAPI(
      textData,
      huggingFace
    );

    // postJsonDataに正しい引数を渡しているか
    expect(huggingFace.postJsonData).toHaveBeenCalledWith(textData);
    // httpの応答コードが200のとき、戻り値は想定した値か？
    expect(returnValue).toEqual(resultText);
    // httpの応答コードが200のとき、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual("");

    // HuggingFaceのモックを作成
    huggingFace.postJsonData = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(500),
      getContentText: jest
        .fn()
        .mockReturnValue(JSON.stringify({ data: [resultText] })),
    });

    returnValue = nyanator.postTextDataToHuggingFaceAPI(textData, huggingFace);

    // httpの応答コードが200以外のとき、戻り値は想定した値か？
    expect(returnValue).toEqual("");
    // httpの応答コードが200の以外とき、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);

    // HuggingFaceのモックを作成
    huggingFace.postJsonData = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    // 例外発生時、戻り値は想定した値か？
    expect(returnValue).toEqual("");
    // 例外発生時、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);

    // モードを一度画像生成に変更
    nyanator.checkUserMessage(userId, Nyanator.Mode.TEXT_TO_IMAGE.mode);

    // HuggingFaceのモックを作成
    huggingFace.postJsonData = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest
        .fn()
        .mockReturnValue(
          JSON.stringify({ data: ["data:image/jpeg;base64," + resultText] })
        ),
    });

    returnValue = nyanator.postTextDataToHuggingFaceAPI(textData, huggingFace);

    // httpの応答コードが200のとき、戻り値は想定した値か？
    expect(returnValue).toEqual(resultText);

    huggingFace.postJsonData = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest
        .fn()
        .mockReturnValue(
          JSON.stringify({ data: [GASUtil.base64BlackedoutImage] })
        ),
    });

    returnValue = nyanator.postTextDataToHuggingFaceAPI(textData, huggingFace);

    // NSFWフィルター時、戻り値は想定した値か？
    expect(returnValue).toEqual(GASUtil.base64BlackedoutImage);
    // NSFWフィルター時、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.NSFW_FILTERD);
  });

  test("postTextDataToOpenAIAPI条件分岐の確認", () => {
    const userId = "userId";
    const textData = "test data";
    const resultText = "result text";
    // OpenAIのモックを作成
    const openAI = new OpenAI("api url");
    openAI.postJsonData = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest
        .fn()
        .mockReturnValue(JSON.stringify({ reply: resultText })),
    });

    // モードを一度CHATBOTに変更
    nyanator.checkUserMessage(userId, Nyanator.Mode.CHATBOT.mode);

    let returnValue = nyanator.postTextDataToOpenAIAPI(
      userId,
      textData,
      openAI
    );

    // postJsonDataに正しい引数を渡しているか
    expect(openAI.postJsonData).toHaveBeenCalledWith(userId, textData);
    // httpの応答コードが200のとき、戻り値は想定した値か？
    expect(returnValue).toEqual(resultText);
    // httpの応答コードが200のとき、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual("");

    // OpenAIのモックを作成
    openAI.postJsonData = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(500),
      getContentText: jest
        .fn()
        .mockReturnValue(JSON.stringify({ reply: resultText })),
    });

    returnValue = nyanator.postTextDataToOpenAIAPI(userId, textData, openAI);

    // httpの応答コードが200以外のとき、戻り値は想定した値か？
    expect(returnValue).toEqual("");
    // httpの応答コードが200の以外とき、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);

    // OpenAIのモックを作成
    openAI.postJsonData = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    // 例外発生時、戻り値は想定した値か？
    expect(returnValue).toEqual("");
    // 例外発生時、エラー文字列は想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);
  });

  test("putBase64JpegFileToDropBox条件分岐の確認", () => {
    // Dropbxoのモックを作成
    const dropbox = new Dropbox("refrehtoken", "appkey", "clientsecret");
    // 保存ファイル設定
    const filePrefix = "a cat girl";
    const fileName = `${filePrefix}.${FileNameExtension.JPEG}`;
    // Base64をデコード

    const data = GASUtil.base64BlackedoutImage;
    global.Utilities.base64Decode = jest.fn().mockReturnValue(data);
    global.Utilities.newBlob = jest.fn().mockReturnValue(data);

    const decoded = Utilities.base64Decode(data);
    // ファイルを作成
    const blob = Utilities.newBlob(decoded, MediaType.IMAGE_JPEG, fileName);
    const dropboxFileName = `/Nyanator_GeneratedFiles/${fileName}`;

    dropbox.upload = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    let result = nyanator.putBase64JpegFileToDropBox(filePrefix, data, dropbox);

    // 例外発生時 エラーメッセージは想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);
    expect(result).toEqual("");

    dropbox.upload = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest.fn().mockReturnValue("ok"),
    });

    nyanator.putBase64JpegFileToDropBox(filePrefix, data, dropbox);

    // uploadに正しい引数を渡しているか
    expect(dropbox.upload).toHaveBeenCalledWith(dropboxFileName, blob);

    dropbox.create_shared_link_settings = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    result = nyanator.putBase64JpegFileToDropBox(filePrefix, data, dropbox);

    // 例外発生時 エラーメッセージは想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);
    expect(result).toEqual("");

    dropbox.upload = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest.fn().mockReturnValue("ok"),
    });

    dropbox.create_shared_link_settings = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest.fn().mockReturnValue("ok"),
    });

    result = nyanator.putBase64JpegFileToDropBox(filePrefix, data, dropbox);

    // create_shared_link_settingsに正しい引数を渡しているか
    expect(dropbox.create_shared_link_settings).toHaveBeenCalledWith(
      dropboxFileName
    );

    dropbox.list_shared_links = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    result = nyanator.putBase64JpegFileToDropBox(filePrefix, data, dropbox);

    // 例外発生時 エラーメッセージは想定した値か？
    expect(nyanator.errorDescription).toEqual(Nyanator.Messages.BUSY);
    expect(result).toEqual("");

    const originalUrl = "https://www.dropbox.com?dl=0";
    dropbox.list_shared_links = jest.fn().mockReturnValue({
      getResponseCode: jest.fn().mockReturnValue(200),
      getContentText: jest
        .fn()
        .mockReturnValue(JSON.stringify({ links: [{ url: originalUrl }] })),
    });

    result = nyanator.putBase64JpegFileToDropBox(filePrefix, data, dropbox);

    expect(dropbox.list_shared_links).toHaveBeenCalledWith(dropboxFileName);
    expect(result).toEqual(
      originalUrl
        .replace("www.dropbox.com", "dl.dropboxusercontent.com")
        .replace("?dl=0", "")
    );
  });
});
