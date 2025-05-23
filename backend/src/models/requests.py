from pydantic import BaseModel, HttpUrl

class UploadRequest(BaseModel):
    huggingface_url: HttpUrl