from datetime import datetime
from enum import Enum
from pydantic import BaseModel  

class TermYearEnum(str, Enum):
    fall_current_year = f"Fall {datetime.now().year}"
    winter_current_year = f"Winter {datetime.now().year}"
    spring_current_year = f"Spring {datetime.now().year}"
    summer_current_year = f"Summer {datetime.now().year}"
    fall_next_year = f"Fall {datetime.now().year+1}"
    winter_next_year = f"Winter {datetime.now().year+1}"
    spring_next_year = f"Spring {datetime.now().year+1}"
    summer_next_year = f"Summer {datetime.now().year+1}"

class Organization(str, Enum):
    GT = "Georgia Institute of Technology"
    WC = "Wiregrass College"

class PluginType(str, Enum):
    canvas = "CanvasLTI"
    vera = "VERA"
    edstem = "EdStem"
    blackboard = "Blackboard"
    command_line = "CommandLine"

class Metadata(BaseModel):
    term: TermYearEnum
    number: str
    name: str
    organization: str
    start_date: datetime
    end_date: datetime

class Documents(BaseModel):
    name: str
    address: str

class Config(BaseModel):
    course_name: str
    metadata: Metadata
    plugin: PluginType