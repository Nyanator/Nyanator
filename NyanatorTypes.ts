/**
 * LINE POSTデータ型
 */
type LINEPostData = {
  postData: {
    contents: string;
  };
};

/**
 * LINE イベントデータ型
 */
type LINEEvents = {
  events: [
    {
      replyToken: string;
      message: { text: string };
      source: { userId: string };
    }
  ];
};

/**
 * Nyanatorのメッセージ型
 */
type Nyanator_MESSAGES = { BUSY: string; NSFW_FILTERD: string };

/**
 * Nyanatorのモードを表すテーブル型。モード名。ユーザーに対する返信。HuggingFaceのURLの順番
 */
type Nyanator_MODE = {
  [key: string]: { mode: string; msg: string; url: string };
};

/**
 * HuggingFace APIの応答型
 */
type HuggingFaceAPIResponse = {
  data: string[];
};

/**
 * Dropbox API OAuth認証の応答型
 */
type DropboxAPIRefreskTokenResponse = {
  access_token: string;
};

/**
 * Dropbox API 共有設定の応答型
 */
type DropboxAPI_list_shared_links_Ressponse = {
  links: [{ url: string }];
};
