## schedules「タイムライン（予定）」1件分の設計

### 本資料は、画面・機能検討時に洗い出したデータ項目をまとめたものです。

### 最終的なDB構成は「DB設計」を参照してください。

| フィールド名 | 型       | 説明                   |
| ------------ | -------- | ---------------------- |
| userId       | number   | 予定ID（自動採番）     |
| email        | string   | メールアドレス　　　　 |
| tripId       | number   | 旅行ID                 |
| startDate    | string   | 日付（YYYY-MM-DD）     |
| endDate      | string   | 日付（YYYY-MM-DD）     |
| startTime    | string   | 開始時間（HH:mm）      |
| endTime      | string   | 終了時間（HH:mm）      |
| place        | string   | 場所名                 |
| purpose      | string   | やること・目的         |
| expence      | number   | 出費　　　　　　　　   |
| memo         | string   | メモ                   |
| createdAt    | datetime | 作成日時               |
| updatedAt    | datetime | 更新日時               |
| categoryId   | number   | カテゴリID 　　　　    |
| category     | string   | 科目　　　　　　　     |
| amount       | number   | 合計金額　　　　　　   |
