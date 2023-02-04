/**
 * LINE Messaging APIのWebhook URLにPOSTされたリクエストに対する処理最初に実行される
 * @param e - ポストデータ等Webhookの情報
 */
function doPost(e: LINEPostData) {
  // 受信したJSONをログに出力 このスクリプトはGCPと連携しているのでログエクスプローラーにも出力される
  console.info("doPost request contents = " + e.postData.contents);

  // WebHookで取得したJSONデータをオブジェクト化し、取得
  const lineEvents = JSON.parse(e.postData.contents) as LINEEvents;
  const eventIndex = 0;
  const userMessage = lineEvents.events[eventIndex].message.text;
  const userId = lineEvents.events[eventIndex].source.userId;
  const replyTokne = lineEvents.events[eventIndex].replyToken;
  // Nyanatorがユーザーに対して返信する
  const nyanator = new Nyanator();
  nyanator.reply(userMessage, userId, replyTokne);
}
