# 一覧取得(GET)

### 旅行一覧を取得する

GET /api/trips

#### レスポンス

[
{
"tripId": "trip_001",
"title": "沖縄旅行",
"startDate": "2026-03-01",
"endDate": "2026-03-03"
}
]

### 予定一覧を取得する

GET /api/schedules?tripId=xxx

#### レスポンス

[
{
"id": "schedule_001",
"tripId": "trip_001",
"startDate": "2026-03-01",
"startTime": "10:00",
"endTime": "12:00",
"place": "美ら海水族館",
"expense":2000,
"categoryId":1,
"purpose": "観光",
"memo": "",
"createdAt": "2026-02-01T10:00:00Z",
"updatedAt": "2026-02-01T10:00:00Z"
}
]

### 出費一覧を取得する

GET /api/expenses?tripId=xxx

#### レスポンス

{
"expenses": [
{
"id": "schedule_001",
"expense": 2000,
"categoryId": 1,
"place": "美ら海水族館"
},
{
"id": "schedule_002",
"expense": 13000,
"categoryId": 2,
"place": "ホテル"
}
],
"total": 15000
}

**出費は予定登録時にのみ設定可能とする**

# 1件取得

### 旅行を1件取得する

GET /api/trips/{tripId}

#### レスポンス

{
"tripId": "trip_001",
"title": "沖縄旅行",
"startDate": "2026-03-01",
"endDate": "2026-03-03"
}

### 予定を1件取得する

GET /api/schedules/{id}

#### レスポンス

{
"id": "schedule_001",
"tripId": "trip_001",
"startDate": "2026-03-01",
"startTime": "10:00",
"endTime": "12:00",
"place": "美ら海水族館",
"expense":2000,
"categoryId":1,
"purpose": "観光",
"memo": "",
"createdAt": "2026-02-01T10:00:00Z",
"updatedAt": "2026-02-01T10:00:00Z"
}

# 新規作成（POST）

### 旅行を登録する

POST /api/trips

#### レスポンス

{
"tripId": "trip_001",
"title": "沖縄旅行",
"startDate": "2026-03-01",
"endDate": "2026-03-03"
}
ステータスコード：201（作成成功）

### 予定を登録する

POST /api/schedules

#### レスポンス

{
"id": "schedule_001",
"tripId": "trip_001",
"startDate": "2026-03-01",
"startTime": "10:00",
"endTime": "12:00",
"place": "美ら海水族館",
"expense":2000,
"categoryId":1,
"purpose": "観光",
"memo": ""
}
ステータスコード：201（作成成功）

# 更新する（PUT）

### 旅行を更新する

PUT /api/trips/{tripId}

#### レスポンス

更新後のオブジェクトを返す
ステータスコード：200（更新成功）

### 予定を1件更新する

PUT /api/schedules/{id}

#### レスポンス

更新後のオブジェクトを返す
ステータスコード：200（更新成功）

# 削除する（DELETE）

### 旅行を削除する

DELETE /api/trips/{tripId}
ステータスコード：204

### 予定を削除する

DELETE /api/schedules/{id}
ステータスコード：204

＊＊＊レスポンスボディはJSON形式＊＊＊
