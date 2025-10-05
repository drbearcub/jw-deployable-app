from fastapi import FastAPI
from routers import config_router, document_router, metadata_router, auth_router, test_router
from config import app
from fastapi.middleware.cors import CORSMiddleware

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define all routers with their tags and prefixes
routers = [
    (config_router.router, "Config", "/api"),
    (document_router.router, "Documents", "/api"),
    (metadata_router.router, "Metadata", "/api"),
    (test_router.router, "Testing", "/api"),
    (auth_router.router, "Authentication", "/api/auth")
]

# Include all routers with tags for grouping in Swagger
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