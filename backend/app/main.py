# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, trips, expenses
from app.core import config # ← Firebase設定

# 1. app の作成
app = FastAPI(title="Trip Shiori API")



# 3. Router の登録
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Trip Shiori API"}