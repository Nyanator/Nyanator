/**
 * LINE Messaging APIのWebhook URLにPOSTされたリクエストに対する処理最初に実行される
 * @param {object} e - ポストデータ等Webhookの情報
 */
function doPost(e) {

  // WebHookで取得したJSONデータをオブジェクト化し、取得
  const eventData = JSON.parse(e.postData.contents).events[0];
  // 受信したJSONをログに出力 このスクリプトはGCPと連携しているのでログエクスプローラーにも出力される
  console.info("doPost request contents = " + e.postData.contents);

  //Hugging Face APIのURLをスクリプトプロパティから取得
  const huggingFace = new HuggingFace(PropertiesService.getScriptProperties().getProperty("huggingfaceurl"));
  const nyanator = new Nyanator();
  const userMessage = eventData.message.text.replace("\n", " ");

  //HuggingFaceに画像生成のプロンプトを送信してBase64符号化された画像を得る
  const base64EncodedData = nyanator.postPromptToHuggingFaceAPI(userMessage, huggingFace);

  //Dropboxのアクセストークンは4時間で期限切れを起こすのでリフレッシュトークンから再取得
  const dropbox = new Dropbox(
    PropertiesService.getScriptProperties().getProperty("dropboxrefreshtoken"),
    PropertiesService.getScriptProperties().getProperty("dropboxappkey"),
    PropertiesService.getScriptProperties().getProperty("dropboxclientsecret")
  );
  //Base64符号化された画像をDropboxに送信、画像の公開URLを取得
  const generatedFileUrl = nyanator.putBase64JpegFileToDropBox(userMessage, base64EncodedData, dropbox);

  //LINE Messaging APIのアクセストークンをスクリプトプロパティから取得 
  const line = new LINE(PropertiesService.getScriptProperties().getProperty("linetoken"));
  //生成した画像をのURLをラインに投稿
  line.postImageMesssage(eventData.replyToken, generatedFileUrl);

};