from fastapi import FastAPI
from api.routers import config_router, document_router, metadata_router, auth_router, test_router
from config import app
from fastapi.middleware.cors import CORSMiddleware
from api.routers.scraper_router import router as scraper_router

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://cristina.cjdns.pkt.wiki:3000"],  # Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = [
    (config_router.router, "Config", "/api"),
    (document_router.router, "Documents", "/api"),
    (metadata_router.router, "Metadata", "/api"),
    (test_router.router, "Testing", "/api"),
    (auth_router.router, "Authentication", "/api/auth"),
    (scraper_router, "Scraper", "/api")
]

for router, tag, prefix in routers:
    app.include_router(router, prefix=prefix, tags=[tag])

@app.get("/", tags=["Root"])
async def hello_world():
    return {"message": "Hello, World!"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)