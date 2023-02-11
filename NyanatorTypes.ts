/**
 * LINE POSTデータ型
 */
export interface LINE_PostData {
  postData: {
    contents: string;
  };
}

/**
 * LINE イベントデータ型
 */
export interface LINE_Events {
  events: [
    {
      replyToken: string;
      message: { text: string };
      source: { userId: string };
    }
  ];
}

/**
 * APIの応答型
 */
export interface HuggingFace_APIResponse {
  data: string[];
}

/**
 * OAuth認証の応答型
 */
export interface Dropbox_APIRefreskTokenResponse {
  access_token: string;
}

/**
 * API 共有設定の応答型
 */
export interface Dropbox_list_shared_links_Ressponse {
  links: [{ url: string }];
}

/**
 * Nyanatorのメッセージ型
 */
export interface MESSAGES {
  BUSY: string;
  NSFW_FILTERD: string;
}

/**
 * Nyanatorのモードを表すテーブル型。モード名。ユーザーに対する返信。HuggingFaceのURLの順番
 */
export interface MODE {
  [key: string]: { mode: string; msg: string; url: string };
}
