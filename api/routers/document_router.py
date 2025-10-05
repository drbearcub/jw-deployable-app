from fastapi import APIRouter, File, UploadFile, status, HTTPException, Body, Depends
from fastapi.responses import JSONResponse
from api.models.user import DBUser
from services.auth import AuthService
from database import configs_collection
from bson import ObjectId
from bson.errors import InvalidId
from collections import OrderedDict
from uuid import uuid4  # For unique file URLs

auth_service = AuthService()
router = APIRouter()

# Dummy S3 bucket name for consistent URLs
S3_BUCKET_NAME = 'demo-bucket'  # For fake/demo URLs


@router.post("/add-documents/{config_id}")
async def add_documents(
    config_id: str,
    files: list[UploadFile] = File(...),
    current_user: DBUser = Depends(auth_service.get_current_user)
):
    try:
        config = await configs_collection.find_one({"_id": ObjectId(config_id), "user_id": str(current_user.id)})
        if not config:
            raise HTTPException(status_code=404, detail="Config not found")

        documents = []
        for file in files:
            file_name = file.filename
            if not file_name.endswith(".pdf"):
                return JSONResponse({"error": f"{file_name} is not a pdf file"}, status_code=status.HTTP_400_BAD_REQUEST)

        # === DEMO MODE: Generate fake S3-like URL with UUID ===
        unique_id = uuid4().hex[:8]
        file_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/documents/{unique_id}_{file_name}"
        documents.append(OrderedDict({"name": file_name, "address": file_url}))

        # === REAL UPLOAD DISABLED ===
        # s3_key = f"documents/{file_name}"
        # s3_client.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key)
        # file_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        # documents.append(OrderedDict({"name": file_name, "address": file_url}))

        existing_config = await configs_collection.find_one({"_id": ObjectId(config_id)})
        existing_config["config_file"].setdefault("documents", []).extend(documents)

        result = await configs_collection.update_one(
            {"_id": ObjectId(config_id)},
            {"$set": {"config_file.documents": existing_config["config_file"]["documents"]}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update config with new documents")

        return JSONResponse(content={"message": "Documents added successfully", "document_urls": [doc["address"] for doc in documents]}, status_code=status.HTTP_200_OK)

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/delete-document/{config_id}")
async def delete_document(
    config_id: str,
    document_name: str = Body(..., embed=True),
    current_user: DBUser = Depends(auth_service.get_current_user)
):
    try:
        config = await configs_collection.find_one({"_id": ObjectId(config_id), "user_id": str(current_user.id)})
        if not config:
            raise HTTPException(status_code=404, detail="Config not found")

        documents = config['config_file'].get('documents', [])
        document_to_delete = next((doc for doc in documents if doc['name'] == document_name), None)

        if not document_to_delete:
            raise HTTPException(status_code=404, detail="Document not found in config")

        # === REAL S3 DELETE DISABLED FOR DEMO ===
        # s3_key = document_to_delete['address'].replace(f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/", "")
        # s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key)

        updated_documents = [doc for doc in documents if doc['name'] != document_name]

        result = await configs_collection.update_one(
            {"_id": ObjectId(config_id)},
            {"$set": {"config_file.documents": updated_documents}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update config")

        return JSONResponse(content={"message": "Document deleted successfully"}, status_code=status.HTTP_200_OK)

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
