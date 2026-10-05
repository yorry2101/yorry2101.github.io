document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn');
  const imageUrlInput = document.getElementById('imageUrlInput');
  const loading = document.getElementById('loading');
  const errorMsg = document.getElementById('error');
  const resultContainer = document.getElementById('resultContainer');
  const resultImage = document.getElementById('resultImage');
  const resultBase64 = document.getElementById('resultBase64');
  const copyBtn = document.getElementById('copyBtn');

  const widthInput = document.getElementById('outputWidth');
  const heightInput = document.getElementById('outputHeight');

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  // 幅が変更されたら高さを4:3に合わせる
  widthInput.addEventListener('input', (e) => {
    const w = parseInt(e.target.value) || 0;
    if (w > 0) {
      heightInput.value = Math.round((w * 3) / 4);
    }
  });

  // 高さが変更されたら幅を4:3に合わせる
  heightInput.addEventListener('input', (e) => {
    const h = parseInt(e.target.value) || 0;
    if (h > 0) {
      widthInput.value = Math.round((h * 4) / 3);
    }
  });

  // 共通の処理関数（URLまたはFileを受け取る）
  async function processImage(source) {
    errorMsg.textContent = '';
    resultContainer.style.display = 'none';
    loading.style.display = 'block';

    try {
      // 現在の幅・高さを取得（フォールバック付き）
      const width = parseInt(widthInput.value) || 64;
      const height = parseInt(heightInput.value) || 48;

      const b64 = await captureImageAsBase64(source, width, height);

      resultImage.src = b64;
      resultBase64.value = b64;
      resultContainer.style.display = 'block';
    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Error: ' + err.message + '. 画像の読み込みに失敗しました。';
    } finally {
      loading.style.display = 'none';
    }
  }

  // --- URLからの取得処理 ---
  captureBtn.addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    if (!url) {
      errorMsg.textContent = 'Please enter a valid image URL.';
      return;
    }

    let fetchUrl = url;

    // キャッシュ回避
    //fetchUrl = fetchUrl.includes('?') ? `${fetchUrl}&_t=${Date.now()}` : `${fetchUrl}?_t=${Date.now()}`;

    processImage(fetchUrl);
  });

  // --- ファイルドロップ・クリック処理 ---
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        errorMsg.textContent = 'Please drop a valid image file.';
      }
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  });

  // --- クリップボードからのペースト処理 ---
  document.addEventListener('paste', (e) => {
    // 入力欄でペーストした場合は無視する（URL貼り付けのため）
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processImage(file);
          return;
        }
      }
    }
  });

  // --- Base64のコピー処理 ---
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultBase64.value);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);

      // Fallback
      resultBase64.select();
      document.execCommand('copy');
    }
  });
});