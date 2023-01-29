/**
 * LINE Messaging APIのWebhook URLにPOSTされたリクエストに対する処理最初に実行される
 * @param {object} e - ポストデータ等Webhookの情報
 */
function doPost(e) {

  // WebHookで取得したJSONデータをオブジェクト化し、取得
  const eventData = JSON.parse(e.postData.contents).events[0];
  // 受信したJSONをログに出力 このスクリプトはGCPと連携しているのでログエクスプローラーにも出力される
  console.info("doPost request contents = " + e.postData.contents);

  // Nyanatorがユーザーに対して返信する
  const nyanator = new Nyanator();
  nyanator.reply(eventData);

};
