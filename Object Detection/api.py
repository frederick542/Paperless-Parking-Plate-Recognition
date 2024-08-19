from fastapi import FastAPI, File, UploadFile, HTTPException
from ultralytics import YOLO
from predict_model import YOLOModel
import re
app = FastAPI()
model_path = "model-80epcs/obb/train/weights/best.pt"
yolo_model = YOLOModel(model_path)

@app.get("/")
def root():
    return {"Hello" : "World"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print(file.content_type )
    if file.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are supported.")
    image_bytes = await file.read()
    try:
        result = yolo_model.predict(image_bytes)
        if is_valid_indonesian_plate(result):
            return {
                 "license_plate" : result
            }
        else:
            return {
                 "message" : result
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

plate_regex = r'^[A-Z]{1,2}[0-9]{1,4}[A-Z]{1,3}$'
def is_valid_indonesian_plate(processed_text: str) -> bool:
    return re.match(plate_regex, processed_text) is not None