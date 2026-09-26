# 巨挺 能量糖網站

靜態網站（GitHub Pages）。

## 如何刊登顧客心得（評價輪播）

1. 顧客在網站「分享你的使用心得」送出後，留言會寄到 boy7990088@yahoo.com.tw。
   - **第一次**有人送出時，FormSubmit 會寄一封「啟用確認信」到這個信箱，點信中的按鈕啟用後才會開始收信。
2. 挑選「同意公開＝是」的真實留言，到 GitHub 編輯 `reviews.json`，照下面格式加入：

```json
[
  { "name": "台中陳先生", "product": "紅瑪能量糖", "rating": 5, "text": "顧客原文…", "date": "2026-10" }
]
```

3. 存檔（Commit）後約 1 分鐘，網站輪播就會更新。

> 請只刊登真實顧客的留言，並避免刊登涉及療效（治療、改善機能、壯陽等）的內容，以免違反食品安全衛生管理法第 28 條。

## 檔案
- `index.html`／`style.css`／`app.js`：網站本體
- `logo.webp`、`*.webp`、`line-qr.png`：Logo（已去背）、產品圖、LINE QR Code
- `reviews.json`：審核後的顧客心得
