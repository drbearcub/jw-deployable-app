from fastapi import APIRouter, File, UploadFile, status, HTTPException, Body, Depends
from fastapi.responses import JSONResponse
from models.user import User
from services.auth import AuthService
from database import configs_collection
from bson import ObjectId
from bson.errors import InvalidId
import boto3
import os
from collections import OrderedDict

auth_service = AuthService()

router = APIRouter()

# Initialize S3 client
s3_client = boto3.client('s3')
S3_BUCKET_NAME = 'david-test-bucket-jw'  # Replace with your actual S3 bucket name


@router.post("/add-documents/{config_id}")
async def add_documents(
    config_id: str,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(auth_service.get_current_user)
):
    try:
        # Check if config exists and is associated with the current user
        config = await configs_collection.find_one({"_id": ObjectId(config_id), "user_id": str(current_user.id)})
        if not config:
            raise HTTPException(status_code=404, detail="Config not found")

        documents = []
        for file in files:
            file_name = file.filename
            if not file_name.endswith(".pdf"):
                return JSONResponse({"error": f"{file_name} is not a pdf file"}, status_code=status.HTTP_400_BAD_REQUEST)
            
            # Upload to S3 instead of saving locally
            s3_key = f"documents/{file_name}"
            s3_client.upload_fileobj(file.file, S3_BUCKET_NAME, s3_key)
            # Generate the S3 URL
            file_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
            
            # Append the document information, using the S3 URL
            documents.append(OrderedDict({"name": file_name, "address": file_url}))

        # Update the config in MongoDB with new documents
        existing_config = await configs_collection.find_one({"_id": ObjectId(config_id)})
        existing_config["config_file"]["documents"].extend(documents)
        
        update_operation = {
            "$set": {k: v for k, v in existing_config.items() if k != "_id"}
        }
        
        result = await configs_collection.update_one(
            {"_id": ObjectId(config_id)},
            update_operation
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update config with new documents")

        return JSONResponse(content={"message": "Documents added successfully", "document_urls": [doc["address"] for doc in documents]}, status_code=status.HTTP_200_OK)

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/delete-document/{config_id}")
async def delete_document(
    config_id: str,
    document_name: str = Body(..., embed=True),
    current_user: User = Depends(auth_service.get_current_user)
):
    try:
        # Find the course configuration in MongoDB and ensure it belongs to the user
        config = await configs_collection.find_one({"_id": ObjectId(config_id), "user_id": str(current_user.id)})
        if not config:
            raise HTTPException(status_code=404, detail="Config not found")

        documents = config['config_file']['documents']
        # Find the document with the specified name
        document_to_delete = next((doc for doc in documents if doc['name'] == document_name), None)
        
        if not document_to_delete:
            raise HTTPException(status_code=404, detail="Document not found in config")

        # Extract the S3 key from the URL
        s3_key = document_to_delete['address'].replace(f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/", "")
        
        # Delete the file from S3
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key)

        # Update the document list in MongoDB to remove the deleted document
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

