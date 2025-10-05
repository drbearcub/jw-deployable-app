from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import subprocess
import uuid

router = APIRouter()

class ScrapeRequest(BaseModel):
    url: str

@router.post("/scrape-and-generate")
async def scrape_and_generate(payload: ScrapeRequest, request: Request):
    uid = str(uuid.uuid4())
    json_path = f"/tmp/scraped_content_{uid}.json"
    pdf_path = f"/tmp/scraped_summary_{uid}.pdf"

    try:
        subprocess.run(
            ["python3", "api/generic_scraper.py", payload.url, json_path],
            check=True
        )
        subprocess.run(
            ["python3", "api/json_to_pdf_generic.py", json_path, pdf_path],
            check=True
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Subprocess failed: {e}")

    return {"message": "✅ PDF generated", "pdf_path": pdf_path}
