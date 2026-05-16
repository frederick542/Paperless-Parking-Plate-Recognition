import re
import cv2 as cv
import requests
import numpy as np
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi import Response
import supervision as sv
from ultralytics import YOLO
from paddleocr import PaddleOCR
from io import BytesIO
from PIL import Image

app = FastAPI()

model = None
cameraEndpoint = 'http://10.67.117.1/'
beServer = "http://10.67.117.90:3000/"


ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)

plate_pattern = re.compile(r"[A-Z]{1,2}\s*\d{1,4}\s*[A-Z]{1,3}")
model_path = "runs/ptc_train/yolo11n_ptc/weights/best.pt"

async def register_parking(plat_number: str):
    url = f"{beServer}v1/parking/"
    headers = {"Content-Type": "application/json"}

    data = {
        "userid": plat_number,
        "parkingtypeid": "50297d13-86de-41e7-ad5e-8b223a71091f"
    }

    try:
        print(f"Sending JSON body: {json.dumps(data)}")
        response = requests.post(url, headers=headers, json=data, timeout=10)

        print(f"Registering parking result: {response.status_code}")

        if response.status_code == 200 or response.status_code == 201:
            print("✅ Parking registered successfully — trigger servo action here")
        else:
            print(f"⚠️ Failed: {response.text}")

    except requests.RequestException as e:
        print(f"❌ Error: {e}")

class PlatNomor:
    def __init__(self, model_path: str):
        self.model = YOLO(model_path)

    def predict(self, image_input):
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
            image_cv = np.array(image)[..., ::-1]
        else:
            image_cv = image_input

        results = self.model(image_cv)
        detections = sv.Detections.from_ultralytics(results[0])
        license_plates = self.extract_license_plates(image_cv, detections)
        return license_plates

    def extract_license_plates(self, image, detections):
        plates = []
        for xyxy in detections.xyxy:
            x1, y1, x2, y2 = map(int, xyxy)
            crop = image[y1:y2, x1:x2]
            plates.append(crop)
        return plates

detector = PlatNomor(model_path)

def auto_rotate_crop(crop):
    gray = cv.cvtColor(crop, cv.COLOR_BGR2GRAY)
    edges = cv.Canny(gray, 50, 150)
    lines = cv.HoughLines(edges, 1, np.pi / 180, 100)
    if lines is None:
        return crop

    angles = []
    for _, theta in lines[:, 0]:
        angle = (theta * 180 / np.pi) - 90
        if -45 < angle < 45:
            angles.append(angle)
    if len(angles) == 0:
        return crop

    median_angle = np.median(angles)
    (h, w) = crop.shape[:2]
    M = cv.getRotationMatrix2D((w // 2, h // 2), median_angle, 1.0)
    rotated = cv.warpAffine(crop, M, (w, h), flags=cv.INTER_LINEAR, borderMode=cv.BORDER_REPLICATE)
    return rotated

@app.post("/train")
def train_model():
    global detector
    model = YOLO("yolo11n.pt")
    model.train(
        data="./Plat Nomor Kendaraan Indonesia.v1i.yolov11/data.yaml",
        epochs=60,
        imgsz=640,
        batch=16,
        project="runs/ptc_train",
        name="yolo11n_ptc",
        pretrained=True
    )
    detector = PlatNomor(model_path)
    return {"status": "training complete", "weights": "runs/ptc_train/yolo11n_ptc/weights/best.pt"}

@app.post("/detect")
async def detect_plate():
    global detector
    if detector is None:
        raise HTTPException(status_code=400, detail="Model not found. Train first.")

    camera_url = f"{cameraEndpoint}capture"
    try:
        response = requests.get(camera_url, timeout=20)
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image from camera: {e}")

    image_bytes = BytesIO(response.content)
    image = np.array(Image.open(image_bytes).convert("RGB"))

    license_plates = detector.predict(image)
    detected_plates = []

    for _ , crop in enumerate(license_plates):
        fixed_crop = auto_rotate_crop(crop)

        fixed_crop_rgb = cv.cvtColor(fixed_crop, cv.COLOR_BGR2RGB)
        result = ocr.predict(input=fixed_crop_rgb)

        result_text = ""
        plate_candidates = []

        for res in result:
            result_text += "".join(res["rec_texts"])
            
            for text in res["rec_texts"]:
                cleaned = text.replace(" ", "")
                plate_candidates.append(cleaned)
        matches = plate_pattern.findall(result_text)

        detected_plates = []
        for match in matches:
            detected_plates.append({
                "plate": match
            })

        if not detected_plates:
            print("No valid license plate detected")
        else:
            for p in detected_plates:
                print(f"Detected Plate: {p['plate']}")

            
    if not detected_plates:
        raise HTTPException(status_code=400, detail="No valid license plate detected")
    
    plate_text = detected_plates[0]['plate'].encode("ascii", "ignore").decode()

    response_body = json.dumps({"plate": plate_text})
    await register_parking(plate_text)

    return Response(
        content=response_body,
        media_type="application/json",
        headers={"Content-Length": str(len(response_body.encode("utf-8")))}
    )

@app.get("/")
def root():
    return {"message": "YOLO Plate Detection API is running!"}
