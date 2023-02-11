import { doPost } from "./doPost";
import { GASUtil } from "./GASUtil";
import { Nyanator } from "./Nyanator";
import { LINE_PostData } from "./NyanatorTypes";

/**
 * Nyanator各機能の簡易テスト
 */
export function doPost_Test_All() {
  doPost_Test_Transition();
  doPost_Test_Summarize();
  doPost_Test_TextToImage();
  doPost_Test_JpTranslation();
  doPost_Test_EnTranslation();
  doPost_Test_Chatbot();
}

/**
 * Nyanatorモード遷移のテスト
 */
export function doPost_Test_Transition() {
  Object.keys(Nyanator.Mode).forEach((key: string) =>
    doPost_Test_StartXXXX(Nyanator.Mode[key].mode, "testuser")
  );
}

/**
 * Nyanatorモード遷移のテスト
 * @param modeDescription - モード
 * @param testUser - テスト用のユーザー
 * @return テストの成否
 */
export function doPost_Test_StartXXXX(
  modeDescription: string,
  testUser: string
): boolean {
  //GASは状態を保持できないので、スクリプトプロパティにユーザーごとのモードを保存する
  const propertyKey = Nyanator.modePropertyKey(testUser);
  //実行前にモードを初期化する
  PropertiesService.getScriptProperties().setProperty(propertyKey, "");
  const postData: LINE_PostData = {
    postData: {
      contents: JSON.stringify({
        events: [
          {
            replyToken: "",
            message: { text: modeDescription },
            source: { userId: testUser },
          },
        ],
      }),
    },
  };
  doPost(postData);

  //完了後にモードをスクリプトプロパティから取得して想定した値と同じならテスト成功
  const propertyValue =
    PropertiesService.getScriptProperties().getProperty(propertyKey);
  if (propertyValue != modeDescription) {
    GASUtil.putConsoleError(new Error("テストロジックに失敗。"));
    return false;
  }
  console.info("テストロジックに成功。" + modeDescription);
  return true;
}

/**
 * Nyanator要約のテスト
 */
export function doPost_Test_Summarize() {
  const testUser = "testuser";
  if (doPost_Test_StartXXXX(Nyanator.Mode.SUMMARIZE.mode, testUser)) {
    doPost({
      postData: {
        contents: JSON.stringify({
          events: [
            {
              replyToken: "",
              message: {
                text: "桃太郎（ももたろう）は、日本のおとぎ話の一つ。桃の実から生まれた男子「桃太郎」が、お爺さんお婆さんから黍団子（きびだんご）をもらって、イヌ、サル、キジを従え、鬼ヶ島まで鬼を退治しに行く物語。",
              },
              source: { userId: testUser },
            },
          ],
        }),
      },
    });
  }
}

/**
 * Nyanator画像生成のテスト
 */
export function doPost_Test_TextToImage() {
  const testUser = "testuser";
  if (doPost_Test_StartXXXX(Nyanator.Mode.TEXT_TO_IMAGE.mode, testUser)) {
    doPost({
      postData: {
        contents: JSON.stringify({
          events: [
            {
              replyToken: "",
              message: { text: "nsfw" },
              source: { userId: testUser },
            },
          ],
        }),
      },
    });
  }
}

/**
 * Nyanator和訳のテスト
 */
export function doPost_Test_JpTranslation() {
  const testUser = "testuser";
  if (doPost_Test_StartXXXX(Nyanator.Mode.JP_TRANSLATION.mode, testUser)) {
    doPost({
      postData: {
        contents: JSON.stringify({
          events: [
            {
              replyToken: "",
              message: { text: "a cat girl" },
              source: { userId: testUser },
            },
          ],
        }),
      },
    });
  }
}

/**
 * Nyanator英訳のテスト
 */
export function doPost_Test_EnTranslation() {
  const testUser = "testuser";
  if (doPost_Test_StartXXXX(Nyanator.Mode.EN_TRANSLATION.mode, testUser)) {
    doPost({
      postData: {
        contents: JSON.stringify({
          events: [
            {
              replyToken: "",
              message: { text: "猫の女の子" },
              source: { userId: testUser },
            },
          ],
        }),
      },
    });
  }
}

/**
 * Nyanatorチャットボットのテスト
 */
export function doPost_Test_Chatbot() {
  const testUser = "testuser";
  if (doPost_Test_StartXXXX(Nyanator.Mode.CHATBOT.mode, testUser)) {
    doPost({
      postData: {
        contents: JSON.stringify({
          events: [
            {
              replyToken: "",
              message: { text: "こんにちは。" },
              source: { userId: testUser },
            },
          ],
        }),
      },
    });
  }
}
