from fastapi import FastAPI
from firebase_config import db

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello Travel App!"}

@app.post("/test")
def add_test_data():
    doc_ref = db.collection("test_collection").document()
    doc_ref.set({
        "name": "Misaki",
        "message": "Firestore connected!",
    })
    return {"status": "Data added to Firestore!"}
