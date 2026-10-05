/**
 * 画像URLまたはFileオブジェクトを読み込み、指定サイズのBase64文字列（背景黒）に変換する
 * @param {string|File|Blob} imageSource - 入力画像（URLまたはFile/Blobオブジェクト）
 * @param {number} targetWidth - 出力幅 (デフォルト: 64)
 * @param {number} targetHeight - 出力高さ (デフォルト: 48)
 */
async function captureImageAsBase64(imageSource, targetWidth = 64, targetHeight = 48) {
  const TARGET_WIDTH = targetWidth;
  const TARGET_HEIGHT = targetHeight;

  return new Promise((resolve, reject) => {
    const img = new Image();
    // CORSエラーを回避するために設定（サーバー側が許可している場合）
    img.crossOrigin = "anonymous";

    let objectUrl = null;

    img.onload = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      // 1. キャンバスの作成
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // 2. 背景を黒で塗りつぶす
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // 3. アスペクト比を計算して描画サイズを決定（fit-to-contain）
      const scale = Math.min(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      // 中央配置にするためのオフセット計算
      const offsetX = (TARGET_WIDTH - drawWidth) / 2;
      const offsetY = (TARGET_HEIGHT - drawHeight) / 2;

      // 4. 画像を描画
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // 5. Base64として出力（image/png または image/jpeg）
      const base64 = canvas.toDataURL("image/png");
      resolve(base64);
    };

    img.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error("Failed to load image"));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      // img.crossOrigin を外す (ローカルBlobではエラーになることがあるため)
      img.removeAttribute("crossorigin");
      objectUrl = URL.createObjectURL(imageSource);
      img.src = objectUrl;
    } else {
      reject(new Error("Invalid image source provided"));
    }
  });
}
