from fastapi import APIRouter
from models.config import TermYearEnum, Organization, PluginType

router = APIRouter()

@router.get("/term-years")
async def get_term_years():
    return [term.value for term in TermYearEnum]

@router.get("/organizations")
async def get_organizations():
    return [org.value for org in Organization]

@router.get("/plugin-types")
async def get_plugin_types():
    return [plugin_type.value for plugin_type in PluginType]