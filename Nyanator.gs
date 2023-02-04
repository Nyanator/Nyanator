/**
* Nyanator メインクラス
*/
class Nyanator {
  /** 
  * Nyanatorのモードを表すテーブル。モード名。ユーザーに対する返信。HuggingFaceのURLの順番
  */
  static get Mode() {
    return {
    SUMMARIZE:      { mode: '要約', msg: '要約だね。\n短くしたい文章を投げかけてみて。', url: 'summarizeurl' },
    TEXT_TO_IMAGE:  { mode: '画像', msg: 'お絵かきして欲しいんだね。\nお題は？', url: 'texttoimageurl' },
    JP_TRANSLATION: { mode: '和訳', msg: '和訳って面白いよね。\n日本語にしたい文章を投げかけてみて。', url: 'jptranslationurl' },
    EN_TRANSLATION: { mode: '英訳', msg: '英訳大好き。\n英語にしたい文章を投げかけてみて。', url: 'entranslationurl' },
    CHATBOT:        { mode: '会話', msg: '僕が話し相手になってあげる。', url: 'chatboturl' },   
    }
  }

  /**
  * コンストラクタ
  */
  constructor() {
    // GASが現状ES2022で動作しておらず他言語でいうところのprivateフィールドが簡潔な記述で実現できない
    // getterしかないのでイミュータブルにできる
    Object.defineProperties(this, {
      /** 
      * Nyanatorのメッセージ
      */
      Messages:  { get() {
        return {
          BUSY: 'ぐるぐる～ってしてるみたい。\nもう少しだけ待ってね。',
          NSFW_FILTERD: 'ゴメンね。上手く描けないよ。。。\nもしかしてエッチな言葉じゃない？'
        };
      }},
    });
    this.mode = Nyanator.Mode.CHATBOT.mode;
    this.errorDescription = '';
  }

  /**
  * Nyanatorがユーザーに対して返信する
  * @param {object} eventData - WebHookで取得したJSONデータ
  */
  reply(eventData) {

    //LINE Messaging APIのアクセストークンをスクリプトプロパティから取得 
    const line = new LINE(
      PropertiesService.getScriptProperties().getProperty('linetoken'),
      eventData.replyToken
    );

    // Nyanatorが利用する各種APIはすべてクラウド上であるため、応答が正常に受け取れない場合がある。
    // API側でリクエストを大量に溜め込むと、再起動まで復帰が困難になることが考えられる。
    // そのため、排他制御を掛けることで必要以上にリクエストを溜め込まないようにする。
    const lock = LockService.getScriptLock();
    try {
      if (!this.tryLock(lock)) {
        line.postTextMessage(this.errorDescription);
        return;
      }

      // ユーザーからのメッセージを検査
      const userMessage = eventData.message.text;
      const userId = eventData.source.userId;
      const replyMessge = this.checkUserMessage(userId, userMessage);
      if (replyMessge) {
        // Nyanatorからの応答がある -> 返信して終了
        line.postTextMessage(replyMessge);
        return;
      }

      // メッセージテーブルから該当するモードのURLを検索
      let huggingFaceUrl = '';
      const mode = this.mode;
      Object.keys(Nyanator.Mode).forEach(function (key) {
        if (Nyanator.Mode[key].mode == mode) {
          huggingFaceUrl = Nyanator.Mode[key].url;
        }
      });

      //Hugging Face APIのURLをスクリプトプロパティから取得
      const huggingFaceSpace = new HuggingFace(PropertiesService.getScriptProperties().getProperty(huggingFaceUrl));
      huggingFaceSpace
      // Hugging FaceにTextDataを送信
      const resultText = this.postTextDataToHuggingFaceAPI(userMessage, huggingFaceSpace);
      if (this.errorDescription) {
        line.postTextMessage(this.errorDescription);
        return;
      }

      // Text to Image以外
      if (this.mode != Nyanator.Mode.TEXT_TO_IMAGE.mode) {
        line.postTextMessage(resultText);
        return;
      }

      // Text to Image
      //Dropboxのアクセストークンは4時間で期限切れを起こすのでリフレッシュトークンから再取得
      const dropbox = new Dropbox(
        PropertiesService.getScriptProperties().getProperty('dropboxrefreshtoken'),
        PropertiesService.getScriptProperties().getProperty('dropboxappkey'),
        PropertiesService.getScriptProperties().getProperty('dropboxclientsecret')
      );
      //Base64符号化された画像をDropboxに送信、画像の公開URLを取得
      const generatedFileUrl = this.putBase64JpegFileToDropBox(userMessage, resultText, dropbox);
      if (this.errorDescription) {
        line.postTextMessage(this.errorDescription);
        return;
      }

      line.postImageMesssage(generatedFileUrl);

    } catch (e) {
      GASUtil.putConsoleError(e);
      throw e;
    } finally {
      lock.releaseLock();
    }
  }

  /**
  * Nyanatorに対してロックを掛ける
  * @param {lock} lock - ロックオブジェクト
  * @return {booleaan} ロックの成否
  */
  tryLock(lock) {
    if (!lock.tryLock(500)) {
      this.errorDescription = this.Messages.BUSY;
      return false;
    }
    return true;
  }

  /**
  * ユーザーからのメッセージを確認して応答すべきか判断
  * @param {string} userId - ユーザーId
  * @param {string} userMessage - ユーザーの投稿メッセージ
  * @return {string} Nyanatorからの応答メッセージ(応答がないときは空)
  */
  checkUserMessage(userId, userMessage) {

    let resultMessage = '';
    // メッセージテーブルから該当するモードの返信を検索
    Object.keys(Nyanator.Mode).forEach(function (key) {
      if (Nyanator.Mode[key].mode == userMessage) {
        resultMessage = Nyanator.Mode[key].msg;
      }
    });

    if (resultMessage) {
      this.mode = userMessage;
    }

    //GASは状態を保持できないのでスクリプトプロパティに現在のモードを保存
    const propertyKey = Nyanator.modePropertyKey(userId);
    if (resultMessage) {
      PropertiesService.getScriptProperties().setProperty(propertyKey, this.mode);
    } else {
      const propertyValue = PropertiesService.getScriptProperties().getProperty(propertyKey);
      if (propertyValue) {
        this.mode = propertyValue;
      }
    }
    return resultMessage;
  }

  /**
  * 文字列データをHuggingFaceで公開したAPIに送信
  * @param {string} textData - 要約したい文字列
  * @param {HuggingFace} huggingFace - HuggingFace
  * @return {string} 結果文字列
  */
  postTextDataToHuggingFaceAPI(textData, huggingFace) {
    //Hugging Face APIにリクエスト
    let resultText = '';
    try {
      console.info(`postTextDataToHuggingFaceAPI textData ${textData}`);
      const response = huggingFace.postJsonData(textData);
      const code = response.getResponseCode();
      console.info(`postTextDataToHuggingFaceAPI response code ${code}`);
      if (code === 200) {
        const apiResult = response.getContentText();
        resultText = JSON.parse(apiResult).data[0];

        if (this.mode == Nyanator.Mode.TEXT_TO_IMAGE.mode) {
          //data:image/jpeg;base64,データの書式で応答が来るが符号化に適さないため、データ部分だけを抜き出す
          resultText = resultText.replace('data:image/jpeg;base64,', '');
          if (!resultText || resultText == GASUtil.base64BlackedoutImage) {
            this.errorDescription = this.Messages.NSFW_FILTERD;
          }
          console.info(`postTextDataToHuggingFaceAPI resultText ${resultText}`);
          return resultText;
        }
      }

    } catch (e) {
      GASUtil.putConsoleError(e);

    }

    if (!resultText) {
      this.errorDescription = this.Messages.BUSY;
    }

    console.info(`postTextDataToHuggingFaceAPI resultText ${resultText}`);
    return resultText;
  }

  /**
  * Base64符号化された画像をJpeg画像に変換してDropBoxに保存。
  * @param {string} filePrefix - ファイル名の前につける記号
  * @param {string} data - Base64符号化されたJpeg画像データ
  * @param {Dropbox} dropbox - Dropbox
  * @return {string} 書き出したJpgeファイルの公開URL
  */
  putBase64JpegFileToDropBox(filePrefix, data, dropbox) {

    if (!dropbox.apiToken) {
      this.errorDescription = this.Messages.BUSY;
      return '';
    }

    //保存ファイル設定
    const fileName = `${filePrefix}.${FileNameExtension.JPEG}`;
    //Base64をデコード
    const decoded = Utilities.base64Decode(data);
    //ファイルを作成
    const blob = Utilities.newBlob(decoded, MediaType.IMAGE_JPEG, fileName);
    const dropboxFileName = `/Nyanator_GeneratedFiles/${fileName}`;

    //DropBox APIにアップロードリクエスト
    try {
      const response = dropbox.upload(dropboxFileName, blob);
      GASUtil.parseResponse(response, 'uploadFile');
    } catch (e) {
      GASUtil.putConsoleError(e);
      this.errorDescription = this.Messages.BUSY;
      return '';
    }

    //アップロードした画像の共有設定
    try {
      const response = dropbox.create_shared_link_settings(dropboxFileName);
      GASUtil.parseResponse(response, 'create_shared_link_settings');
    } catch (e) {
      GASUtil.putConsoleError(e);
      this.errorDescription = this.Messages.BUSY;
      return '';
    }

    //共有設定したファイルの公開URLを生成
    let generatedFileUrl = '';
    try {
      const response = dropbox.list_shared_links(dropboxFileName);
      const json = GASUtil.parseResponse(response, 'list_shared_links');
      const data = JSON.parse(json);

      // 文字列置換でDropboxの公開URLに変換
      generatedFileUrl = data.links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      console.info(`generatedFileUrl ${generatedFileUrl}`);

    } catch (e) {
      GASUtil.putConsoleError(e);
      this.errorDescription = this.Messages.BUSY;
      return '';
    }

    if (!generatedFileUrl) {
      this.errorDescription = this.Messages.BUSY;
    }

    return generatedFileUrl;

  }

  /**
  * Nyantorのモードスクリプトプロパティのキーを取得
  * @param {string} userId - ユーザーId
  * @return {string} 書き出したJpgeファイルの公開URL
  */
  static modePropertyKey(userId) {
    return `nyanatormode${userId}`
  }
}

