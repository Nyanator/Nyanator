/** 
 * Nyanatorのモードを表すenum
 * @enum {Symbol} 
 */
const NyanatroMode = Object.freeze({
  SUMMARIZE: Symbol('要約'),
  TEXT_TO_IMAGE: Symbol('画像'),
  JP_TRANSLATION: Symbol('和訳'),
  EN_TRANSLATION: Symbol('英訳'),
});

/**
* Nyanator メインクラス
*/
class Nyanator {

  /**
  * コンストラクタ
  */
  constructor() {
    this.mode = NyanatroMode.SUMMARIZE.description;
    this.errorDescription = "";
  };

  /**
  * ユーザーからのメッセージを確認して応答すべきか判断
  * @param {string} userId - ユーザーId
  * @param {string} userMessage - ユーザーの投稿メッセージ
  * @return {string} Nyanatorからの応答メッセージ(応答がないときは空)
  */
  checkUserMessage(userId, userMessage) {
    let resultMessage = '';

    switch (userMessage) {
      case NyanatroMode.SUMMARIZE.description:
        resultMessage = "要約だね。短くしてほしい文章を投げかけてみて。";
        this.mode = NyanatroMode.SUMMARIZE.description;
        break;
      case NyanatroMode.TEXT_TO_IMAGE.description:
        resultMessage = "お絵かきして欲しいんだね。お題は？";
        this.mode = NyanatroMode.TEXT_TO_IMAGE.description;
        break;
      case NyanatroMode.JP_TRANSLATION.description:
        resultMessage = "和訳って面白いよね。日本語にしてほしい文章を投げかけてみて。";
        this.mode = NyanatroMode.JP_TRANSLATION.description;
        break;
      case NyanatroMode.EN_TRANSLATION.description:
        resultMessage = "英訳大好き。英語にしてほしい文章を投げかけてみて。";
        this.mode = NyanatroMode.EN_TRANSLATION.description;
        break;
      default:
        break;
    }

    //GASは状態を保持できないのでスクリプトプロパティに現在のモードを保存
    const propertyKey = "nyanatormode" + userId;
    if (resultMessage) {
      PropertiesService.getScriptProperties().setProperty(propertyKey, this.mode);
    } else {
      const propertyValue = PropertiesService.getScriptProperties().getProperty(propertyKey);
      if (propertyValue) {
        this.mode = propertyValue;
      }
    }
    return resultMessage;
  };

  /**
  * 要約対象の文字列ををHuggingFaceで公開したAPIに送信
  * @param {string} summarizeText - 要約したい文字列
  * @param {HuggingFace} huggingFace - HuggingFace
  * @return {string} 要約結果の文字列
  */
  postSummarizeTextToHuggingFaceAPI(summarizeText, huggingFace) {
    //Hugging Face APIにリクエストし、要約の結果を得る
    let resultText = '';
    try {
      console.info("postSummarizeTextToHuggingFaceAPI summarizeText " + summarizeText);
      const response = huggingFace.postJsonData(summarizeText);
      const code = response.getResponseCode();
      console.info("postSummarizeTextToHuggingFaceAPI response code " + code);
      if (code === 200) {
        const apiResult = response.getContentText();
        resultText = JSON.parse(apiResult).data[0];
      }

    } catch (e) {
      GASUtil.putConsoleError(e);

    }

    if (!resultText) {
      this.errorDescription = "今ぐるぐる～ってしてるみたい。もう少しだけ待ってね。";
    }

    return resultText;
  };

  /**
  * プロンプト文字列をHuggingFaceで公開したAPIに送信
  * @param {string} prompt - プロンプト文字列
  * @param {HuggingFace} huggingFace - HuggingFace
  * @return {string} Base64に符号化された生成画像データ
  */
  postPromptToHuggingFaceAPI(prompt, huggingFace) {
    //Hugging Face APIにリクエストし、画像の生成結果を得る
    let base64Data = '';
    try {
      console.info("postPromptToHuggingFaceAPI prompt " + prompt);
      const response = huggingFace.postJsonData(prompt);
      const code = response.getResponseCode();
      console.info("postPromptToHuggingFaceAPI response code " + code);
      if (code === 200) {
        const apiResult = response.getContentText();

        //data:image/jpeg;base64,データの書式で応答が来るが符号化に適さないため、データ部分だけを抜き出す
        base64Data = JSON.parse(apiResult).data[0].replace("data:image/jpeg;base64,", "");
      }

    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    if (!base64Data || base64Data == GASUtil.base64BlackedoutImage()) {
      this.errorDescription = "ゴメンね。上手く描けないよ。。。もしかしてエッチな言葉じゃない？";
    }

    return base64Data;
  };

  /**
  * Base64符号化された画像をJpeg画像に変換してDropBoxに保存。
  * @param {string} filePrefix - ファイル名の前につける記号
  * @param {string} data - Base64符号化されたJpeg画像データ
  * @param {Dropbox} dropbox - Dropbox
  * @return {string} 書き出したJpgeファイルの公開URL
  */
  putBase64JpegFileToDropBox(filePrefix, data, dropbox) {
    //保存ファイル設定
    const fileName = filePrefix + '.jpeg';
    //Base64をデコード
    const decoded = Utilities.base64Decode(data);
    //ファイルを作成
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    const dropboxFileName = "/Nyanator_GeneratedFiles/" + fileName;

    //DropBox APIにアップロードリクエスト
    try {
      const response = dropbox.upload(dropboxFileName, blob);
      GASUtil.parseResponse(response, 'uploadFile');
    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    //アップロードした画像の共有設定
    try {
      const response = dropbox.create_shared_link_settings(dropboxFileName);
      GASUtil.parseResponse(response, 'create_shared_link_settings');
    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    //共有設定したファイルの公開URLを生成
    let generatedFileUrl = '';
    try {
      const response = dropbox.list_shared_links(dropboxFileName);
      const json = GASUtil.parseResponse(response, 'list_shared_links');
      const data = JSON.parse(json);

      // 文字列置換でDropboxの公開URLに変換
      generatedFileUrl = data.links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      console.log("generatedFileUrl " + generatedFileUrl);

    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    if (!generatedFileUrl) {
      this.errorDescription = "今ぐるぐる～ってしてるみたい。もう少しだけ待ってね。";
    }

    return generatedFileUrl;

  };

  /**
  * 和訳対象の文字列ををHuggingFaceで公開したAPIに送信
  * @param {string} translationText - 和訳したい文字列
  * @param {HuggingFace} huggingFace - HuggingFace
  * @return {string} 和訳結果の文字列
  */
  postJpTranslationTextToHuggingFaceAPI(translationText, huggingFace) {
    //Hugging Face APIにリクエストし、和訳の結果を得る
    let resultText = '';
    try {
      console.info("postJpTranslationTextToHuggingFaceAPI translationText " + translationText);
      const response = huggingFace.postJsonData(translationText);
      const code = response.getResponseCode();
      console.info("postJpTranslationTextToHuggingFaceAPI response code " + code);
      if (code === 200) {
        const apiResult = response.getContentText();
        resultText = JSON.parse(apiResult).data[0];
      }

    } catch (e) {
      GASUtil.putConsoleError(e);

    }

    if (!resultText) {
      this.errorDescription = "今ぐるぐる～ってしてるみたい。もう少しだけ待ってね。";
    }

    return resultText;
  };

  /**
  * 英訳対象の文字列ををHuggingFaceで公開したAPIに送信
  * @param {string} translationText - 英訳したい文字列
  * @param {HuggingFace} huggingFace - HuggingFace
  * @return {string} 英訳結果の文字列
  */
  postEnTranslationTextToHuggingFaceAPI(translationText, huggingFace) {
    //Hugging Face APIにリクエストし、英訳の結果を得る
    let resultText = '';
    try {
      console.info("postEnTranslationTextToHuggingFaceAPI translationText " + translationText);
      const response = huggingFace.postJsonData(translationText);
      const code = response.getResponseCode();
      console.info("postEnTranslationTextToHuggingFaceAPI response code " + code);
      if (code === 200) {
        const apiResult = response.getContentText();
        resultText = JSON.parse(apiResult).data[0];
      }

    } catch (e) {
      GASUtil.putConsoleError(e);

    }

    if (!resultText) {
      this.errorDescription = "今ぐるぐる～ってしてるみたい。もう少しだけ待ってね。";
    }

    return resultText;
  };
};