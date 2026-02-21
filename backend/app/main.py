# backend/app/main.py
from fastapi import FastAPI
from app.routers import auth, trips, expenses # expensesを追加

# 1. まず app を作る（これより下で app を使う必要があります）
app = FastAPI()

# 2. そのあとで router を登録する
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"]) # これを追加

@app.get("/")
def read_root():
    return {"message": "Welcome to Trip Shiori API"}

