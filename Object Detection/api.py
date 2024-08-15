from fastapi import FastAPI, File, UploadFile, HTTPException
from ultralytics import YOLO
from PIL import Image
import io
import sys
from predict_model import YOLOModel

app = FastAPI()
model_path = "model-80epcs/obb/train/weights/best.pt"
yolo_model = YOLOModel(model_path)

@app.get("/")
def root():
    return {"Hello" : "World"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are supported.")
    image_bytes = await file.read()
    try:
        result = yolo_model.predict(image_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
