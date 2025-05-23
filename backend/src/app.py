import os
import shutil
import uvicorn

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional

from models.requests import UploadRequest

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

GRAPHICSCARD_POWER_MAPPING = {
    "NVIDIA A100": 450,
    "NVIDIA V100": 320,
    "NVIDIA T4": 200,
}

LOCATION_CARBON_MAPPING = {
    "france": 0.056,
    "netherlands": 0.0001,
    "germany": 0.0001,
}


app = FastAPI(title="HuggingFace API", description="API for HuggingFace URL and file uploads")


@app.post("/upload/")
async def upload_data(
    huggingface_url: str = Form(...),
    model: Optional[UploadFile] = File(None),
    dataset: Optional[UploadFile] = File(None)
):
    try:
        request_data = UploadRequest(huggingface_url=huggingface_url)

        if request_data.huggingface_url and model:
            raise HTTPException(status_code=400, detail="Either a HuggingFace URL or a model file must be provided, not both")
        elif request_data.huggingface_url:
            raise HTTPException(status_code=400, detail="HuggingFace URL is required")
        elif model and not model.filename.endswith(('.h5')):
            raise HTTPException(status_code=400, detail="Model file must be a .h5 file")
        
        if dataset and not dataset.filename.endswith(('.csv', '.json')):
            raise HTTPException(status_code=400, detail="Dataset file must be a .csv file")
        elif not dataset:
            raise HTTPException(status_code=400, detail="Dataset file is required")

        response_data = {
            "huggingface_url": request_data.huggingface_url,
            "files_received": []
        }
        
        if model:
            file_path = os.path.join(UPLOAD_DIR, f"model_{model.filename}")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(model.file, buffer)
            response_data["files_received"].append({
                "type": "model",
                "filename": model.filename,
                "saved_as": file_path
            })

        if dataset:
            file_path = os.path.join(UPLOAD_DIR, f"dataset_{dataset.filename}")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(dataset.file, buffer)
            response_data["files_received"].append({
                "type": "dataset",
                "filename": dataset.filename,
                "saved_as": file_path
            })
            
        return JSONResponse(
            content=response_data,
            status_code=200
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
