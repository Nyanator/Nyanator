/**
 * LINE Messaging APIのWebhook URLにPOSTされたリクエストに対する処理最初に実行される
 * @param {object} e - ポストデータ等Webhookの情報
 */
function doPost(e) {

  // WebHookで取得したJSONデータをオブジェクト化し、取得
  const eventData = JSON.parse(e.postData.contents).events[0];
  // 受信したJSONをログに出力 このスクリプトはGCPと連携しているのでログエクスプローラーにも出力される
  console.info("doPost request contents = " + e.postData.contents);

  //LINE Messaging APIのアクセストークンをスクリプトプロパティから取得 
  const line = new LINE(
    PropertiesService.getScriptProperties().getProperty("linetoken"),
    eventData.replyToken
  );

  const nyanator = new Nyanator();
  // Nyanatorが利用する各種APIはすべてクラウド上であるため、応答が正常に受け取れない場合がある。
  // API側でリクエストを大量に溜め込むと、再起動まで復帰が困難になることが考えられる。
  // そのため、排他制御を掛けることで必要以上にリクエストを溜め込まないようにする。
  const lock = LockService.getScriptLock();
  try {
    if (!nyanator.tryLock(lock)) {
      line.postTextMessage(nyanator.errorDescription);
      return;
    }
    // ユーザーからのメッセージを検査
    const userMessage = eventData.message.text;
    const userId = eventData.source.userId;
    const replyMessge = nyanator.checkUserMessage(userId, userMessage);
    if (replyMessge) {
      // Nyanatorからの応答がある -> 返信して終了
      line.postTextMessage(replyMessge);
      return;
    }

    // Nyanatorのモードに応じて処理を切り替える
    switch (nyanator.mode) {
      case NyanatroMode.SUMMARIZE.description:        //文章要約
        //Hugging Face 要約APIのURLをスクリプトプロパティから取得
        const summarizeSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("summarizeurl"));

        // Hugging Faceに要約したい文章を送信
        const summarizedText = nyanator.postSummarizeTextToHuggingFaceAPI(userMessage, summarizeSpace);
        if (nyanator.errorDescription) {
          line.postTextMessage(nyanator.errorDescription);
          break;
        }

        line.postTextMessage(summarizedText);
        break;
      case NyanatroMode.TEXT_TO_IMAGE.description:    //テキストからの画像生成
        //Hugging Face 画像生成APIのURLをスクリプトプロパティから取得
        const imageGenerateSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("texttoimageurl"));

        //HuggingFaceに画像生成のプロンプトを送信してBase64符号化された画像を得る
        const base64EncodedData = nyanator.postPromptToHuggingFaceAPI(userMessage, imageGenerateSpace);
        if (nyanator.errorDescription) {
          line.postTextMessage(nyanator.errorDescription);
          break;
        }

        //Dropboxのアクセストークンは4時間で期限切れを起こすのでリフレッシュトークンから再取得
        const dropbox = new Dropbox(
          PropertiesService.getScriptProperties().getProperty("dropboxrefreshtoken"),
          PropertiesService.getScriptProperties().getProperty("dropboxappkey"),
          PropertiesService.getScriptProperties().getProperty("dropboxclientsecret")
        );
        //Base64符号化された画像をDropboxに送信、画像の公開URLを取得
        const generatedFileUrl = nyanator.putBase64JpegFileToDropBox(userMessage, base64EncodedData, dropbox);
        if (nyanator.errorDescription) {
          line.postTextMessage(nyanator.errorDescription);
          break;
        }

        line.postImageMesssage(generatedFileUrl);
        break;
      case NyanatroMode.JP_TRANSLATION.description:       //和訳
        //Hugging Face 和訳 APIのURLをスクリプトプロパティから取得
        const jpTranslationSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("jptranslationurl"));

        // Hugging Faceに和訳したい文章を送信
        const jpTranslatedText = nyanator.postJpTranslationTextToHuggingFaceAPI(userMessage, jpTranslationSpace);
        if (nyanator.errorDescription) {
          line.postTextMessage(nyanator.errorDescription);
          break;
        }

        line.postTextMessage(jpTranslatedText);
        break;
      case NyanatroMode.EN_TRANSLATION.description:       //英訳
        //Hugging Face 英訳 APIのURLをスクリプトプロパティから取得
        const enTranslationSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("entranslationurl"));

        // Hugging Faceに英訳したい文章を送信
        const enTranslatedText = nyanator.postEnTranslationTextToHuggingFaceAPI(userMessage, enTranslationSpace);
        if (nyanator.errorDescription) {
          line.postTextMessage(nyanator.errorDescription);
          break;
        }

        line.postTextMessage(enTranslatedText);
        break;
      case NyanatroMode.CHATBOT.description:              //会話
        //Hugging Face CHATBOT APIのURLをスクリプトプロパティから取得
        const chatbotSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("chatboturl"));

        // Hugging Faceに会話したい文章を送信
        const replyTalkText = nyanator.postTalkTextToHuggingFaceAPI(userMessage, chatbotSpace);
        if (nyanator.errorDescription) {
          line.postTextMessage(nyanator.errorDescription);
          break;
        }

        line.postTextMessage(replyTalkText);
        break;
      default:
        break;
    }

  } catch (e) {
    GASUtil.putConsoleError(e);
    throw e;
  } finally {
    lock.releaseLock();
  }
};