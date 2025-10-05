from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from api.models.helpers import PyObjectId
from bson import ObjectId


class CourseIn(BaseModel):
    name: str
    curriculum_url: Optional[HttpUrl] = None


class CourseInDB(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    curriculum_url: Optional[HttpUrl] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        populate_by_name = True


class CourseOut(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    curriculum_url: Optional[HttpUrl] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
