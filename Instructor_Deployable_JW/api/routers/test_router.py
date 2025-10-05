from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/test-db")
async def test_db_connection():
    try:
        # Attempt to fetch a document from a test collection
        await db.test_collection.find_one()
        return {"message": "Successfully connected to the database"}
    except Exception as e:
        return {"error": f"Failed to connect to the database: {str(e)}"}

@router.post("/test-db")
async def test_db_insert():
    try:
        # Insert a test document
        result = await db["test"].insert_one({"test": "data"})
        return {"message": "Successfully inserted a test document", "id": str(result.inserted_id)}
    except Exception as e:
        return {"error": f"Failed to insert a test document: {str(e)}"}