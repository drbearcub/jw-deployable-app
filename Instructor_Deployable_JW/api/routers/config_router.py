from datetime import datetime
from fastapi import APIRouter, Body, HTTPException, Query, status, Depends
from fastapi.responses import JSONResponse
from models.config import Config
from models.user import User
from services.auth import AuthService
from database import configs_collection
from fastapi.encoders import jsonable_encoder
from collections import OrderedDict
from bson import ObjectId
from bson.errors import InvalidId
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path='.env.local')

auth_service = AuthService()

router = APIRouter()

@router.post("/create-config")
async def create_config(
    config: Config,
    current_user: User = Depends(auth_service.get_current_user)
):
    try:
        configuration = OrderedDict({"course_name": config.course_name, "collection_name": config.course_name})
        configuration["metadata"] = OrderedDict({
            "term": config.metadata.term.value,
            "number": config.metadata.number,
            "name": config.metadata.name,
            "organization": config.metadata.organization,
            "start_date": config.metadata.start_date,
            "end_date": config.metadata.end_date
        })

        configuration["documents"] = []

        plugin_type = config.plugin.value
        plugin_name = config.plugin.lower()
        api_key_env_var = f"{plugin_name.upper()}_API_KEY"
        context_id_env_var = f"{plugin_name.upper()}_CONTEXT_ID"
        
        configuration["plugin"] = OrderedDict({"type": plugin_type})

        if plugin_type != "CommandLine":
            configuration["plugin"]["api_key"] = os.getenv(api_key_env_var, f"{plugin_name}_api_key")
            configuration["plugin"]["context_id"] = os.getenv(context_id_env_var, f"{plugin_name}_context_id")
    
        configuration["storage"] = OrderedDict({
            "type": "Directory",
            "location": "~/.cache/vtagpt/"
        })
        config_data = {
            "user_id": str(current_user.id),
            "name": config.course_name,
            "config_file": configuration,
            "active": True,
            "creation_date": datetime.now()
        }
        result = await configs_collection.insert_one(config_data)

        return JSONResponse(content={"config_id": str(result.inserted_id), "message": "Config created successfully"}, status_code=status.HTTP_201_CREATED)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/user-configs")
async def get_user_configs(
    current_user: User = Depends(auth_service.get_current_user),
    active: bool = Query(None)
):
    query = {"user_id": str(current_user.id)}
    if active is not None:
        query["active"] = active
    
    user_configs = await configs_collection.find(query).to_list(None)
    serializable_configs = []
    for config in user_configs:
        config['_id'] = str(config['_id'])
        serializable_configs.append(jsonable_encoder(config))
    
    return serializable_configs

@router.get("/config/{config_id}")
async def get_config(config_id: str, current_user: User = Depends(auth_service.get_current_user)):
    try:
        config = await configs_collection.find_one({"_id": ObjectId(config_id), "user_id": str(current_user.id)})
        if config:
            # Convert ObjectId to string for JSON serialization
            config['_id'] = str(config['_id'])
            return jsonable_encoder(config)
        raise HTTPException(status_code=404, detail="Config not found")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")

@router.put("/config/{config_id}")
async def update_config(
    config_id: str,
    updated_config: dict,
    current_user: User = Depends(auth_service.get_current_user)
):
    try:
        # Check if config exists and belongs to user
        existing_config = await configs_collection.find_one(
            {"_id": ObjectId(config_id), "user_id": str(current_user.id)}
        )
        if not existing_config:
            raise HTTPException(status_code=404, detail="Config not found")

        # Remove _id from update data if present
        if "_id" in updated_config:
            del updated_config["_id"]

        # Prepare update operation
        update_operation = {"$set": updated_config}

        result = await configs_collection.update_one(
            {"_id": ObjectId(config_id)},
            update_operation
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update config")

        # Get and return updated config
        updated = await configs_collection.find_one({"_id": ObjectId(config_id)})
        updated["_id"] = str(updated["_id"])
        return jsonable_encoder(updated)

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/deactivate-config/{config_id}")
async def deactivate_config(config_id: str, current_user: User = Depends(auth_service.get_current_user)):
    try:
        result = await configs_collection.update_one(
            {"_id": ObjectId(config_id), "user_id": str(current_user.id)},
            {"$set": {"active": False}}
        )
        if result.modified_count:
            return {"message": "Config deactivated successfully"}
        raise HTTPException(status_code=404, detail="Config not found")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")

@router.delete("/config/{config_id}")
async def delete_config(config_id: str, current_user: User = Depends(auth_service.get_current_user)):
    try:
        result = await configs_collection.delete_one({"_id": ObjectId(config_id), "user_id": str(current_user.id)})
        if result.deleted_count:
            return {"message": "Config deleted successfully"}
        raise HTTPException(status_code=404, detail="Config not found")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid config ID format")

