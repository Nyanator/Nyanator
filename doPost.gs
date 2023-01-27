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

  // ユーザーからのメッセージを検査
  const userMessage = eventData.message.text;
  const nyanator = new Nyanator();
  const replyMessge = nyanator.checkUserMessage(userMessage);
  if (replyMessge) {
    // Nyanatorからの応答がある -> 返信して終了
    line.postTextMessage(replyMessge);
    return;
  }

  switch (nyanator.nyanatorMode) {
    case NyanatroMode.SUMMARIZE.description:
      //文章要約
      //Hugging Face 画像生成APIのURLをスクリプトプロパティから取得
      const summarizeSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("summarizeurl"));
      const resultText = nyanator.postSummarizeTextToHuggingFaceAPI(userMessage, summarizeSpace);

      line.postTextMessage(resultText);
      break;
    case NyanatroMode.TEXT_TO_IMAGE.description:
      //画像生成
      //Hugging Face 画像生成APIのURLをスクリプトプロパティから取得
      const imateGenerateSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("texttoimageurl"));

      //HuggingFaceに画像生成のプロンプトを送信してBase64符号化された画像を得る
      const base64EncodedData = nyanator.postPromptToHuggingFaceAPI(userMessage, imateGenerateSpace);

      //Dropboxのアクセストークンは4時間で期限切れを起こすのでリフレッシュトークンから再取得
      const dropbox = new Dropbox(
        PropertiesService.getScriptProperties().getProperty("dropboxrefreshtoken"),
        PropertiesService.getScriptProperties().getProperty("dropboxappkey"),
        PropertiesService.getScriptProperties().getProperty("dropboxclientsecret")
      );
      //Base64符号化された画像をDropboxに送信、画像の公開URLを取得
      const generatedFileUrl = nyanator.putBase64JpegFileToDropBox(userMessage, base64EncodedData, dropbox);

      line.postImageMesssage(generatedFileUrl);
      break;
    default:
      break;
  }
};