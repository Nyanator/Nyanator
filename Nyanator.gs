/**
* Nyanator メインクラス
*/
class Nyanator {

  /**
  * コンストラクタ
  */
  constructor() {
  };

  /**
  * プロンプト文字列をHuggingFaceで公開したAPIに送信する
  * @param {string} prompt - プロンプト文字列
  * @param {string} huggingFace - HuggingFace
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

        // data:image/jpeg;base64,データの書式で応答が来るが符号化するのに適さないため、データ部分だけを抜き出す
        base64Data = JSON.parse(apiResult).data[0].replace("data:image/jpeg;base64,", "");
      }

    } catch (e) {
      GASUtil.putConsoleError(e);
    }
    return base64Data;
  };

  /**
  * Base64符号化された画像をJpeg画像に変換してDropBoxに保存。
  * @param {string} filePrefix - ファイル名の前につける記号
  * @param {string} data - Base64符号化されたJpeg画像データ
  * @return {string} 書き出したJpgeファイルの公開URL
  */
  putBase64JpegFileToDropBox(filePrefix, data, dropbox) {
    // 保存ファイル設定
    const fileName = filePrefix + '.jpeg';
    // Base64をデコードする
    const decoded = Utilities.base64Decode(data);
    // ファイルを作成する
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    const dropboxFileName = "/Nyanator_GeneratedFiles/" + fileName;

    //DropBox APIにアップロードリクエストする
    try {
      const response = dropbox.upload(dropboxFileName, blob);
      GASUtil.parseResponse(response, 'uploadFile');
    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    // アップロードした画像の共有設定をする
    try {
      const response = dropbox.create_shared_link_settings(dropboxFileName);
      GASUtil.parseResponse(response, 'create_shared_link_settings');
    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    // 共有設定したファイルの公開URLを生成する
    let generatedFileUrl = '';
    try {
      const response = dropbox.list_shared_links(dropboxFileName);
      const json = GASUtil.parseResponse(response, 'refreshToken');
      const data = JSON.parse(json);
      generatedFileUrl = data.links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      console.log("generatedFileUrl " + generatedFileUrl);

    } catch (e) {
      GASUtil.putConsoleError(e);
    }

    return generatedFileUrl;

  };
};